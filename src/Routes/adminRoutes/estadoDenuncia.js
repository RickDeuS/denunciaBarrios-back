const router = require('express').Router();
const Denuncia = require('../../Models/denuncia');
const verifyAdminToken = require('../../Middleware/verifyAdminToken');
const nodemailer = require('nodemailer');
const fs = require('fs');
const handlebars = require('handlebars');
const path = require('path');
const { send } = require('process');
const { sendResponse } = require('../../utils/responseHandler');

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
            return sendResponse(res, 400, {}, 'Denuncia no encontrada o parámetros faltantes.');
        }

        const denunciaActualizada = await Denuncia.findByIdAndUpdate(_id, { estado }, { new: true });

        if (!denunciaActualizada) {
            return sendResponse(res, 400, {}, 'Denuncia no encontrada.');
        }

        // Enviar correo electrónico al usuario sobre la actualización del estado de la denuncia (Opcional)
        // Omitido: Implementación del envío de correo electrónico para simplificar

        return sendResponse(res, 200, {denunciaActualizada}, 'Estado de la denuncia modificado exitosamente.');
    } catch (error) {
        console.error('Error al modificar el estado de la denuncia:', error);
        return sendResponse(res, 500, {}, "Error del servidor al actualizar el estado de la denuncia")
    }
});

module.exports = router;