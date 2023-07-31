const jwt = require('jsonwebtoken');

function verificarToken(req, res, next) {
    const token = req.headers['auth-admin'];

    if (!token) {
        return res.status(401).json({ error: 'Acceso no autorizado. Se requiere un token de autenticación.' });
    }

    jwt.verify(token, `${process.env.SECRETO_ADMINS}`, (error, decoded) => {
        if (error) {
            return res.status(401).json({ error: 'Token inválido o expirado.' });
        }

        req.adminId = decoded.adminId;
        next();
    });
}

module.exports = verificarToken;