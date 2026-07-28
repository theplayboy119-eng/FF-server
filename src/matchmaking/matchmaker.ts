import { redis } from '../lib/redis';
import { RoomManager } from '../rooms/GameRoom';
import { v4 as uuidv4 } from 'uuid';
import WebSocket from 'ws';

// Simple matchmaking: enqueue sessionId and playerName to Redis list 'matchmaking'
// Worker pops pairs and asks the RoomManager to create a room for them.

type QueuedPlayer = { sessionId: string; playerName: string };

class Matchmaker {
  roomManager: RoomManager | null = null;
  wsMap: Map<string, WebSocket> = new Map(); // sessionId -> ws
  running = false;
  intervalMs = 1000;

  init(roomManager: RoomManager) {
    this.roomManager = roomManager;
    if (!this.running) {
      this.running = true;
      setInterval(() => this.tick(), this.intervalMs);
    }
  }

  registerWs(sessionId: string, ws: WebSocket) {
    this.wsMap.set(sessionId, ws);
  }

  unregisterWs(sessionId: string) {
    this.wsMap.delete(sessionId);
  }

  async enqueue(player: QueuedPlayer) {
    await redis.lpush('matchmaking', JSON.stringify(player));
  }

  async tick() {
    // try to pop two players
    try {
      const aRaw = await redis.rpop('matchmaking');
      if (!aRaw) return;
      const bRaw = await redis.rpop('matchmaking');
      if (!bRaw) {
        // push back a
        await redis.lpush('matchmaking', aRaw);
        return;
      }
      const a: QueuedPlayer = JSON.parse(aRaw);
      const b: QueuedPlayer = JSON.parse(bRaw);
      // create room and add players
      if (!this.roomManager) return;
      const room = this.roomManager.createRoom();
      const pidA = Math.random().toString(36).slice(2, 9);
      const pidB = Math.random().toString(36).slice(2, 9);
      // add players
      const wsA = this.wsMap.get(a.sessionId);
      const wsB = this.wsMap.get(b.sessionId);
      room.addPlayer({ id: pidA, name: a.playerName, ws: wsA as any, x: 0, y: 0, hp: 100, sessionId: a.sessionId });
      room.addPlayer({ id: pidB, name: b.playerName, ws: wsB as any, x: 0, y: 0, hp: 100, sessionId: b.sessionId });
      // store session mapping in redis for resume
      await redis.setex(`session:${a.sessionId}`, 300, JSON.stringify({ roomId: room.id, playerId: pidA }));
      await redis.setex(`session:${b.sessionId}`, 300, JSON.stringify({ roomId: room.id, playerId: pidB }));

      // notify connected websockets
      try { if (wsA && wsA.readyState === wsA.OPEN) wsA.send(JSON.stringify({ type: 'joined', roomId: room.id, playerId: pidA, sessionId: a.sessionId })); } catch (e) {}
      try { if (wsB && wsB.readyState === wsB.OPEN) wsB.send(JSON.stringify({ type: 'joined', roomId: room.id, playerId: pidB, sessionId: b.sessionId })); } catch (e) {}

    } catch (err) {
      console.error('matchmaker tick error', err);
    }
  }
}

export const matchmaker = new Matchmaker();
