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
    password: Joi.string().min(6).required(),
    role: Joi.string().default('USER'),
});

const schemaLogin = Joi.object({
    email: Joi.string().min(6).max(255).required().email(),
    password: Joi.string().min(6).max(1024).required(),
});

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
        res.status(400).json({ error });
    }
});

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
