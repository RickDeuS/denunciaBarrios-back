const router = require('express').Router();
const User = require('../../Models/user');

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Endpoints para la autenticación y verificación de usuarios.
 */

/**
 * @swagger
 * /auth/verifyUser:
 *   post:
 *     summary: Verifica la cuenta de un usuario.
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               verificationToken:
 *                 type: string
 *             example:
 *               verificationToken: "your_verification_token_here"
 *     responses:
 *       200:
 *         description: Cuenta verificada correctamente.
 *       400:
 *         description: Token de verificación no proporcionado.
 *       404:
 *         description: Token inválido o expirado.
 *       500:
 *         description: Error al verificar la cuenta.
 */

//VERIFICA CUENTA DE USUARIO 

router.post('/', async (req, res) => {
    const token = req.body.verificationToken; 

    try {
        // Validar el token
        if (!token) {
            return res.status(400).json({ error: 'Token de verificación no proporcionado' });
        }

        // Buscar al usuario con el token recibido
        const user = await User.findOne({ verificationToken: token });

        if (!user) {
            return res.status(404).json({ error: 'Token inválido o expirado' });
        }

        // Marcar la cuenta como verificada
        user.isVerified = true;
        user.verificationToken = undefined; // Eliminar el token de verificación
        await user.save();

        res.json({ message: 'Cuenta verificada correctamente' });
    } catch (error) {
        // Manejar errores internos
        console.error("Error al verificar la cuenta:", error);
        res.status(500).json({ error: 'Error al verificar la cuenta' });
    }
});

module.exports = router;