const router = require('express').Router();
const User = require('../../Models/user');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const handlebars = require('handlebars');
const path = require('path');
const nodemailer = require('nodemailer');


/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Endpoints para la autenticación y recuperación de contraseña.
 */



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
 *                 error:
 *                   type: null
 *                 message:
 *                   type: string
 *                 token:
 *                   type: string
 *             example:
 *               error: null
 *               message: "Se ha enviado un correo electrónico para restablecer la contraseña"
 *               token: "your_reset_token_here"
 *       404:
 *         description: Usuario no encontrado.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *             example:
 *               error: "Usuario no encontrado"
 *       500:
 *         description: Error al recuperar la contraseña.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *             example:
 *               error: "Error al recuperar la contraseña"
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

        if(!cedula){
            return res.status(400).json({ error: 'La cédula no puede estar vacía' });
        }
        

        // Buscar al usuario por la cédula
        const user = await User.findOne({ cedula });
        const userId = user._id;

        if (!user) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }
        

        // Generar un token de restablecimiento 
        const resetToken = jwt.sign(
            {
                id: userId,
            },
            process.env.RESET_TOKEN_SECRET,
        );

        user.resetToken = resetToken;
        await user.save();

        // Enviar correo electrónico de recuperación de contraseña
        const templatePath = path.join(__dirname, '..','..', 'utils', 'passwordRecovery.hbs');
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

        const email = await new Promise((resolve, reject) => {
            transporter.sendMail(mailOptions, function (err, info) {
                if (err) {
                    resolve(err);
                } else {
                    resolve(info);
                }
            })
        });

        console.log("--------- ", mailOptions);
        console.log(transportSendGrid)

        res.json({
            error: null,
            message: 'Se ha enviado un correo electrónico para restablecer la contraseña',
            token: resetToken,
        });
    } catch (error) {
        res.status(500).json({ error: 'Error al recuperar la contraseña' });
        console.log("Error:", error);
    }
});

module.exports = router;