const router = require('express').Router();
const Denuncia = require('../../Models/denuncia');
const User = require('../../Models/user');
const Joi = require('@hapi/joi');

/**
 * @swagger
 * /api/denuncias:
 *   post:
 *     summary: Crea una nueva denuncia.
 *     tags: [Denuncias]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               tituloDenuncia:
 *                 type: string
 *                 description: Título de la denuncia.
 *                 example: Denuncia de contaminación en parque público.
 *               descripcion:
 *                 type: string
 *                 description: Descripción detallada de la denuncia.
 *                 example: Existe contaminación del agua en el parque cercano a mi casa.
 *               evidencia:
 *                 type: string
 *                 description: URL de la evidencia adjunta (imagen, video, etc.).
 *                 example: https://ejemplo.com/evidencia.jpg
 *               ubicacion:
 *                 type: object
 *                 properties:
 *                   type:
 *                     type: string
 *                     description: Tipo de ubicación, siempre debe ser "Point".
 *                     example: Point
 *                   coordinates:
 *                     type: array
 *                     description: Coordenadas de la ubicación [longitud, latitud].
 *                     items:
 *                       type: number
 *                     example: [-77.12345, 12.34567]
 *               estado:
 *                 type: string
 *                 description: Estado actual de la denuncia.
 *                 example: Pendiente
 *               categoria:
 *                 type: string
 *                 description: Categoría de la denuncia.
 *                 example: Contaminacion
 *             required:
 *               - tituloDenuncia
 *               - descripcion
 *               - evidencia
 *               - ubicacion
 *               - categoria
 *     responses:
 *       201:
 *         description: Denuncia creada exitosamente.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Denuncia creada exitosamente.
 *       400:
 *         description: Error en la solicitud del cliente.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Ya has presentado una denuncia con el mismo título.
 *       401:
 *         description: No se proporcionó un token de autenticación válido.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Acceso no autorizado.
 *       404:
 *         description: No se encontró el usuario en la base de datos.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Usuario no encontrado.
 *       500:
 *         description: Error del servidor al crear la denuncia.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Error del servidor al crear la denuncia.
 */
// NUEVA DENUNCIA    
router.post('/', async (req, res) => {
    try {
        const usuarioId = req.user.id;

        const usuario = await User.findById(usuarioId);

        if (!usuario) {
            return res.status(404).json({ error: 'Usuario no encontrado.' });
        }

        const schema = Joi.object({
            tituloDenuncia: Joi.string().required().trim(),
            descripcion: Joi.string().required().trim(),
            evidencia: Joi.string().required().trim(),
            ubicacion: Joi.object({
                type: Joi.string().valid('Point').required(),
                coordinates: Joi.array().items(Joi.number()).length(2).required(),
            }).required(),
            estado: Joi.string().trim(),
            categoria: Joi.string().valid('Seguridad', 'Infraestructura', 'Contaminacion', 'Ruido', 'Otro').required(),
        });

        const { error } = schema.validate(req.body);

        if (error) {
            return res.status(400).json({ error: error.details[0].message });
        }

        const denunciaExistente = await Denuncia.findOne({
            tituloDenuncia: req.body.tituloDenuncia,
            denunciante: usuario.nombreCompleto,
        });

        if (denunciaExistente) {
            return res.status(400).json({ error: 'Ya has presentado una denuncia con el mismo título.' });
        }

        const nuevaDenuncia = new Denuncia({
            tituloDenuncia: req.body.tituloDenuncia,
            denunciante: usuario.nombreCompleto,
            descripcion: req.body.descripcion,
            evidencia: req.body.evidencia,
            ubicacion: req.body.ubicacion,
            estado: req.body.estado,
            categoria: req.body.categoria,
        });
        
        await nuevaDenuncia.save();
        
        usuario.Denuncias.push(nuevaDenuncia);
        usuario.numDenunciasRealizadas += 1;
        await usuario.save();
        
        return res.status(201).json({ message: 'Denuncia creada exitosamente.' });
    } catch (error) {
        console.error('Error al crear la denuncia:', error);
        return res.status(500).json({ error: 'Error del servidor al crear la denuncia.' });
    }
});

module.exports = router;