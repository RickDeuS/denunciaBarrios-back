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
 *   post:
 *     summary: Obtener detalles de un usuario por su ID
 *     tags: [Administrador]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               _id:
 *                 type: string
 *             example:
 *               _id: "123456789"
 *     responses:
 *       200:
 *         description: Detalles del usuario
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       400:
 *         description: Usuario no encontrado o ID de usuario faltante
 *         content:
 *           application/json:
 *             example:
 *               error: Usuario no encontrado o ID de usuario faltante.
 *       500:
 *         description: Error del servidor al obtener los detalles del usuario
 *         content:
 *           application/json:
 *             example:
 *               error: Error del servidor al obtener los detalles del usuario.
 */
router.post('/', async (req, res) => {
    try {
        const { _id } = req.body;

        // Validar que se proporcione el ID del usuario
        if (!_id) {
            return res.status(400).json({ error: 'Se debe proporcionar el ID del usuario.' });
        }

        // Buscar el usuario por su ID
        const usuario = await User.findById(_id);

        if (!usuario) {
            return res.status(400).json({ error: 'Usuario no encontrado.' });
        }

        return res.status(200).json(usuario);
    } catch (error) {
        console.error('Error al obtener los detalles del usuario:', error);
        return res.status(500).json({ error: 'Error del servidor al obtener los detalles del usuario.' });
    }
});

module.exports = router;