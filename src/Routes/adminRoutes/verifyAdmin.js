const router = require('express').Router();
const Admin = require('../../Models/admin');
const { sendResponse } = require('../../utils/responseHandler');

/**
 * @swagger
 * tags:
 *   - name: Administrador
 *     description: Endpoints para administradores
 * 
 * /admin/verifyAdmin/{token}:
 *   post:
 *     summary: Verifica la cuenta de un administrador. 
 *     tags:
 *       - Administrador
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               verificationToken:
 *                 type: string
 *             example:
 *               verificationToken: "your_verification_token_here"
 *     responses:
 *       200:
 *         description: Cuenta verificada correctamente.
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
 *       400:
 *         description: Token de verificación no proporcionado.
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
 *       404:
 *         description: Token inválido o expirado.
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
 *         description: Error al verificar la cuenta.
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

//VERIFICA CUENTA DE ADMINITRADOR

router.post('/:token', async (req, res) => {
    try {
        const token = req.params.token;

        if (!token) {
            return sendResponse(res, 400, {}, 'Token de verificación no proporcionado');
        }

        const admin = await Admin.findOne({ verificationToken: token });
        if (!admin) {
            return sendResponse(res, 404, {}, 'Token inválido o expirado');
        }

        admin.isVerified = true;
        admin.verificationToken = undefined; 
        await admin.save();

        sendResponse(res, 200, {}, 'Cuenta verificada correctamente');
    } catch (error) {
        console.error("Error al verificar la cuenta:", error);
        sendResponse(res, 500, {}, 'Error al verificar la cuenta');
    }
});

module.exports = router;