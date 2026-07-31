import { WebSocket } from 'ws';

type Player = {
  id: string;
  name: string;
  ws: WebSocket;
  x: number;
  y: number;
  hp: number;
  sessionId?: string;
};

export class GameRoomManager {
  private rooms: Map<string, { id: string; players: Map<string, Player> }> = new Map();

  constructor() {}

  public createRoom() {
    const roomId = Math.random().toString(36).slice(2, 9);
    const room = { id: roomId, players: new Map<string, Player>() };
    this.rooms.set(roomId, room);
    return room;
  }

  joinRandomRoom(ws: WebSocket, playerName: string, sessionId?: string) {
    // Trouver un salon avec une capacité de moins de 8 joueurs
    for (const r of this.rooms.values()) {
      if (r.players.size < 8) {
        const pid = Math.random().toString(36).slice(2, 9);
        r.players.set(pid, { id: pid, name: playerName, ws, x: 0, y: 0, hp: 100, sessionId });
        return { roomId: r.id, playerId: pid };
      }
    }
    // Sinon, créer un nouveau salon
    const newRoom = this.createRoom();
    const pid = Math.random().toString(36).slice(2, 9);
    newRoom.players.set(pid, { id: pid, name: playerName, ws, x: 0, y: 0, hp: 100, sessionId });
    return { roomId: newRoom.id, playerId: pid };
  }

  // Reprendre une session : rattacher un nouveau WebSocket à un joueur existant via son sessionId
  resumeSession(sessionId: string, ws: WebSocket) {
    for (const r of this.rooms.values()) {
      for (const p of r.players.values()) {
        if (p.sessionId === sessionId) {
          p.ws = ws;
          return { roomId: r.id, playerId: p.id };
        }
      }
    }
    return null;
  }
     }
