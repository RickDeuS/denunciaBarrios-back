const router = require('express').Router();
const User = require('../../Models/user');
const verifyAdminToken = require('../../Middleware/verifyAdminToken');

/**
 * @swagger
 * tags:
 *   name: Administrador
 *   description: Endpoints para administradores
 */

/**
 * @swagger
 * /admin/getUser:
 *   get:
 *     summary: Obtener detalles de una cuenta de usuario por su cédula.
 *     tags: [Administrador]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: cedula
 *         schema:
 *           type: string
 *         required: true
 *         description: Cédula del usuario del cual se desean obtener los detalles.
 *         example: 12345678
 *     responses:
 *       200:
 *         description: Detalles del usuario.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
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
 *         description: Error del servidor al obtener los detalles del usuario.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Error del servidor al obtener los detalles del usuario.
 */

router.get('/', async (req, res) => {
    try {
        const { cedula } = req.body;

        const usuario = await User.findOne({ cedula });
        if (!usuario) {
            return res.status(404).json({ error: 'Usuario no encontrado.' });
        }

        return res.status(200).json(usuario);
    } catch (error) {
        console.error('Error al obtener los detalles del usuario:', error);
        return res.status(500).json({ error: 'Error del servidor al obtener los detalles del usuario.' });
    }
});

module.exports = router;