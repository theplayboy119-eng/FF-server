import { Router, Request, Response } from 'express';

const router = Router();

// Intercepte toutes les variantes de l'URL de login de l'APK (y compris avec les query parameters de luna-corp)
router.get(['/facebook', '/', '/auth/facebook', '/auth/facebook/'], (req: Request, res: Response) => {
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
        '    window.location.href = "freefire://login?access_token=EAAG_FAKE_FACEBOOK_TOKEN_FF2022&status=success&code=200";' +
        '  }, 600);' +
        '}' +
        '</script>' +
        '</body>' +
        '</html>';

    res.send(htmlContent);
});

export default router;
        
