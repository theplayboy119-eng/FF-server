import express, { Request, Response, NextFunction } from 'express';

const app = express();
const PORT = process.env.PORT || 10000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ==========================================
// 0. FILET DE SÉCURITÉ & MÉMOIRE AUTONOME
// ==========================================
const capturedRoutes = new Set<string>();

app.use((req: Request, res: Response, next: NextFunction) => {
    const routeKey = `${req.method} ${req.path}`;
    if (!capturedRoutes.has(routeKey)) {
        capturedRoutes.add(routeKey);
        console.log(`[NOUVELLE ROUTE DÉCOUVERTE] -> ${routeKey}`);
    }
    console.log(`[REQUÊTE CAPTURÉE] Méthode: ${req.method} | URL: ${req.url} - IP: ${req.ip}`);
    if (req.body && Object.keys(req.body).length > 0) {
        console.log('Body:', JSON.stringify(req.body));
    }
    next();
});

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
// 2. API ÉCHANGE DE JETON FACEBOOK (Endpoints Device Auth extraits de l'APK)
// ==========================================
const handleTokenExchange = (req: Request, res: Response) => {
    res.json({
        open_id: "76543210",
        access_token: "EAAG_FAKE_TOKEN_FF2022",
        expiry_time: 4102444800,
        platform: 1
    });
};

const handleDeviceLoginStatus = (req: Request, res: Response) => {
    res.json({
        status: "success",
        code: 200,
        access_token: "EAAG_DEVICE_AUTH_TOKEN_2022",
        expires_in: 31536000
    });
};

app.all('/api/auth/facebook/exchange', handleTokenExchange);
app.all('/auth/facebook/exchange', handleTokenExchange);
app.all('/device/login', handleTokenExchange);
app.all('/device/login_status', handleDeviceLoginStatus);

// ==========================================
// 3. API MODE INVITÉ
// ==========================================
const handleGuestAuth = (req: Request, res: Response) => {
    res.json({
        open_id: "123456789",
        access_token: "GUEST_TOKEN_2022_FAKE",
        refresh_token: "GUEST_REFRESH_TOKEN_FAKE",
        expiry_time: 4102444800
    });
};

app.all('/api/guest/register', handleGuestAuth);
app.all('/api/auth/guest/grant', handleGuestAuth);
app.all('/v1/guest/login', handleGuestAuth);
app.all('/auth/guest', handleGuestAuth);

// ==========================================
// 4. API GOOGLE OAUTH
// ==========================================
const handleGoogleAuth = (req: Request, res: Response) => {
    const redirectUri = (req.query.redirect_uri as string) || 'intent://success#Intent;scheme=garena;end';
    
    res.send(`
        <!DOCTYPE html>
        <html>
        <head><title>Connexion Google Réussie</title></head>
        <body style="background:#121212; color:white; text-align:center; padding-top:50px; font-family:sans-serif;">
            <h2>Connexion Google validée !</h2>
            <p>Redirection vers le jeu en cours...</p>
            <script>
                setTimeout(function() {
                    window.location.href = "${redirectUri}?code=200&access_token=GOOGLE_FAKE_TOKEN_2022";
                }, 1000);
            </script>
        </body>
        </html>
    `);
};

app.get('/auth/google/callback', handleGoogleAuth);
app.get('/api/auth/google/callback', handleGoogleAuth);

const handleGoogleTokenExchange = (req: Request, res: Response) => {
    res.json({
        open_id: "987654321",
        access_token: "GOOGLE_FAKE_TOKEN_2022",
        expiry_time: 4102444800,
        platform: 2
    });
};

app.all('/api/auth/google/exchange', handleGoogleTokenExchange);
app.all('/auth/google/exchange', handleGoogleTokenExchange);

// ==========================================
// 5. ROUTE DE BASE
// ==========================================
app.get('/', (req: Request, res: Response) => {
    res.send('Serveur Privé Free Fire - Actif & Autonome 🚀');
});

// ==========================================
// 6. GESTIONNAIRE AUTONOME UNIVERSEL (CATCH-ALL FALLBACK PUR)
// ==========================================
app.use((req: Request, res: Response) => {
    res.status(200).json({
        status: "success",
        code: 200,
        message: "Auto-responded by Autonomous Private Server",
        path: req.path,
        open_id: "123456789",
        access_token: "AUTO_FALLBACK_TOKEN_2022",
        expiry_time: 4102444800
    });
});

// ==========================================
// 7. DÉMARRAGE DU SERVEUR
// ==========================================
const server = app.listen(Number(PORT), () => {
    console.log(`Serveur en écoute sur le port ${PORT}`);
});

server.keepAliveTimeout = 120000;
server.headersTimeout = 120000;
