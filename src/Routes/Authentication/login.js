const router = require('express').Router();
const User = require('../../Models/user');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Joi = require('@hapi/joi');
const { sendResponse } = require('../../utils/responseHandler');

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Endpoints para la autenticación y recuperación de contraseña.
 */

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
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/StandardResponse'
 *       400:
 *         description: Contraseña no válida
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Usuario bloqueado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Usuario no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
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
 *     StandardResponse:
 *       type: object
 *       properties:
 *         code:
 *           type: integer
 *         status:
 *           type: string
 *         message:
 *           type: string
 *         data:
 *           type: object
 *           properties:
 *             token:
 *               type: string
 *     ErrorResponse:
 *       type: object
 *       properties:
 *         code:
 *           type: integer
 *         status:
 *           type: string
 *         message:
 *           type: string
 *         data:
 *           type: object
 */


router.post('/', async (req, res) => {
    try {
        // Validaciones
        const user = await User.findOne({ email: req.body.email });
        if (!user) {
            return sendResponse(res, 404, {}, 'Correo o contraseña incorrectos.');
        }

        if (user.isBlocked) {
            return sendResponse(res, 401, {}, 'El usuario está bloqueado. No puede iniciar sesión');
        }

        if (!user.isVerified) {
            return sendResponse(res, 401, {}, 'El usuario no ha verificado su cuenta. No puede iniciar sesión');
        }

        const validPassword = await bcrypt.compare(req.body.password, user.password);
        if (!validPassword) {
            return sendResponse(res, 400, {}, 'Correo o contraseña incorrectos.');
        }

        // Crear token JWT
        const token = jwt.sign(
            { _id: user._id },
            process.env.TOKEN_SECRET,
            { expiresIn: '1h' }
        );

        sendResponse(res, 200,  token , 'Inicio de sesión exitoso');
    } catch (error) {
        sendResponse(res, 500, {}, 'Error interno del servidor');
    }
});

module.exports = router;