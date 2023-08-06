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
 *     summary: Obtener detalles de un usuario por su cédula
 *     tags: [Administrador]
 *     parameters:
 *       - in: body
 *         name: body
 *         required: true
 *         schema:
 *           type: object
 *           properties:
 *             cedula:
 *               type: string
 *         example:
 *           cedula: 123456789
 *     responses:
 *       200:
 *         description: Detalles del usuario
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'  
 *       404:
 *         description: Usuario no encontrado
 *         content:
 *           application/json:
 *             example:
 *               error: Usuario no encontrado.
 *       500:
 *         description: Error del servidor al obtener los detalles del usuario
 *         content:
 *           application/json:
 *             example:
 *               error: Error del servidor al obtener los detalles del usuario.
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