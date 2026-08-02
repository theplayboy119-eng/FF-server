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
  if (Object.keys(req.body).length > 0) {
    console.log("Body:", JSON.stringify(req.body));
  }
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

// 3. Routes spécifiques d'échange de jetons du SDK Garena (SDKConstants)
app.all([
  '/oauth/token/facebook/exchange',
  '/oauth/token/google/exchange',
  '/oauth/token/line/exchange',
  '/oauth/token/twitter/exchange',
  '/oauth/token/vk/exchange/v2',
  '/oauth/token/wechat/exchange',
  '/oauth/token',
  '/oauth/login'
], (req, res) => {
  console.log("--> Échange de jeton Garena SDK intercepté !");
  res.status(200).json({
    error: 0,
    error_code: 0,
    status: "success",
    open_id: "88888888",
    access_token: "ff2022_private_token_xyz987654321",
    refresh_token: "ff2022_refresh_token_abc123456789",
    expiry_time: 2147483647,
    platform: 1
  });
});

// 4. Validation de paiement (API_PAY_CHANNEL_SUCCESS_URL)
app.all('/api/pay/channel/success', (req, res) => {
  console.log("--> Validation de paiement interceptée !");
  res.status(200).json({
    status: 0,
    message: "success"
  });
});

// 5. Validation de session et échange de Jetons API généraux
app.all([
  '/oauth/access_token',
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

// 6. Route attrape-tout (Catch-all) pour intercepter et logger n'importe quelle autre route
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
  
