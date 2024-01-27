const router = require('express').Router();
const User = require('../../Models/user');

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Endpoints para la autenticación y recuperación de contraseña.
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
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                 status:
 *                   type: string
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *       400:
 *         description: Token de verificación no proporcionado.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                 status:
 *                   type: string
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *       404:
 *         description: Token inválido o expirado.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                 status:
 *                   type: string
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *       500:
 *         description: Error al verificar la cuenta.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                 status:
 *                   type: string
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 */

//VERIFICA CUENTA DE USUARIO 

router.post('/:token', async (req, res) => {
    try {
        // Obtener el token de verificación desde los parámetros de la URL
        const token = req.params.token;

        // Validar el token
        if (!token) {
            return res.status(400).json({
                code: 400,
                status: 'error',
                message: 'Token de verificación no proporcionado',
                data: {}
            });
        }

        // Buscar al usuario con el token recibido
        const user = await User.findOne({ verificationToken: token });
        if (!user) {
            return res.status(404).json({
                code: 404,
                status: 'error',
                message: 'Token inválido o expirado',
                data: {}
            });
        }

        // Marcar la cuenta como verificada
        user.isVerified = true;
        user.verificationToken = undefined; // Eliminar el token de verificación
        await user.save();

        res.json({
            code: 200,
            status: 'success',
            message: 'Cuenta verificada correctamente',
            data: {}
        });
    } catch (error) {
        console.error("Error al verificar la cuenta:", error);
        res.status(500).json({
            code: 500,
            status: 'error',
            message: 'Error al verificar la cuenta',
            data: {}
        });
    }
});

module.exports = router;