import { Request, Response } from 'express';

export function handleLogin(req: Request, res: Response) {
  const body = req.body;
  console.log('Données d\'authentification reçues :', body);

  // Génération d'une réponse de succès standardisée pour l'APK
  return res.status(200).json({
    error_code: 0,
    error_msg: 'success',
    open_id: 'ff_user_' + Math.floor(Math.random() * 1000000),
    access_token: 'mock_session_token_' + Date.now(),
    token_type: 'Bearer',
    expires_in: 86400
  });
}
