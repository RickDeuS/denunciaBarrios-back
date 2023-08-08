const router = require('express').Router();
const User = require('../../Models/user');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Joi = require('@hapi/joi');


/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Iniciar sesión de usuario
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginInput'
 *     responses:
 *       200:
 *         description: Usuario autenticado exitosamente
 *         headers:
 *           auth-token:
 *             schema:
 *               type: string
 *             description: Token de autenticación JWT
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LoginResponse'
 *       400:
 *         description: Error de validación, usuario no encontrado o contraseña no válida
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     LoginInput:
 *       type: object
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *           minLength: 6
 *           maxLength: 255
 *         password:
 *           type: string
 *           minLength: 6
 *           maxLength: 1024
 *     LoginResponse:
 *       type: object
 *       properties:
 *         error:
 *           type: null
 *         data:
 *           type: object
 *           properties:
 *             token:
 *               type: string
 */
;

router.post('/', async (req, res) => {
    // Validaciones
    const user = await User.findOne({ email: req.body.email });
    if (!user) return res.status(400).json({ error: 'Usuario no encontrado' });

    if (!user.isVerified) {
        return res.status(401).json({ error: 'El usuario no está verificado' });
    }

    if (user.isBlocked === true) {
        return res.status(401).json({ error: 'El usuario está bloqueado. No puede iniciar sesion' });
    }

    const validPassword = await bcrypt.compare(req.body.password, user.password);
    if (!validPassword) return res.status(400).json({ error: 'Contraseña no válida' });

    // Crear token JWT
    const token = jwt.sign(
        {
            name: user.nombreCompleto,
            id: user._id,
        },
        process.env.TOKEN_SECRET
    );
    res.header('auth-token', token).json({
        error: null,
        data: { token },
    });
});

module.exports = router;