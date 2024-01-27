const router = require('express').Router();
const User = require('../../Models/user');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const handlebars = require('handlebars');
const path = require('path');
const nodemailer = require('nodemailer');

/**
 * @swagger
 * /auth/passwordRecovery:
 *   post:
 *     summary: Enviar correo electrónico para recuperar contraseña.
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               cedula:
 *                 type: string
 *             example:
 *               cedula: "1234567890"
 *     responses:
 *       200:
 *         description: Se ha enviado un correo electrónico para restablecer la contraseña.
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
 *                   properties:
 *                     token:
 *                       type: string
 *             example:
 *               code: 200
 *               status: "success"
 *               message: "Se ha enviado un correo electrónico para restablecer la contraseña"
 *               data:
 *                 token: "your_reset_token_here"
 *       400:
 *         description: La cédula no puede estar vacía.
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
 *             example:
 *               code: 400
 *               status: "error"
 *               message: "La cédula no puede estar vacía"
 *               data: {}
 *       404:
 *         description: Usuario no encontrado.
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
 *             example:
 *               code: 404
 *               status: "error"
 *               message: "Usuario no encontrado"
 *               data: {}
 *       500:
 *         description: Error al recuperar la contraseña.
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
 *             example:
 *               code: 500
 *               status: "error"
 *               message: "Error al recuperar la contraseña"
 *               data: {}
 */


//RECUPERAR CONTRASEÑA DE USUARIO

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

router.post('/', async (req, res) => {
    try {
        const { cedula } = req.body;

        if (!cedula) {
            return res.status(400).json({
                code: 400,
                status: 'error',
                message: 'La cédula no puede estar vacía',
                data: {}
            });
        }

        // Buscar al usuario por la cédula
        const user = await User.findOne({ cedula });
        if (!user) {
            return res.status(404).json({
                code: 404,
                status: 'error',
                message: 'Usuario no encontrado',
                data: {}
            });
        }

        // Generar un token de restablecimiento 
        const resetToken = jwt.sign({ id: user._id }, process.env.RESET_TOKEN_SECRET);
        user.resetToken = resetToken;
        await user.save();

        // Enviar correo electrónico de recuperación de contraseña
        const templatePath = path.join(__dirname, '..', '..', 'utils', 'passwordRecovery.hbs');
        const recuperarContrasenaTemplate = fs.readFileSync(templatePath, 'utf8');
        const template = handlebars.compile(recuperarContrasenaTemplate);
        const resetURL = `${process.env.FRONTEND_URL}/auth/newPassword/${resetToken}`;
        const recuperarContrasenaContent = template({
            nombreCompleto: user.nombreCompleto,
            resetURL: resetURL,
        });

        const mailOptions = {
            from: `"${userMailer}" <${userMailer}>`,
            to: user.email,
            subject: 'Recuperación de contraseña',
            html: recuperarContrasenaContent,
        };

        await new Promise((resolve, reject) => {
            transporter.sendMail(mailOptions, function (err, info) {
                if (err) {
                    reject(err);
                } else {
                    resolve(info);
                }
            });
        });

        res.json({
            code: 200,
            status: 'success',
            message: 'Se ha enviado un correo electrónico para restablecer la contraseña',
            data: {
                token: resetToken,
            }
        });
    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({
            code: 500,
            status: 'error',
            message: 'Error al recuperar la contraseña',
            data: {}
        });
    }
});

module.exports = router;