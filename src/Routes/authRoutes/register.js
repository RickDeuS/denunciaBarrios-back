const router = require('express').Router();
const User = require('../../Models/user');
const bcrypt = require('bcrypt');
const cloudinary = require('cloudinary').v2;
const multer = require('multer');
const nodemailer = require('nodemailer');
const generateVerificationToken = require('../../utils/generateVerificationToken');
const fs = require('fs');
const handlebars = require('handlebars');
const path = require('path');
const schemaRegister = require('./schemaRegister');

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



const transportSendGrid = {

    tls: { rejectUnauthorized: false },

    host: "smtp.sendgrid.net",

    port: 587,

    secure: false,

    auth: {

        user: "apikey",

        pass: passMailer,



    }

}


var transporter = nodemailer.createTransport(transportSendGrid);


router.post('/', upload.single('photo'), async (req, res) => {
    try {
        // Validar usuario
        const { error } = schemaRegister.validate(req.body);
        if (error) {
            return res.status(400).json({ error: error.details[0].message });
        }
        const isNombreCompletoExist = await User.findOne({ nombreCompleto: req.body.nombreCompleto });
        if (isNombreCompletoExist) {
            return res.status(400).json({ error: 'Nombre ya registrado' });
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
        const verificationToken = generateVerificationToken();
        console.log("Verification Token: ", verificationToken);
        const user = new User({
            nombreCompleto: req.body.nombreCompleto,
            cedula: req.body.cedula,
            numTelefono: req.body.numTelefono,
            email: req.body.email,
            password: hashedPassword,
            photo: '',
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
        console.log("URL de verificación:", verificationURL);
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
        console.log("--------- ", mailOptions);
        console.log(transportSendGrid)
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
        console.log("--- ", email)
        //return; 

        //await transporter.sendMail(mailOptions);
        const savedUser = await user.save();
        res.json({
            error: null,
            data: savedUser,
        });
    } catch (error) {
        // Manejar cualquier error durante el proceso
        res.status(500).json({ error: 'Error al guardar el usuario en la base de datos' });
        console.log("Error:", error);
        await User.deleteOne({ email: req.body.email });
    }

    return;
});

module.exports = router;



///////////////////////