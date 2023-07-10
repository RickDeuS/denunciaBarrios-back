const router = require('express').Router();
const Denuncia = require('../Models/denuncia');
const User = require('../Models/user');
const Joi = require('@hapi/joi');

// Ruta protegida: Crear una nueva denuncia
router.post('/nuevaDenuncia', async (req, res) => {
    try {
        // Obtener el ID del usuario autenticado desde la sesión o el token
        const usuarioId = req.user.id;

        // Consultar el usuario autenticado en la base de datos
        const usuario = await User.findById(usuarioId);

        if (!usuario) {
            return res.status(404).json({ error: 'Usuario no encontrado.' });
        }

        // Validar los datos de entrada usando Joi (puedes ajustar las reglas de validación según tus necesidades)
        const schema = Joi.object({
            tituloDenuncia: Joi.string().required().trim(),
            descripcion: Joi.string().required().trim(),
            evidencia: Joi.string().required().trim(),
            ubicacion: Joi.string().required().trim(),
            estado: Joi.string().trim(),
        });

        const { error } = schema.validate(req.body);

        if (error) {
            return res.status(400).json({ error: error.details[0].message });
        }

        // Crear la nueva denuncia con el título de la denuncia, el nombre completo del usuario autenticado como denunciante, y los demás datos
        const nuevaDenuncia = new Denuncia({
            nombreDenuncia: req.body.tituloDenuncia,
            denunciante: usuario.nombreCompleto,
            descripcion: req.body.descripcion,
            evidencia: req.body.evidencia,
            ubicacion: req.body.ubicacion,
            estado: req.body.estado,
        });

        // Guardar la denuncia en la base de datos
        await nuevaDenuncia.save();

        return res.status(201).json({ message: 'Denuncia creada exitosamente.' });
    } catch (error) {
        console.error('Error al crear la denuncia:', error);
        return res.status(500).json({ error: 'Error del servidor al crear la denuncia.' });
    }
});

module.exports = router;
