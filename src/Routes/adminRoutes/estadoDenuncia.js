const router = require('express').Router();
const Denuncia = require('../../Models/denuncia');
const verifyAdminToken = require('../../Middleware/verifyAdminToken');
const nodemailer = require('nodemailer');
const fs = require('fs');
const handlebars = require('handlebars');
const path = require('path');

/**
 * @swagger
 * tags:
 *   - name: Administrador
 *     description: Endpoints para administradores
 * 
 * /admin/estadoDenuncia:
 *   post:
 *     summary: Modificar el estado de una denuncia por su ID.
 *     tags:
 *       - Administrador
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               _id:
 *                 type: string
 *                 description: ID de la denuncia a modificar.
 *                 example: 6123456789abcdef12345678
 *               estado:
 *                 type: string
 *                 description: Nuevo estado de la denuncia.
 *                 example: En proceso de solución
 *             required:
 *               - _id
 *               - estado
 *     responses:
 *       200:
 *         description: Estado de la denuncia modificado exitosamente.
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
 *                   example: success
 *                 message:
 *                   type: string
 *                   example: Estado de la denuncia modificado exitosamente.
 *                 data:
 *                   type: object
 *       400:
 *         description: Error en la solicitud del cliente o denuncia no encontrada.
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
 *                   example: error
 *                 message:
 *                   type: string
 *                   example: Denuncia no encontrada o parámetros faltantes.
 *                 data:
 *                   type: object
 *       401:
 *         description: No se proporcionó un token de autenticación válido.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                   example: 401
 *                 status:
 *                   type: string
 *                   example: error
 *                 message:
 *                   type: string
 *                   example: Acceso no autorizado.
 *                 data:
 *                   type: object
 *       500:
 *         description: Error del servidor al modificar el estado de la denuncia.
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
 *                   example: error
 *                 message:
 *                   type: string
 *                   example: Error del servidor al modificar el estado de la denuncia.
 *                 data:
 *                   type: object
 */

// const userMailer = process.env.USER_MAILER;
// const passMailer = process.env.PASS_MAILER;

// const transporter = nodemailer.createTransport({
//     service: 'gmail',
//     auth: {
//         user: userMailer,
//         pass: passMailer,
//     },
// });

router.post('/', verifyAdminToken, async (req, res) => {
    try {
        const { _id, estado } = req.body;

        if (!_id || !estado) {
            return res.status(400).json({
                code: 400,
                status: 'error',
                message: 'Se deben proporcionar el ID y el nuevo estado de la denuncia.',
                data: {}
            });
        }

        const denunciaActualizada = await Denuncia.findByIdAndUpdate(_id, { estado }, { new: true });

        if (!denunciaActualizada) {
            return res.status(400).json({
                code: 400,
                status: 'error',
                message: 'Denuncia no encontrada.',
                data: {}
            });
        }

        // Enviar correo electrónico al usuario sobre la actualización del estado de la denuncia (Opcional)
        // Omitido: Implementación del envío de correo electrónico para simplificar

        return res.status(200).json({
            code: 200,
            status: 'success',
            message: 'Estado de la denuncia modificado exitosamente.',
            data: { estado: denunciaActualizada.estado }
        });
    } catch (error) {
        console.error('Error al modificar el estado de la denuncia:', error);
        return res.status(500).json({
            code: 500,
            status: 'error',
            message: 'Error del servidor al modificar el estado de la denuncia.',
            data: {}
        });
    }
});

module.exports = router;