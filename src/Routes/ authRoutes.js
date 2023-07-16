const router = require('express').Router();
const User = require('../Models/user');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Joi = require('@hapi/joi');
const cloudinary = require('cloudinary').v2;
const multer = require('multer');
const nodemailer = require('nodemailer');
const generateVerificationToken = require('../utils/generateVerificationToken');
const fs = require('fs');
const handlebars = require('handlebars');
const path = require('path');

// Configuración Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_APIKEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
});

// Configuración Multer
const storage = multer.diskStorage({});
const upload = multer({ storage });

// Validación de datos
const schemaRegister = Joi.object({
    nombreCompleto: Joi.string().min(6).max(255).required(),
    cedula: Joi.string().min(6).max(10).required(),
    numTelefono: Joi.string().min(6).max(10).required(),
    email: Joi.string().min(6).max(1024).required().email(),
    password: Joi.string().min(6).required(),
    photo: Joi.string().min(6).max(1024),
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
 *         multipart/form-data:
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

const userMailer = process.env.USER_MAILER;
const passMailer = process.env.PASS_MAILER;

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: userMailer,
        pass: passMailer,
    },
});


router.post('/register', upload.single('photo'), async (req, res) => {
    try {
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
        const hashedPassword = await bcrypt.hash(req.body.password, salt);

        const user = new User({
            nombreCompleto: req.body.nombreCompleto,
            cedula: req.body.cedula,
            numTelefono: req.body.numTelefono,
            email: req.body.email,
            password: hashedPassword,
            photo: '',
            verificationToken: generateVerificationToken(),
            isVerified: false,
        });

        if (req.file) {
            const result = await cloudinary.uploader.upload(req.file.path, { folder: 'profile_photos' });
            user.photo = result.secure_url; // Asignar la URL de la imagen a 'photo'
            console.log("Imagen subida a Cloudinary:", result);
        }

        const savedUser = await user.save();
        console.log("Usuario guardado en la base de datos:", savedUser);

        // Generar el token y construir la URL de verificación
        const verificationToken = generateVerificationToken();
        const verificationURL = `https://back-barrios-462cb6c76674.herokuapp.com/auth/verifyUser/${verificationToken}`;

        // Enviar correo electrónico de verificación
        const templatePath = path.join(__dirname, '..', 'utils', 'verificationEmail.hbs');
        const verificationEmailTemplate = fs.readFileSync(templatePath, 'utf8');
        const template = handlebars.compile(verificationEmailTemplate);
        const verificationEmailContent = template({
            nombreCompleto: req.body.nombreCompleto,
            verificationURL: verificationURL,
        });

        const mailOptions = {
            from: `Denuncia Loja `,
            to: req.body.email,
            subject: 'Verificación de cuenta',
            html: verificationEmailContent,
        };

        await transporter.sendMail(mailOptions);

        res.json({
            error: null,
            data: savedUser,
        });
    } catch (error) {
        res.status(500).json({ error: 'Error al guardar el usuario en la base de datos' });
        console.log("Error:", error);
        console.log("req.file:", req.file);
    }
});

router.post('/verifyUser', async (req, res) => {
    const token = req.body.verificationToken; // Obtener el token de verificación del cuerpo

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

router.post('/login', async (req, res) => {
    // Validaciones
    const { error } = schemaLogin.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    const user = await User.findOne({ email: req.body.email });
    if (!user) return res.status(400).json({ error: 'Usuario no encontrado' });

    // Verificar si el usuario está verificado
    if (!user.isVerified) {
        return res.status(401).json({ error: 'El usuario no está verificado' });
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
    user.token = token;
    await user.save();
    res.header('auth-token', token).json({
        error: null,
        data: { token },
    });
});


router.post('/recuperarContraseña', async (req, res) => {

});

module.exports = router;
