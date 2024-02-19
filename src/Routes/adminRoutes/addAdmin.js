const router = require('express').Router();
const Admin = require('../../Models/admin');
const bcrypt = require('bcrypt');
const verifyAdminToken = require('../../Middleware/verifyAdminToken');
const nodemailer = require('nodemailer');
const generateVerificationToken = require('../../utils/generateVerificationToken');
const fs = require('fs');
const handlebars = require('handlebars');
const path = require('path');


/**
 * @swagger
 * tags:
 *   name: Administrador
 *   description: Endpoints para administradores
 */

/**
 * @swagger
 * /admin/addAdmin:
 *   post:
 *     summary: Añade un nuevo administrador.
 *     tags: [Administrador]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombreCompleto:
 *                 type: string
 *                 description: Nombre completo del administrador.
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Dirección de correo electrónico del administrador.
 *               password:
 *                 type: string
 *                 format: password
 *                 description: Contraseña del administrador.
 *             example:
 *               nombreCompleto: Administrador Nuevo
 *               email: adminnuevo@example.com
 *               password: password123
 *     responses:
 *       200:
 *         description: Administrador añadido exitosamente.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                   example: 200
 *                 status:
 *                   type: string
 *                   example: "success"
 *                 message:
 *                   type: string
 *                   example: "Administrador añadido exitosamente."
 *                 data:
 *                   type: object
 *                   properties:
 *                     adminId:
 *                       type: string
 *                       example: "6123456789abcdef12345678"
 *       400:
 *         description: Solicitud incorrecta, ya sea por datos faltantes o administrador existente.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                   example: 400
 *                 status:
 *                   type: string
 *                   example: "error"
 *                 message:
 *                   type: string
 *                   example: "Ya existe un administrador con ese correo electrónico."
 *                 data:
 *                   type: object
 *       500:
 *         description: Error interno del servidor.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                   example: 500
 *                 status:
 *                   type: string
 *                   example: "error"
 *                 message:
 *                   type: string
 *                   example: "Error del servidor al agregar un administrador."
 *                 data:
 *                   type: object
 */

const userMailer = process.env.USER_MAILER;
const passMailer = process.env.PASS_MAILER;

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

router.post('/',  async (req, res) => {
    const { email, nombreCompleto, password } = req.body; // Corregido para desestructurar correctamente

    try {
        if (!nombreCompleto || !email || !password) {
            return res.status(400).json({
                code: 400,
                status: 'error',
                message: 'Por favor, ingrese todos los campos requeridos.',
                data: {}
            });
        }

        const adminExistente = await Admin.findOne({ email: email }); // Asegúrate de buscar por el campo de email
        if (adminExistente) {
            return res.status(400).json({
                code: 400,
                status: 'error',
                message: 'Ya existe un administrador con ese correo electrónico.',
                data: {}
            });
        }

        const verificationToken = generateVerificationToken();

        const nuevoAdmin = new Admin({
            nombreCompleto: nombreCompleto, // Asegúrate de asignar correctamente
            email: email, // Asegúrate de asignar correctamente
            password: password, // La contraseña se asignará después de encriptarla
            isVerified: false,
            verificationToken: verificationToken // Asegúrate de asignar correctamente
        });

        const salt = await bcrypt.genSalt(10);
        nuevoAdmin.password = await bcrypt.hash(nuevoAdmin.password, salt); 

        const verificationURL = `${process.env.FRONTEND_URL}/verificarCuenta/${verificationToken}`;
        const templatePath = path.join(__dirname, '..', '..', 'utils', 'verificationEmailAdmin.hbs');
        const verificationEmailTemplate = fs.readFileSync(templatePath, 'utf8');
        const template = handlebars.compile(verificationEmailTemplate);

        const verificationEmailContent = template({
            nombreCompleto: req.body.nombreCompleto,
            verificationURL: verificationURL,
        });
        const mailOptions = {
            from: userMailer,
            to: req.body.email,
            subject: 'Verificación de cuenta de Administrador',
            html: verificationEmailContent,
        };
        //  await transporter.sendMail(mailOptions, function (err, msg) {

        //  });


        const emailUser = await new Promise((resolve, reject) => {
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

        const savedAdmin = await nuevoAdmin.save();

        return res.status(200).json({
            code: 200,
            status: 'success',
            message: 'Administrador añadido exitosamente.',
            data: { savedAdmin }
        });
    } catch (error) {
        console.error('Error al agregar un administrador:', error);
        return res.status(500).json({
            code: 500,
            status: 'error',
            message: 'Error del servidor al agregar un administrador.',
            data: {}
        });
    }
});

module.exports = router;