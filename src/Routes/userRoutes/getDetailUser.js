const router = require('express').Router();
const verifyToken = require('../../Middleware/validate-token');
const Denuncia = require('../../Models/denuncia');
const User = require('../../Models/user');

router.get('/', verifyToken, async (req, res) => {
    try {
        const usuarioId = req.user._id; 

        const usuario = await User.findById(usuarioId).select('-password'); 
        if (!usuario) {
            return res.status(404).json({
                code: 404,
                status: 'error',
                message: 'Usuario no encontrado',
                data: {}
            });
        }

        res.json({
            code: 200,
            status: 'success',
            message: 'Usuario obtenido correctamente.',
            data: usuario
        });
    } catch (error) {
        console.error('Error al obtener el usuario:', error);
        res.status(500).json({
            code: 500,
            status: 'error',
            message: 'Error del servidor al obtener el usuario.',
            data: {}
        });
    }
});

module.exports = router;
