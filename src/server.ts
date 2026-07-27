// src/server.ts
import express from "express";
import http from "http";
import WebSocket from "ws";
import bodyParser from "body-parser";
import { v4 as uuidv4 } from "uuid";
import { RoomManager } from "./rooms/GameRoom";
import { PluginManager } from "./plugins/pluginManager";

const PORT = process.env.PORT ? Number(process.env.PORT) : 3000;

const app = express();
app.use(bodyParser.json());

// Simple in-memory stores for prototype
const pluginManager = new PluginManager();
const roomManager = new RoomManager(pluginManager);

// HTTP: basic health
app.get("/health", (req, res) => res.json({ ok: true }));

// HTTP: register client module descriptor (the APK can POST here to announce modules)
// Example body: { clientId: "abc", modules: [{ name: "shop", version: "1.0", endpoints: ["/shop/buy"] }] }
app.post("/modules/register", (req, res) => {
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
app.post("/admin/plugin/reload", (req, res) => {
  try {
    pluginManager.reloadAll();
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

wss.on("connection", (ws: WebSocket, req) => {
  const clientId = uuidv4();
  ws.on("message", (data) => {
    try {
      const str = data.toString();
      const msg = JSON.parse(str);
      if (msg.type === "join") {
        const roomId = roomManager.joinRandomRoom(ws, msg.playerName || `player-${clientId}`);
        ws.send(JSON.stringify({ type: "joined", roomId }));
      } else if (msg.type === "input") {
        // route to room
        roomManager.routeInput(msg.roomId, msg.playerId, msg.input);
      }
    } catch (err) {
      console.error("ws message error", err);
    }
  });

  ws.on("close", () => {
    roomManager.disconnectClient(ws);
  });
});

server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

// start matchmaker/cleanup loop
roomManager.start();
