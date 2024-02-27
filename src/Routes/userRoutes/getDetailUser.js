const router = require('express').Router();
const verifyToken = require('../../Middleware/validate-token');
const Denuncia = require('../../Models/denuncia');
const User = require('../../Models/user');
const sendResponse = require('../../utils/responseHandler');

router.get('/', verifyToken, async (req, res) => {
    try {
        const usuarioId = req.user._id; 

        const usuario = await User.findById(usuarioId).select('-password'); 
        if (!usuario) {
            return sendResponse(res, 404, {}, 'Usuario no encontrado');
        }

        sendResponse(res, 200, usuario, 'Usuario obtenido correctamente.');

    } catch (error) {
        console.error('Error al obtener el usuario:', error);
        sendResponse(res, 500, {}, 'Error del servidor al obtener el usuario.');
    }
});

module.exports = router;
