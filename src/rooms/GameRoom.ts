// src/rooms/GameRoom.ts
import WebSocket from "ws";
import { PluginManager } from "../plugins/pluginManager";

type Player = {
  id: string;
  name: string;
  ws: WebSocket;
  x: number;
  y: number;
  hp: number;
};

export class Room {
  id: string;
  players: Map<string, Player> = new Map();
  tickRate: number;
  running: boolean = false;
  pluginManager: PluginManager;
  tickHandle: NodeJS.Timeout | null = null;
  tickIndex: number = 0;

  constructor(id: string, pluginManager: PluginManager, tickRate = 20) {
    this.id = id;
    this.tickRate = tickRate;
    this.pluginManager = pluginManager;
  }

  start() {
    if (this.running) return;
    this.running = true;
    const ms = 1000 / this.tickRate;
    this.tickHandle = setInterval(() => this.tick(), ms);
  }

  stop() {
    if (this.tickHandle) clearInterval(this.tickHandle as any);
    this.running = false;
  }

  addPlayer(p: Player) {
    this.players.set(p.id, p);
  }

  removePlayer(id: string) {
    this.players.delete(id);
  }

  applyInput(playerId: string, input: any) {
    const p = this.players.get(playerId);
    if (!p) return;
    // Very simple input handling: move or shoot
    if (input.type === "move") {
      p.x += (input.dx || 0);
      p.y += (input.dy || 0);
    } else if (input.type === "shoot") {
      // plugin hook: allow server-side rules to modify behavior
      this.pluginManager.emit("onPlayerShoot", { room: this, player: p, input });
      // naive hit: damage anyone within small radius
      this.players.forEach((other) => {
        if (other.id === p.id) return;
        const dx = other.x - p.x;
        const dy = other.y - p.y;
        const dist2 = dx * dx + dy * dy;
        if (dist2 < 100) {
          other.hp -= 10;
        }
      });
    }
  }

  tick() {
    this.tickIndex += 1;
    // basic game logic per tick
    // remove dead players
    for (const [id, p] of this.players.entries()) {
      if (p.hp <= 0) {
        this.players.delete(id);
        try { p.ws.send(JSON.stringify({ type: "killed" })); } catch (e) {}
      }
    }

    // broadcast snapshot to players (interest management: all in prototype)
    const entities = Array.from(this.players.values()).map((p) => ({ id: p.id, x: p.x, y: p.y, hp: p.hp }));
    const snapshot = { type: "snapshot", tick: this.tickIndex, entities };
    for (const p of this.players.values()) {
      try {
        p.ws.send(JSON.stringify(snapshot));
      } catch (e) {
        // ignore send errors
      }
    }
  }
}

export class RoomManager {
  rooms: Map<string, Room> = new Map();
  pluginManager: PluginManager;
  tickRate: number;

  constructor(pluginManager: PluginManager, tickRate = 20) {
    this.pluginManager = pluginManager;
    this.tickRate = tickRate;
  }

  start() {
    // cleanup loop could be added here
  }

  createRoom() {
    const id = Math.random().toString(36).slice(2, 9);
    const room = new Room(id, this.pluginManager, this.tickRate);
    room.start();
    this.rooms.set(id, room);
    return room;
  }

  joinRandomRoom(ws: WebSocket, playerName: string) {
    // find room with capacity (<8)
    for (const r of this.rooms.values()) {
      if (r.players.size < 8) {
        const pid = Math.random().toString(36).slice(2, 9);
        r.addPlayer({ id: pid, name: playerName, ws, x: 0, y: 0, hp: 100 });
        return r.id;
      }
    }
    const newRoom = this.createRoom();
    const pid = Math.random().toString(36).slice(2, 9);
    newRoom.addPlayer({ id: pid, name: playerName, ws, x: 0, y: 0, hp: 100 });
    return newRoom.id;
  }

  routeInput(roomId: string, playerId: string, input: any) {
    const room = this.rooms.get(roomId);
    if (!room) return;
    room.applyInput(playerId, input);
  }

  disconnectClient(ws: WebSocket) {
    for (const r of this.rooms.values()) {
      for (const p of r.players.values()) {
        if (p.ws === ws) {
          r.removePlayer(p.id);
        }
      }
    }
  }
}
