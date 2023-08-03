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
 * /admin/blockUser:
 *   post:
 *     summary: Bloquear o inhabilitar una cuenta de usuario por su cédula.
 *     tags: [Administrador]
 *     security:
 *       - adminToken: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               cedula:
 *                 type: string
 *                 description: Cédula del usuario que se desea bloquear o inhabilitar.
 *                 example: 12345678
 *             required:
 *               - cedula
 *     responses:
 *       200:
 *         description: Cuenta de usuario bloqueada o inhabilitada correctamente.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Cuenta de usuario bloqueada o inhabilitada correctamente.
 *       401:
 *         description: No se proporcionó un token de autenticación válido o el usuario no es administrador.
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
 *         description: Error del servidor al bloquear o inhabilitar la cuenta de usuario.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Error del servidor al bloquear o inhabilitar la cuenta de usuario.
 */

router.post('/blockUser', verifyAdminToken, async (req, res) => {
    try {
        const { cedula } = req.body;

        const usuario = await User.findOne({ cedula });
        if (!usuario) {
            return res.status(404).json({ error: 'Usuario no encontrado.' });
        }

        // Bloquear o inhabilitar la cuenta de usuario
        usuario.isBlocked = true; // Cambiamos a true para bloquear, false para desbloquear.
        await usuario.save();

        return res.status(200).json({ message: 'Cuenta de usuario bloqueada o inhabilitada correctamente.' });
    } catch (error) {
        console.error('Error al bloquear o inhabilitar la cuenta de usuario:', error);
        return res.status(500).json({ error: 'Error del servidor al bloquear o inhabilitar la cuenta de usuario.', error });
    }
});

module.exports = router;