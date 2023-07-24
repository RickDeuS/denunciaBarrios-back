const router = require('express').Router();
const Denuncia = require('../../Models/denuncia');
const User = require('../../Models/user');
const Joi = require('@hapi/joi');
const cloudinary = require('cloudinary').v2;

// LISTAR DENUNCIAS DEL USUARIO

router.get('/', async (req, res) => {
    try {
        const usuarioId = req.user.id;

        const usuario = await User.findById(usuarioId);

        if (!usuario) {
            return res.status(404).json({ error: 'Usuario no encontrado.' });
        }
        const denuncias = await Denuncia.find({ denunciante: usuario.nombreCompleto });
        res.status(200).json(denuncias);
    } catch (error) {
        console.error('Error al obtener las denuncias:', error);
        res.status(500).json({ error: 'Error del servidor al obtener las denuncias.' });
    }
});

module.exports = router;