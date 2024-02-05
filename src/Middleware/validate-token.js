const jwt = require('jsonwebtoken');

// Middleware to validate token (rutas protegidas)
const verifyToken = (req, res, next) => {
    // Obtener el token del encabezado de la solicitud
    const bearerHeader = req.header('Authorization');
    if (!bearerHeader) return res.status(401).json({ error: 'Acceso denegado. No se proporcionó token.' });

    // Intentar extraer el token del encabezado
    const bearer = bearerHeader.split(' ');
    const bearerToken = bearer[1]; // El token es el segundo elemento después de "Bearer"

    // Verificar que realmente se haya proporcionado un token después de "Bearer"
    if(bearer.length !== 2 || bearer[0].toLowerCase() !== 'bearer' || !bearerToken) {
        return res.status(400).json({ error: 'Formato de token inválido.' });
    }

    try {
        // Verificar el token
        const verified = jwt.verify(bearerToken, process.env.TOKEN_SECRET);
        req.user = verified; // Adjuntar el payload del token al objeto de solicitud para su uso posterior
        next(); // Pasar al siguiente middleware/ruta
    } catch (error) {
        // Enviar respuesta en caso de error al verificar el token
        res.status(400).json({ error: 'Token no es válido' });
    }
};

module.exports = verifyToken;
