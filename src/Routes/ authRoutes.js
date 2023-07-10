/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Autenticación de usuarios
 */

const router = require('express').Router();
const User = require('../Models/user');
const Joi = require('@hapi/joi');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Validación de datos
const schemaRegister = Joi.object({
    nombreCompleto: Joi.string().min(6).max(255).required(),
    cedula: Joi.string().min(6).max(10).required(),
    numTelefono: Joi.string().min(6).max(10).required(),
    email: Joi.string().min(6).max(1024).required().email(),
    password: Joi.string().min(6).required()
});

const schemaLogin = Joi.object({
    email: Joi.string().min(6).max(255).required().email(),
    password: Joi.string().min(6).max(1024).required(),
});

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Registrar un nuevo usuario
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/User'
 *     responses:
 *       200:
 *         description: Usuario registrado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: null
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         description: Error de validación o email ya registrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *       500:
 *         description: Error al guardar el usuario en la base de datos
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 */
router.post('/register', async (req, res) => {
    // Validar usuario
    const { error } = schemaRegister.validate(req.body);

    if (error) {
        return res.status(400).json({ error: error.details[0].message });
    }

    const isEmailExist = await User.findOne({ email: req.body.email });
    if (isEmailExist) {
        return res.status(400).json({ error: 'Email ya registrado' });
    }

    const isNumTelefonoExist = await User.findOne({ numTelefono: req.body.numTelefono });
    if (isNumTelefonoExist) {
        return res.status(400).json({ error: 'Numero telefonico ya registrado' });
    }

    const isDniExist = await User.findOne({ cedula: req.body.cedula });
    if (isDniExist) {
        return res.status(400).json({ error: 'Cedula ya registrada' });
    }

    // Hash de la contraseña
    const salt = await bcrypt.genSalt(10);
    const password = await bcrypt.hash(req.body.password, salt);

    const user = new User({
        nombreCompleto: req.body.nombreCompleto,
        cedula: req.body.cedula,
        numTelefono: req.body.numTelefono,
        email: req.body.email,
        password: password,
    });
    try {
        const savedUser = await user.save();
        res.json({
            error: null,
            data: savedUser,
        });
    } catch (error) {
        res.status(500).json({ error: 'Error al guardar el usuario en la base de datos' });
        console.log(error);
    }
});

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

router.post('/login', async (req, res) => {
    // Validaciones
    const { error } = schemaLogin.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    const user = await User.findOne({ email: req.body.email });
    if (!user) return res.status(400).json({ error: 'Usuario no encontrado' });

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
