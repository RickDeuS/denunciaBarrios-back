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

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: userMailer,
        pass: passMailer,
    },
});

router.post('/', async (req, res) => {
    try {
        const { cedula } = req.body;

        // Buscar al usuario por la cédula
        const user = await User.findOne({ cedula });

        if (!user) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }

        // Generar un token de restablecimiento 
        const resetToken = jwt.sign(
            {
                userId: user._id,
            },
            process.env.RESET_TOKEN_SECRET,
            { expiresIn: '1h' } 
        );

        user.resetToken = resetToken;
        await user.save();

        // Enviar correo electrónico de recuperación de contraseña
        const templatePath = path.join(__dirname, '..', 'utils', 'passwordRecovery.hbs');
        const recuperarContrasenaTemplate = fs.readFileSync(templatePath, 'utf8');
        const template = handlebars.compile(recuperarContrasenaTemplate);
        const resetURL = `http://localhost:5000/auth/newPassword/${resetToken}`;
        const recuperarContrasenaContent = template({
            nombreCompleto: user.nombreCompleto,
            resetURL: resetURL,
        });

        const mailOptions = {
            from: `Denuncia Loja `,
            to: user.email,
            subject: 'Recuperación de contraseña',
            html: recuperarContrasenaContent,
        };

        await transporter.sendMail(mailOptions);

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