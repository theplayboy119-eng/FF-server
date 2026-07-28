import express from "express";
import http from "http";
import WebSocket from "ws";
import bodyParser from "body-parser";
import { v4 as uuidv4 } from "uuid";
import { RoomManager } from "./rooms/GameRoom";
import { PluginManager } from "./plugins/pluginManager";
import dotenv from 'dotenv';
import path from 'path';
import authRouter from './auth/index';
import { matchmaker } from './matchmaking/matchmaker';
import { redis } from './lib/redis';
import { decodeMessage, encodeJoinResponse, encodeSnapshot, encodeQueued } from './ws/protocol';

dotenv.config();

const PORT = process.env.PORT ? Number(process.env.PORT) : 3000;

const app = express();
app.use(bodyParser.json());

// serve client static files
app.use(express.static(path.join(__dirname, '../client')));

// mount auth
app.use('/auth', authRouter);

// Simple in-memory stores for prototype
const pluginManager = new PluginManager();
const roomManager = new RoomManager(pluginManager);
matchmaker.init(roomManager);

// HTTP: basic health
app.get("/health", (req: any, res: any) => res.json({ ok: true }));

// HTTP: register client module descriptor (the APK can POST here to announce modules)
// Example body: { clientId: "abc", modules: [{ name: "shop", version: "1.0", endpoints: ["/shop/buy"] }] }
app.post("/modules/register", (req: any, res: any) => {
  try {
    const descriptor = req.body;
    if (!descriptor || !descriptor.clientId) return res.status(400).json({ error: "missing clientId" });
    pluginManager.registerClientDescriptor(descriptor.clientId, descriptor);
    return res.json({ ok: true });
  } catch (err) {
    return res.status(500).json({ error: String(err) });
  }
});

// HTTP: call plugin hook / admin operations
app.post("/admin/plugin/reload", (req: any, res: any) => {
  try {
    pluginManager.reloadAll();
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

wss.on("connection", (ws: WebSocket, req: any) => {
  const clientId = uuidv4();

  ws.on("message", async (data: any) => {
    try {
      const decoded = decodeMessage(data);
      if (!decoded) return;
      const { type, payload, isBinary } = decoded as any;

      if (type === 'join') {
        const playerName = payload.playerName || `player-${clientId}`;
        const matchmaking = payload.matchmaking || false;
        const providedSession = payload.sessionId || null;

        // create a session id (for resume) or use provided
        const sessionId = providedSession || uuidv4();

        // store a short-lived mapping for resume
        await redis.setex(`session:${sessionId}`, 300, JSON.stringify({ connected: true }));

        if (matchmaking) {
          // register WS for potential notifications and enqueue
          matchmaker.registerWs(sessionId, ws);
          await matchmaker.enqueue({ sessionId, playerName });
          // send queued response
          if (isBinary) ws.send(encodeQueued({ queued: true, sessionId })); else ws.send(JSON.stringify({ type: 'queued', queued: true, sessionId }));
          return;
        }

        // immediate join
        const res = roomManager.joinRandomRoom(ws, playerName, sessionId as any);
        // store mapping session -> room/player
        await redis.setex(`session:${sessionId}`, 300, JSON.stringify(res));

        // send joined (binary if client used binary)
        if (isBinary) ws.send(encodeJoinResponse({ roomId: res.roomId, playerId: res.playerId, sessionId })); else ws.send(JSON.stringify({ type: 'joined', roomId: res.roomId, playerId: res.playerId, sessionId }));

      } else if (type === 'input') {
        // route to room
        const input = payload;
        roomManager.routeInput(input.roomId, input.playerId, { type: input.inputType, dx: input.dx, dy: input.dy });

      } else if (type === 'resume') {
        const sessionId = payload.sessionId;
        if (!sessionId) return;
        const res = roomManager.resumeSession(sessionId, ws as any);
        if (res) {
          // update redis mapping TTL
          await redis.setex(`session:${sessionId}`, 300, JSON.stringify(res));
          if (isBinary) ws.send(encodeJoinResponse({ roomId: res.roomId, playerId: res.playerId, sessionId })); else ws.send(JSON.stringify({ type: 'joined', roomId: res.roomId, playerId: res.playerId, sessionId }));
        } else {
          if (isBinary) ws.send(encodeQueued({ queued: false })); else ws.send(JSON.stringify({ type: 'error', error: 'resume_failed' }));
        }
      }

    } catch (err) {
      console.error("ws message error", err);
    }
  });

  ws.on("close", () => {
    // no-op: players remain in rooms for a TTL to allow resume
  });
});

server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

// start matchmaker/cleanup loop
roomManager.start();
