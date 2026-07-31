import { Router, Request, Response } from 'express';

const router = Router();

// Route d'initialisation de la connexion Facebook
router.get('/facebook', (req: Request, res: Response) => {
    // Ici, tu pourras ajouter plus tard la logique OAuth officielle si nécessaire
    res.send(`
        <!DOCTYPE html>
        <html lang="fr">
        <head>
            <meta charset="UTF-8">
            <title>Liaison Facebook - Free Fire</title>
            <style>
                body {
                    background-color: #121212;
                    color: white;
                    font-family: Arial, sans-serif;
                    text-align: center;
                    padding-top: 50px;
                }
                .box {
                    max-width: 350px;
                    margin: 0 auto;
                    background: #1e1e1e;
                    padding: 20px;
                    border-radius: 8px;
                    box-shadow: 0 4px 10px rgba(0,0,0,0.4);
                }
                h3 { color: #1877F2; }
                p { color: #cccccc; font-size: 14px; }
            </style>
        </head>
        <body>
            <div class="box">
                <h3>Compte Facebook détecté</h3>
                <p>Association du compte en cours avec le serveur privé...</p>
                <script>
                    setTimeout(function() {
                        window.location.href = "/auth/facebook/success";
                    }, 1500);
                </script>
            </div>
        </body>
        </html>
    `);
});

// Route de succès après liaison
router.get('/facebook/success', (req: Request, res: Response) => {
    res.send(`
        <!DOCTYPE html>
        <html lang="fr">
        <head>
            <meta charset="UTF-8">
            <title>Succès</title>
            <style>
                body {
                    background-color: #121212;
                    color: white;
                    font-family: Arial, sans-serif;
                    text-align: center;
                    padding-top: 50px;
                }
                h3 { color: #4CAF50; }
            </style>
        </head>
        <body>
            <h3>Liaison Facebook réussie !</h3>
            <p>Vous pouvez maintenant retourner sur le jeu ou rafraîchir pour accéder au lobby.</p>
        </body>
        </html>
    `);
});

export default router;
