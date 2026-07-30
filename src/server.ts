import express from 'express';
import http from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import bodyParser from 'body-parser';
import { handleLogin } from './auth';
import { GameRoom } from './rooms/GameRoom';
import { db } from './lib/db';

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Route racine pour vérifier l'état du serveur
app.get('/', (req, res) => {
  res.status(200).json({ status: 'online', message: 'Free Fire Private Server Core is running' });
});

// Routes d'authentification pour l'APK
app.post('/api/auth/facebook', handleLogin);
app.post('/api/auth/google', handleLogin);
app.post('/api/auth/garena', handleLogin);
app.post('/api/auth/vk', handleLogin);
app.post('/api/auth/line', handleLogin);

// Gestion des connexions WebSocket pour les salles de jeu / matchmakings
const activeRooms = new Map<string, GameRoom>();

wss.on('connection', (ws: WebSocket, req) => {
  console.log('Nouveau client WebSocket connecté depuis :', req.socket.remoteAddress);

  // Exemple d'initialisation d'une room par défaut
  let roomId = 'default_room';
  let room = activeRooms.get(roomId);
  if (!room) {
    room = new GameRoom(roomId);
    activeRooms.set(roomId, room);
  }

  room.addClient(ws);

  ws.on('message', (message: string) => {
    try {
      const data = JSON.parse(message.toString());
      console.log('Message reçu du client :', data);
      // Traitement des paquets du protocole de jeu
      room?.handleMessage(ws, data);
    } catch (e) {
      console.error('Erreur lors du traitement du message WebSocket :', e);
    }
  });

  ws.on('close', () => {
    console.log('Client WebSocket déconnecté');
    room?.removeClient(ws);
  });
});

server.listen(PORT, () => {
  console.log(`Serveur complet démarré et en écoute sur le port ${PORT}`);
});
