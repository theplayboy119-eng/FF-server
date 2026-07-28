--- a/src/rooms/GameRoom.ts
+++ b/src/rooms/GameRoom.ts
@@
 type Player = {
   id: string;
   name: string;
   ws: WebSocket;
   x: number;
   y: number;
   hp: number;
+  sessionId?: string;
 };
@@
-  joinRandomRoom(ws: WebSocket, playerName: string) {
+  joinRandomRoom(ws: WebSocket, playerName: string, sessionId?: string) {
     // find room with capacity (<8)
     for (const r of this.rooms.values()) {
       if (r.players.size < 8) {
         const pid = Math.random().toString(36).slice(2, 9);
-        r.addPlayer({ id: pid, name: playerName, ws, x: 0, y: 0, hp: 100 });
-        return r.id;
+        r.addPlayer({ id: pid, name: playerName, ws, x: 0, y: 0, hp: 100, sessionId });
+        return { roomId: r.id, playerId: pid };
       }
     }
-    const newRoom = this.createRoom();
-    const pid = Math.random().toString(36).slice(2, 9);
-    newRoom.addPlayer({ id: pid, name: playerName, ws, x: 0, y: 0, hp: 100 });
-    return newRoom.id;
+    const newRoom = this.createRoom();
+    const pid = Math.random().toString(36).slice(2, 9);
+    newRoom.addPlayer({ id: pid, name: playerName, ws, x: 0, y: 0, hp: 100, sessionId });
+    return { roomId: newRoom.id, playerId: pid };
   }
+
+  // resume a session: reattach ws to an existing player by sessionId
+  resumeSession(sessionId: string, ws: WebSocket) {
+    for (const r of this.rooms.values()) {
+      for (const p of r.players.values()) {
+        if (p.sessionId === sessionId) {
+          p.ws = ws;
+          return { roomId: r.id, playerId: p.id };
+        }
+      }
+    }
+    return null;
+  }
*** End Patch
