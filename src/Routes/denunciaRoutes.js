const router = require('express').Router();
const Denuncia = require('../Models/denuncia');
const User = require('../Models/user');
const Joi = require('@hapi/joi');
const cloudinary = require('cloudinary').v2;

router.get('/listaDenuncias', async (req, res) => {
    try {
        // Obtener el ID del usuario autenticado desde la sesión o el token
        const usuarioId = req.user.id;

        // Consultar el usuario autenticado en la base de datos
        const usuario = await User.findById(usuarioId);

        if (!usuario) {
            return res.status(404).json({ error: 'Usuario no encontrado.' });
        }

        // Obtener las denuncias del usuario autenticado
        const denuncias = await Denuncia.find({ denunciante: usuario.nombreCompleto });
        res.status(200).json(denuncias);
    } catch (error) {
        console.error('Error al obtener las denuncias:', error);
        res.status(500).json({ error: 'Error del servidor al obtener las denuncias.' });
    }
});


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
            return res.status(400).json({ error: 'Ya has presentado una denuncia con el mismo título.' });
        }

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
        
        // Actualizar el usuario con la nueva denuncia
        usuario.Denuncias.push(nuevaDenuncia);
        usuario.numDenunciasRealizadas += 1;
        await usuario.save();
        
        return res.status(201).json({ message: 'Denuncia creada exitosamente.' });
    } catch (error) {
        console.error('Error al crear la denuncia:', error);
        return res.status(500).json({ error: 'Error del servidor al crear la denuncia.' });
    }
});


router.delete('/eliminarDenuncia', async (req, res) => {
    try {
        const { tituloDenuncia } = req.body;

        // Validar los datos de entrada usando Joi (puedes ajustar las reglas de validación según tus necesidades)
        const schema = Joi.object({
            tituloDenuncia: Joi.string().required().trim(),
        });

        const { error } = schema.validate({ tituloDenuncia });

        if (error) {
            return res.status(400).json({ error: error.details[0].message });
        }

        // Buscar y eliminar la denuncia por su título
        const denunciaEliminada = await Denuncia.findOneAndDelete({ tituloDenuncia });

        if (!denunciaEliminada) {
            return res.status(400).json({ error: 'Denuncia no encontrada.' });
        }

        return res.status(200).json({ message: 'Denuncia eliminada exitosamente.' });
    } catch (error) {
        console.error('Error al eliminar la denuncia:', error);
        return res.status(500).json({ error: 'Error del servidor al eliminar la denuncia.' });
    }
});
/**
 * @swagger
 * tags:
 *   name: Denuncias
 *   description: Listar, Crear y Eliminar Denuncias
 */

/**
 * @swagger
 * /denuncias/listaDenuncias:
 *   get:
 *     summary: Obtener todas las denuncias del usuario autenticado
 *     tags: [Denuncias]
 *     security:
 *       - jwt: []
 *     responses:
 *       200:
 *         description: Lista de denuncias del usuario obtenida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Denuncia'
 *       500:
 *         description: Error del servidor al obtener las denuncias
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 */

/**
 * @swagger
 * /denuncias/nuevaDenuncia:
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
 *             $ref: '#/components/schemas/Denuncia'
 *     responses:
 *       201:
 *         description: Denuncia creada exitosamente
 *       400:
 *         description: Error de validación o denuncia con el mismo título ya existe
 *       404:
 *         description: Usuario no encontrado
 *       500:
 *         description: Error del servidor al crear la denuncia
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 */

/**
 * @swagger
 * /denuncias/eliminarDenuncia:
 *   delete:
 *     summary: Eliminar una denuncia por su título
 *     tags: [Denuncias]
 *     security:
 *       - jwt: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/EliminarDenuncia'
 *     responses:
 *       200:
 *         description: Denuncia eliminada exitosamente
 *       400:
 *         description: Error de validación o denuncia no encontrada
 *       500:
 *         description: Error del servidor al eliminar la denuncia
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 */
module.exports = router;