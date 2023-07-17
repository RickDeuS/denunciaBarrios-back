const express = require('express');
const router = require('express').Router();
const User = require('../Models/user');
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
 *               token:
 *                 type: string
 *               nuevaContrasena:
 *                 type: string
 *             example:
 *               token: "your_reset_token_here"
 *               nuevaContrasena: "new_password_here"
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
        const { token, nuevaContrasena } = req.body;

        // Decodificar el token de restablecimiento de contraseña
        const decodedToken = jwt.verify(token, process.env.RESET_TOKEN_SECRET);

        // Buscar al usuario por el ID obtenido del token
        const user = await User.findById(decodedToken.userId);

        if (!user) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }

        // Hash de la nueva contraseña
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(nuevaContrasena, salt);

        // Actualizar la contraseña del usuario
        user.password = hashedPassword;
        await user.save();

        // Eliminar el token de restablecimiento de contraseña del usuario
        user.verificationToken = undefined;
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