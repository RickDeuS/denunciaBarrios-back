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
const validateUser = async (req, res) => {
    const { error } = schemaRegister.validate(req.body);
    if (error) {
        return res.status(400).json({ error: error.details[0].message });
    }
    return null;
};

const checkDuplicate = async (field, value, res) => {
    const user = await User.findOne({ [field]: value });
    if (user) {
        return res.status(400).json({ error: `${field} ya registrado` });
    }
    return null;
};

const sendVerificationEmail = async (user, verificationToken, email) => {
    const verificationURL = `https://como-va-mi-barrio-a1bd81410089.herokuapp.com/verificarCuenta/${verificationToken}`;
    const templatePath = path.join(__dirname, '..', '..', 'utils', 'verificationEmail.hbs');
    const verificationEmailTemplate = fs.readFileSync(templatePath, 'utf8');
    const template = handlebars.compile(verificationEmailTemplate);
    const verificationEmailContent = template({ nombreCompleto: user.nombreCompleto, verificationURL });

    const mailOptions = {
        from: process.env.USER_MAILER,
        to: email,
        subject: 'Verificación de cuenta',
        html: verificationEmailContent,
    };

    const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: {
            user: process.env.USER_MAILER,
            pass: process.env.PASS_MAILER,
        },
    });

    await transporter.sendMail(mailOptions);
};

router.post('/', upload.single('photo'), async (req, res) => {
    try {
        const validationError = await validateUser(req, res);
        if (validationError) return;

        const duplicateFields = await Promise.all([
            checkDuplicate('nombreCompleto', req.body.nombreCompleto, res),
            checkDuplicate('email', req.body.email, res),
            checkDuplicate('numTelefono', req.body.numTelefono, res),
            checkDuplicate('cedula', req.body.cedula, res),
        ]);
        if (duplicateFields.some((error) => error !== null)) return;

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(req.body.password, salt);
        const verificationToken = generateVerificationToken();

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
        }

        await sendVerificationEmail(user, verificationToken, req.body.email);

        const savedUser = await user.save();
        res.status(200).json({ error: null, data: savedUser });
    } catch (error) {
        res.status(500).json({ error: 'Error al guardar el usuario en la base de datos' });
    }
});

module.exports = router;
