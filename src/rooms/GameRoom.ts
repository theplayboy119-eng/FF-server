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

export class RoomManager {
  private rooms: Map<string, { id: string; players: Map<string, Player>; addPlayer: (player: Player) => void }> = new Map();

  constructor() {}

  public createRoom() {
    const roomId = Math.random().toString(36).slice(2, 9);
    
    const room = {
      id: roomId,
      players: new Map<string, Player>(),
      addPlayer(player: Player) {
        this.players.set(player.id, player);
      }
    };

    this.rooms.set(roomId, room);
    return room;
  }

  joinRandomRoom(ws: WebSocket, playerName: string, sessionId?: string) {
    for (const r of this.rooms.values()) {
      if (r.players.size < 8) {
        const pid = Math.random().toString(36).slice(2, 9);
        const player: Player = { id: pid, name: playerName, ws, x: 0, y: 0, hp: 100, sessionId };
        r.addPlayer(player);
        return { roomId: r.id, playerId: pid };
      }
    }
    const newRoom = this.createRoom();
    const pid = Math.random().toString(36).slice(2, 9);
    const player: Player = { id: pid, name: playerName, ws, x: 0, y: 0, hp: 100, sessionId };
    newRoom.addPlayer(player);
    return { roomId: newRoom.id, playerId: pid };
  }

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
