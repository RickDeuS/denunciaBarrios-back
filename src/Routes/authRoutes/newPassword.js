const express = require('express');
const router = require('express').Router();
const User = require('../../Models/user');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Endpoints para la autenticación y recuperación de contraseña.
 */



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
 *                 error:
 *                   type: null
 *                 message:
 *                   type: string
 *             example:
 *               error: null
 *               message: "Cambio de contraseña exitoso"
 *       404:
 *         description: Usuario no encontrado.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *             example:
 *               error: "Usuario no encontrado"
 *       400:
 *         description: La nueva contraseña no puede estar vacía.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *             example:
 *               error: "La nueva contraseña no puede estar vacía"
 *       500:
 *         description: Error al restablecer la contraseña.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *             example:
 *               error: "Error al restablecer la contraseña"
 */


//NUEVA CONTRASEÑA DE USUARIO 

// router.post('/:resetToken', async (req, res) => {
    router.post('/', async (req, res) => {

    try {
        // const resetToken = req.params.resetToken;
        // const newPassword = req.body;
        const { resetToken, newPassword } = req.body;
        const decodedToken = jwt.verify(resetToken, process.env.RESET_TOKEN_SECRET);
        const userId = decodedToken.id;
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }

        if (!newPassword) {
            return res.status(400).json({ error: 'La nueva contraseña no puede estar vacía' });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;
        await user.save();

        user.resetToken = undefined;
        await user.save();

        res.json({
            error: null,
            message: 'Cambio de contraseña exitoso',
        });
    } catch (error) {
        console.error("Error:", error.message);
        res.status(500).json({ error: 'Error al restablecer la contraseña' });
    }
});

module.exports = router;