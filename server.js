const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logueur de requêtes
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// 1. Interception de la boîte de dialogue OAuth (Facebook / Garena SDK)
app.get(['/v9.0/dialog/oauth', '/dialog/oauth', '/oauth/authorize'], (req, res) => {
  console.log("--> Tentative OAuth interceptée ! Redirection automatique vers l'APK...");
  
  const redirectUri = req.query.redirect_uri || 'fbconnect://success';
  const mockAccessToken = "EAAGm0PX4ZK4BAO1234567890abcdefghijklmnopqrstuvwxyz";
  
  // Si le SDK attend une redirection deeplink dans la WebView
  const targetUrl = `${redirectUri}#access_token=${mockAccessToken}&expires_in=5184000`;
  
  // On renvoie un petit script HTML qui force la redirection immédiate
  res.send(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Authentification Réussie</title>
      </head>
      <body>
        <h3>Connexion au Serveur Privé réussie ! Redirection...</h3>
        <script>
          window.location.href = "${targetUrl}";
        </script>
      </body>
    </html>
  `);
});

// 2. Interception des requêtes d'API de jeton et profils
app.all(['/oauth/token', '/oauth/login', '/api/v1/auth', '/user/login', '/v9.0/me'], (req, res) => {
  console.log("--> Validation de session (Token API) !");
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

// Route racine
app.get('/', (req, res) => {
  res.send('Serveur Privé Free Fire 2022 Actif !');
});

// Attrape-tout pour repérer d'autres routes si besoin
app.use((req, res) => {
  console.log("--> Route inconnue appelée :", req.url);
  res.status(200).json({
    error: 0,
    status: "ok"
  });
});

app.listen(PORT, () => {
  console.log(`Serveur prêt sur le port ${PORT}`);
});
  
