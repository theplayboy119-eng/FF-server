const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware pour parser le JSON et les formulaires
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Loguer toutes les requetes entrantes pour inspection
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  console.log('Headers:', req.headers);
  console.log('Body:', req.body);
  next();
});

// Route principale de connexion (SDK Beetalk / Garena)
app.all(['/oauth/token', '/oauth/login', '/api/v1/auth', '/user/login'], (req, res) => {
  console.log("--> Tentative de connexion reçue !");

  // Reponse standard attendue par AuthToken / GGLoginSession
  res.status(200).json({
    error: 0,
    error_code: 0,
    status: "success",
    access_token: "ff2022_private_token_xyz987654321",
    refresh_token: "ff2022_refresh_token_abc123456789",
    open_id: "88888888",
    account_id: "88888888",
    uid: "88888888",
    expiry_time: 2147483647, // Valide pour toujours
    token_type: "Bearer"
  });
});

// Route de test
app.get('/', (req, res) => {
  res.send('Serveur Prive Free Fire 2022 fonctionnel !');
});

// Route catch-all si l'APK appelle une autre URL
app.use((req, res) => {
  console.log("--> Route inconnue appelee :", req.url);
  res.status(200).json({
    error: 0,
    status: "ok",
    message: "Route interceptee"
  });
});

app.listen(PORT, () => {
  console.log(`Serveur lance sur le port ${PORT}`);
});
                                                                          
