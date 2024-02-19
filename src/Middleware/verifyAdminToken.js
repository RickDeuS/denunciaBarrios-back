const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
    const bearerHeader = req.header('Authorization');
    if (!bearerHeader) return res.status(401).json({ error: 'Acceso denegado.' });

    const bearer = bearerHeader.split(' ');
    const bearerToken = bearer[1]; 

    if(bearer.length !== 2 || bearer[0].toLowerCase() !== 'bearer' || !bearerToken) {
        return res.status(400).json({ error: 'Formato de token inválido.' });
    }

    try {
        const verified = jwt.verify(bearerToken, process.env.SECRETO_ADMINS);
        req.user = verified;
        next();
    } catch (error) {
        res.status(400).json({ error: 'Token no es válido' });
    }
};

module.exports = verifyToken;
