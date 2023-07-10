const router = require('express').Router();
const Denuncia = require('../Models/denuncia');
const User = require('../Models/user');
const Joi = require('@hapi/joi');

/**
 * @swagger
 * /nuevaDenuncia:
 *   post:
 *     summary: Crear una nueva denuncia
 *     tags: [Denuncias]
 *     security:
 *       - jwt: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/NuevaDenuncia'
 *     responses:
 *       201:
 *         description: Denuncia creada exitosamente
 *       400:
 *         description: Error de validación o denuncia con el mismo título ya existe
 *       404:
 *         description: Usuario no encontrado
 *       500:
 *         description: Error del servidor al crear la denuncia
 */
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

        // Verificar si el usuario ya ha presentado una denuncia con el mismo título
        const denunciaExistente = await Denuncia.findOne({
            tituloDenuncia: req.body.tituloDenuncia,
            denunciante: usuario.nombreCompleto,
        });

        if (denunciaExistente) {
            return res.status(400).json({ error: 'Ya has presentado una denuncia con el mismo título. Cambia el titulo de tu denuncia e intenta nuevamente' });
        }

        // Crear la nueva denuncia con el título de la denuncia, el nombre completo del usuario autenticado como denunciante, y los demás datos
        const nuevaDenuncia = new Denuncia({
            tituloDenuncia: req.body.tituloDenuncia,
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