const router = require('express').Router();
const User = require('../../Models/user');
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
const generateVerificationToken = require('../../utils/generateVerificationToken');
const fs = require('fs');
const handlebars = require('handlebars');
const path = require('path');
const schemaRegister = require('./schemaRegister');
const { Resend } = require("resend");
const multer = require('multer');
const cloudinary = require('cloudinary').v2;

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Endpoints para la autenticación y recuperación de contraseña.
 */

/**
 * @swagger
 *  /auth/register:
 *   post:
 *     summary: Registrar un nuevo usuario
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               nombreCompleto:
 *                 type: string
 *                 minLength: 6
 *                 maxLength: 255
 *               cedula:
 *                 type: string
 *                 minLength: 6
 *                 maxLength: 10
 *               numTelefono:
 *                 type: string
 *                 minLength: 6
 *                 maxLength: 10
 *               email:
 *                 type: string
 *                 minLength: 6
 *                 maxLength: 1024
 *               password:
 *                 type: string
 *                 minLength: 6
 *               photo:
 *                 type: string
 *                 minLength: 6
 *                 maxLength: 1024
 *             required:
 *               - nombreCompleto
 *               - cedula
 *               - numTelefono
 *               - email
 *               - password
 *     responses:
 *       200:
 *         description: Usuario registrado exitosamente
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
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         description: Error de validación
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
 *         description: Error al guardar el usuario en la base de datos
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
const userMailer = process.env.USER_MAILER;
const passMailer = process.env.PASS_MAILER;
const resendApiKey = process.env.RESEND_API_KEY;

const transporter = nodemailer.createTransport({
    service: 'gmail',
    host: 'smtp.gmail.com',
    port: 465,
    secure: true, 
    auth: {
        user: userMailer,
        pass: passMailer,
    },
    tls: {
        // do not fail on invalid certs
        rejectUnauthorized: false,
    },
});




router.post('/', async (req, res) => {
    try {
        // Validar usuario
        const { error } = schemaRegister.validate(req.body);
        if (error) {
            return res.status(400).json({
                code: 400,
                status: 'error',
                message: error.details[0].message,
                data: {}
            });
        }

        // const isNombreCompletoExist = await User.findOne({ nombreCompleto: req.body.nombreCompleto });
        // if (isNombreCompletoExist) {
        //     return res.status(400).json({
        //         code: 400,
        //         status: 'error',
        //         message: 'Email ya registrado',
        //         data: {}
        //     });
        // }

        const isEmailExist = await User.findOne({ email: req.body.email });
        if (isEmailExist) {
            return res.status(400).json({
                code: 400,
                status: 'error',
                message: 'Este email ya ha sido registrado.',
                data: {}
            });
        }

        const isNumTelefonoExist = await User.findOne({ numTelefono: req.body.numTelefono });
        if (isNumTelefonoExist) {
            return res.status(400).json({
                code: 400,
                status: 'error',
                message: 'Este número de teléfono ya ha sido registrado.',
                data: {}
            });
        }

        const isDniExist = await User.findOne({ cedula: req.body.cedula });
        if (isDniExist) {
            return res.status(400).json({
                code: 400,
                status: 'error',
                message: 'Esta cédula ya ha sido registrada.',
                data: {}
            });
        }

        // Hash de la contraseña
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(req.body.password, salt);
        const verificationToken = generateVerificationToken();
        const user = new User({
            nombreCompleto: req.body.nombreCompleto,
            cedula: req.body.cedula,
            numTelefono: req.body.numTelefono,
            email: req.body.email,
            password: hashedPassword,
            // photo: '',
            verificationToken,
            isVerified: false,
        });
        if (req.file) {
            const result = await cloudinary.uploader.upload(req.file.path, { folder: 'profile_photos' });
            user.photo = result.secure_url;
            console.log("Imagen subida a Cloudinary");
        }
        // Enviar el correo electrónico de verificación
        const verificationURL = `https://como-va-mi-barrio-a1bd81410089.herokuapp.com/verificarCuenta/${verificationToken}`;
        const templatePath = path.join(__dirname, '..', '..', 'utils', 'verificationEmail.hbs');
        const verificationEmailTemplate = fs.readFileSync(templatePath, 'utf8');
        const template = handlebars.compile(verificationEmailTemplate);

        const verificationEmailContent = template({
            nombreCompleto: req.body.nombreCompleto,
            verificationURL: verificationURL,
        });
        const mailOptions = {
            from: userMailer,
            to: req.body.email,
            subject: 'Verificación de cuenta',
            html: verificationEmailContent,
        };
        //  await transporter.sendMail(mailOptions, function (err, msg) {

        //  });


        const email = await new Promise((resolve, reject) => {
            transporter.sendMail(mailOptions, function (err, info) {
                if (err) {
                    resolve(err);
                } else {
                    resolve(info);
                }
            })
        });
        //return; 

        //await transporter.sendMail(mailOptions);
        const savedUser = await user.save();        
        res.json({
            code: 200,
            status: 'success',
            message: 'Usuario registrado exitosamente',
            data: savedUser
        });
    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({
            code: 500,
            status: 'error',
            message: 'Error al guardar el usuario en la base de datos',
            data: {}
        });
    }
});

module.exports = router;



///////////////////////