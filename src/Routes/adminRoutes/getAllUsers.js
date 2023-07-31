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
 * /admin/todasCuentasUsuarios:
 *   get:
 *     summary: Obtener todas las cuentas de usuario registradas.
 *     tags: [Administrador]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de todas las cuentas de usuario.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
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
 *       500:
 *         description: Error del servidor al obtener las cuentas de usuario.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Error del servidor al obtener las cuentas de usuario.
 */

router.get('/',verifyAdminToken, async (req, res) => {
    try {
        const usuarios = await User.find();
        return res.status(200).json(usuarios);
    } catch (error) {
        console.error('Error al obtener las cuentas de usuario:', error);
        return res.status(500).json({ error: 'Error del servidor al obtener las cuentas de usuario.' });
    }
});

module.exports = router;