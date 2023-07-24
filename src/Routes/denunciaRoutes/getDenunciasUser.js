const router = require('express').Router();
const Denuncia = require('../../Models/denuncia');
const User = require('../../Models/user');
const Joi = require('@hapi/joi');
const cloudinary = require('cloudinary').v2;
/**
 * @swagger
 * /api/denuncias:
 *   get:
 *     summary: Obtiene todas las denuncias del usuario actual.
 *     tags: [Denuncias]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de denuncias del usuario actual.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Denuncia'
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
 *         description: Error del servidor al obtener las denuncias.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Error del servidor al obtener las denuncias.
 */

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