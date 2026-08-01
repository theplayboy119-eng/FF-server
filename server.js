const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 10000;

// Middlewares basiques
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logueur global pour suivre toutes les requêtes en temps réel
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// 1. Route racine pour vérifier que le serveur tourne
app.get('/', (req, res) => {
  res.send('Serveur Privé Free Fire 2022 Actif !');
});

// 2. Interception OAuth (Facebook / Garena SDK) avec redirection HTTP 302 brute
app.get(['/v9.0/dialog/oauth', '/dialog/oauth', '/oauth/authorize'], (req, res) => {
  console.log("--> Interception OAuth ! Redirection HTTP 302 en cours...");
  
  const redirectUri = req.query.redirect_uri || 'fbconnect://success';
  const mockAccessToken = "EAAGm0PX4ZK4BAO1234567890abcdefghijklmnopqrstuvwxyz";
  
  // Format exact de retour attendu par le SDK
  const targetUrl = `${redirectUri}#access_token=${mockAccessToken}&expires_in=5184000&data_access_expiration_time=1700000000`;
  
  // Redirection HTTP 302 pour forcer la WebView Android à capturer le deeplink
  return res.redirect(302, targetUrl);
});

// 3. Validation de session et échange de Jetons API
app.all([
  '/oauth/access_token',
  '/oauth/login',
  '/api/v1/auth',
  '/user/login',
  '/v9.0/me',
  '/v9.0/oauth/access_token'
], (req, res) => {
  console.log("--> Validation de session API déclenchée !");
  res.status(200).json({
    error: 0,
    error_code: 0,
    status: "success",
    access_token: "ff2022_private_token_xyz987654321",
    refresh_token: "ff2022_refresh_token_abc123456789",
    open_id: "88888888",
    account_id: "88888888",
    uid: "88888888",
    id: "88888888",
    name: "Joueur Prive",
    expiry_time: 2147483647
  });
});

// 4. Route attrape-tout (Catch-all) pour intercepter et logger n'importe quelle autre route
app.use((req, res) => {
  console.log("--> Route inconnue appelée :", req.url);
  res.status(200).json({
    error: 0,
    status: "ok",
    message: "Route interceptee"
  });
});

// Démarrage du serveur
app.listen(PORT, () => {
  console.log(`Serveur prêt sur le port ${PORT}`);
});
  
