const express = require('express');
const router = require('express').Router();
const User = require('../../Models/user');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
/**
 * @swagger
 * /auth/newPassword:
 *   post:
 *     summary: Cambiar la contraseña del usuario.
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               resetToken:
 *                 type: string
 *               newPassword:
 *                 type: string
 *             example:
 *               resetToken: "your_reset_token_here"
 *               newPassword: "new_password_here"
 *     responses:
 *       200:
 *         description: Cambio de contraseña exitoso.
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
 *               example:
 *                 code: 200
 *                 status: "success"
 *                 message: "Cambio de contraseña exitoso"
 *                 data: {}
 *       400:
 *         description: La nueva contraseña no puede estar vacía.
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
 *               example:
 *                 code: 400
 *                 status: "error"
 *                 message: "La nueva contraseña no puede estar vacía"
 *                 data: {}
 *       404:
 *         description: Usuario no encontrado.
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
 *               example:
 *                 code: 404
 *                 status: "error"
 *                 message: "Usuario no encontrado"
 *                 data: {}
 *       500:
 *         description: Error al restablecer la contraseña.
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
 *               example:
 *                 code: 500
 *                 status: "error"
 *                 message: "Error al restablecer la contraseña"
 *                 data: {}
 */


//NUEVA CONTRASEÑA DE USUARIO 
// router.post('/', resetToken,async(req.res) => {
router.post('/', async (req, res) => {
    try {
        const { resetToken, newPassword } = req.body;
        const decodedToken = jwt.verify(resetToken, process.env.RESET_TOKEN_SECRET);
        const userId = decodedToken.id;
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({
                code: 404,
                status: 'error',
                message: 'Usuario no encontrado',
                data: {}
            });
        }

        if (!newPassword) {
            return res.status(400).json({
                code: 400,
                status: 'error',
                message: 'La nueva contraseña no puede estar vacía',
                data: {}
            });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;
        user.resetToken = undefined;
        await user.save();

        res.json({
            code: 200,
            status: 'success',
            message: 'Cambio de contraseña exitoso',
            data: {}
        });
    } catch (error) {
        console.error("Error:", error.message);
        res.status(500).json({
            code: 500,
            status: 'error',
            message: 'Error al restablecer la contraseña',
            data: {}
        });
    }
});

module.exports = router;