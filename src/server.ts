import express from 'express';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import dotenv from 'dotenv';
import authRouter from './auth'; // Importation du routeur d'authentification

// Charger les variables d'environnement
dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new SocketIOServer(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Middlewares globaux
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ==========================================
// ROUTE PRINCIPALE (Page d'accueil / Lobby)
// ==========================================
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="fr">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Free Fire - Connexion</title>
        <style>
            body {
                background-color: #121212;
                color: #ffffff;
                font-family: Arial, sans-serif;
                text-align: center;
                padding: 20px;
                margin: 0;
            }
            .container {
                max-width: 400px;
                margin: 50px auto;
                background: #1e1e1e;
                padding: 30px;
                border-radius: 10px;
                box-shadow: 0 4px 15px rgba(0,0,0,0.5);
            }
            h2 {
                color: #4CAF50;
                margin-bottom: 10px;
            }
            p {
                color: #b0b0b0;
                font-size: 14px;
                margin-bottom: 25px;
            }
            .btn-facebook {
                background-color: #1877F2;
                color: white;
                border: none;
                padding: 12px 20px;
                font-size: 16px;
                font-weight: bold;
                border-radius: 5px;
                width: 100%;
                cursor: pointer;
                display: block;
                text-decoration: none;
            }
            .btn-facebook:hover {
                background-color: #166fe5;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <h2>Vérification Réussie !</h2>
            <p>Le serveur privé a validé votre accès. Veuillez lier un compte Facebook actif pour vous connecter et accéder au lobby du jeu.</p>
            <form action="/auth/facebook" method="GET">
                <button type="submit" class="btn-facebook">Se connecter avec Facebook</button>
            </form>
        </div>
    </body>
    </html>
  `);
});

// ==========================================
// MONTAGE DES ROUTES D'AUTHENTIFICATION
// ==========================================
// Toutes les routes définies dans src/auth/index.ts seront préfixées par /auth
// Le bouton du formulaire ci-dessus enverra donc vers /auth/facebook
app.use('/auth', authRouter);

// ==========================================
// CONFIGURATION SOCKET.IO
// ==========================================
io.on('connection', (socket) => {
  console.log(`Un client s'est connecté : ${socket.id}`);

  socket.on('disconnect', () => {
    console.log(`Client déconnecté : ${socket.id}`);
  });
});

// Démarrage du serveur
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Serveur démarré et en écoute sur le port ${PORT}`);
});
