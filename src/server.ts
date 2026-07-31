import express, { Request, Response } from 'express';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ==========================================
// 1. PAGE WEB OAUTH (FACEBOOK)
// ==========================================
const renderAuthPage = (req: Request, res: Response) => {
    const redirectUri = (req.query.redirect_uri as string) || 'fbconnect://success';
    const state = (req.query.state as string) || '';

    const htmlContent = 
        '<!DOCTYPE html>' +
        '<html lang="fr">' +
        '<head>' +
        '<meta charset="UTF-8">' +
        '<title>Connexion Facebook</title>' +
        '<style>' +
        'body { background-color: #121212; color: white; font-family: Arial, sans-serif; text-align: center; margin: 0; padding-top: 40px; }' +
        '.modal { background: #1e1e1e; max-width: 350px; margin: 0 auto; padding: 25px; border-radius: 12px; box-shadow: 0 4px 15px rgba(0,0,0,0.6); }' +
        'h3 { color: #4CAF50; margin-bottom: 10px; }' +
        'p { color: #cccccc; font-size: 13px; line-height: 1.4; margin-bottom: 20px; }' +
        '.btn-fb { display: block; width: 100%; background: #1877F2; color: white; border: none; padding: 12px; border-radius: 6px; font-size: 14px; font-weight: bold; cursor: pointer; text-decoration: none; box-sizing: border-box; }' +
        '.loader { display: none; margin-top: 15px; color: #4CAF50; font-size: 13px; font-weight: bold; }' +
        '</style>' +
        '</head>' +
        '<body>' +
        '<div class="modal">' +
        '<h3>Vérification Réussie !</h3>' +
        '<p>Le serveur privé a validé votre accès. Veuillez lier un compte Facebook actif pour vous connecter et accéder au lobby du jeu.</p>' +
        '<a href="#" class="btn-fb" id="loginBtn" onclick="triggerSuccess(event)">Se connecter avec Facebook</a>' +
        '<div class="loader" id="loaderText">Connexion en cours, redirection vers le lobby...</div>' +
        '</div>' +
        '<script>' +
        'function triggerSuccess(e) {' +
        '  e.preventDefault();' +
        '  document.getElementById("loginBtn").style.display = "none";' +
        '  document.getElementById("loaderText").style.display = "block";' +
        '  setTimeout(function() {' +
        '    window.location.href = "' + redirectUri + '?access_token=EAAG_FAKE_TOKEN_FF2022&state=' + encodeURIComponent(state) + '&code=200";' +
        '  }, 600);' +
        '}' +
        '</script>' +
        '</body>' +
        '</html>';

    res.send(htmlContent);
};

app.get('/v9.0/dialog/oauth', renderAuthPage);
app.get('/auth/facebook', renderAuthPage);

// ==========================================
// 2. API ÉCHANGE DE JETON FACEBOOK (ARRIÈRE-PLAN)
// ==========================================
const handleTokenExchange = (req: Request, res: Response) => {
    res.json({
        open_id: "76543210",
        access_token: "EAAG_FAKE_TOKEN_FF2022",
        expiry_time: 4102444800,
        platform: 1
    });
};

app.post('/api/auth/facebook/exchange', handleTokenExchange);
app.get('/api/auth/facebook/exchange', handleTokenExchange);
app.post('/auth/facebook/exchange', handleTokenExchange);
app.get('/auth/facebook/exchange', handleTokenExchange);

// ==========================================
// 3. API MODE INVITÉ (GUEST REGISTRATION & GRANT)
// ==========================================
const handleGuestAuth = (req: Request, res: Response) => {
    res.json({
        open_id: "123456789",
        access_token: "GUEST_TOKEN_2022_FAKE",
        refresh_token: "GUEST_REFRESH_TOKEN_FAKE",
        expiry_time: 4102444800
    });
};

app.post('/api/guest/register', handleGuestAuth);
app.get('/api/guest/register', handleGuestAuth);
app.post('/api/auth/guest/grant', handleGuestAuth);
app.get('/api/auth/guest/grant', handleGuestAuth);
app.post('/v1/guest/login', handleGuestAuth);
app.get('/v1/guest/login', handleGuestAuth);
app.post('/auth/guest', handleGuestAuth);
app.get('/auth/guest', handleGuestAuth);

// ==========================================
// 4. ROUTE DE BASE
// ==========================================
app.get('/', (req: Request, res: Response) => {
    res.send('Serveur Privé Free Fire - Actif 🚀');
});

app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`Serveur en écoute sur le port ${PORT}`);
});
        
