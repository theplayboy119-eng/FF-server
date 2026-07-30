import express from 'express';
import bodyParser from 'body-parser';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Route racine pour éviter le "Cannot GET /"
app.get('/', (req, res) => {
  res.status(200).json({ status: 'online', message: 'Free Fire Private Server is running' });
});

// Endpoint d'échange de token Facebook attendu par l'APK
app.post('/api/auth/facebook', (req, res) => {
  const { facebook_access_token, client_id } = req.body;
  console.log('Requête reçue pour Facebook Login, Client ID:', client_id);

  // Réponse JSON simulée valide que le client Free Fire attend après l'authentification
  res.status(200).json({
    open_id: '123456789',
    access_token: facebook_access_token || 'mock_access_token',
    expiry_time: Math.floor(Date.now() / 1000) + 86400,
    platform: 1
  });
});

// Endpoint d'échange de token Google attendu par l'APK
app.post('/api/auth/google', (req, res) => {
  const { google_access_token, client_id } = req.body;
  console.log('Requête reçue pour Google Login, Client ID:', client_id);

  res.status(200).json({
    open_id: '123456789',
    access_token: google_access_token || 'mock_access_token',
    expiry_time: Math.floor(Date.now() / 1000) + 86400,
    platform: 1
  });
});

app.listen(PORT, () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
});
