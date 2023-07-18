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

router.post('/', async (req, res) => {
    try {
        const { resetToken, newPassword } = req.body;

        // Decodificar el token de restablecimiento de contraseña
        const decodedToken = jwt.verify(resetToken, process.env.RESET_TOKEN_SECRET);

        // Buscar al usuario por el ID obtenido del token
        const user = await User.findById(decodedToken.userId);

        if (!user) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }

        if (!newPassword) {
            return res.status(400).json({ error: 'La nueva contraseña no puede estar vacía' });
        }

        // Hash de la nueva contraseña
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Actualizar la contraseña del usuario
        user.password = hashedPassword;
        await user.save();

        // Eliminar el token de restablecimiento de contraseña del usuario
        user.resetToken = undefined;
        await user.save();

        res.json({
            error: null,
            message: 'Cambio de contraseña exitoso',
        });
    } catch (error) {
        res.status(500).json({ error: 'Error al restablecer la contraseña' });
        console.log("Error:", error);
    }
});

module.exports = router;