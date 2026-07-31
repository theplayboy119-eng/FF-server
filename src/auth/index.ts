import { Router, Request, Response } from 'express';

const router = Router();

// Route d'initialisation de la connexion Facebook (/auth/facebook)
router.get('/facebook', (req: Request, res: Response) => {
    const htmlContent = 
        '<!DOCTYPE html>' +
        '<html lang="fr">' +
        '<head>' +
        '<meta charset="UTF-8">' +
        '<title>Connexion Facebook</title>' +
        '<style>' +
        'body { background-color: #121212; color: white; font-family: Arial, sans-serif; text-align: center; padding-top: 50px; }' +
        '.box { max-width: 350px; margin: 0 auto; background: #1e1e1e; padding: 20px; border-radius: 8px; box-shadow: 0 4px 10px rgba(0,0,0,0.4); }' +
        'h3 { color: #1877F2; }' +
        'p { color: #cccccc; font-size: 14px; }' +
        '</style>' +
        '</head>' +
        '<body>' +
        '<div class="box">' +
        '<h3>Connexion en cours...</h3>' +
        '<p>Validation des identifiants Facebook avec le serveur privé.</p>' +
        '<script>' +
        'setTimeout(function() { window.location.href = "/auth/facebook/success"; }, 1500);' +
        '</script>' +
        '</div>' +
        '</body>' +
        '</html>';

    res.send(htmlContent);
});

// Route de succès après liaison (/auth/facebook/success)
router.get('/facebook/success', (req: Request, res: Response) => {
    const successHtml = 
        '<!DOCTYPE html>' +
        '<html lang="fr">' +
        '<head>' +
        '<meta charset="UTF-8">' +
        '<title>Succès</title>' +
        '<style>' +
        'body { background-color: #121212; color: white; font-family: Arial, sans-serif; text-align: center; padding-top: 50px; }' +
        'h3 { color: #4CAF50; }' +
        'p { color: #b0b0b0; font-size: 14px; }' +
        '</style>' +
        '</head>' +
        '<body>' +
        '<h3>Compte lié avec succès !</h3>' +
        '<p>Redirection vers le jeu en cours...</p>' +
        '<script>' +
        'setTimeout(function() { window.location.href = "freefire://"; }, 1000);' +
        '</script>' +
        '</body>' +
        '</html>';

    res.send(successHtml);
});

export default router;
