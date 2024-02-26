const router = require('express').Router();
const User = require('../../Models/user');
const verifyAdminToken = require('../../Middleware/verifyAdminToken');
const { sendResponse } = require('../../utils/responseHandler');

/**
 * @swagger
 * tags:
 *   - name: Administrador
 *     description: Endpoints para administradores
 * 
 * /admin/statusUser:
 *   post:
 *     summary: Bloquear o desbloquear una cuenta de usuario por su ID.
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
 *                 description: ID del usuario a bloquear o desbloquear.
 *               status:
 *                 type: string
 *                 description: Estado deseado para la cuenta del usuario ('block' o 'unblock').
 *             example:
 *               _id: "123456789"
 *               status: "block"
 *     responses:
 *       200:
 *         description: Estado de la cuenta de usuario actualizado correctamente.
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
 *                   example: "Cuenta de usuario bloqueada/desbloqueada correctamente."
 *                 data:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                     isBlocked:
 *                       type: boolean
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
 *                   example: "error"
 *                 message:
 *                   type: string
 *                   example: "Acceso no autorizado."
 *                 data:
 *                   type: object
 *       404:
 *         description: Usuario no encontrado.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                   example: 404
 *                 status:
 *                   type: string
 *                   example: "error"
 *                 message:
 *                   type: string
 *                   example: "Usuario no encontrado."
 *                 data:
 *                   type: object
 *       500:
 *         description: Error del servidor al actualizar el estado de la cuenta de usuario.
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
 *                   example: "Error del servidor al actualizar el estado de la cuenta de usuario."
 *                 data:
 *                   type: object
 */

router.post('/', verifyAdminToken, async (req, res) => {
    try {
        const { _id, status } = req.body; 

        // Validar que el estado sea 'block' o 'unblock'
        if (!_id || (status !== 'block' && status !== 'unblock')) {
            return sendResponse(res, 400, {}, 'Se deben proporcionar el ID del usuario y un estado válido (block/unblock).' )
        }

        const usuario = await User.findById(_id);
        if (!usuario) {
            return sendResponse(res, 404, {},'Usuario no encontrado.' )
        }

        usuario.isBlocked = status === 'block';
        await usuario.save();

        return sendResponse(
            res, 
            200, 
            { _id: usuario._id, isBlocked: usuario.isBlocked }, 
            status === 'block' ? 'Cuenta de usuario bloqueada correctamente.' : 'Cuenta de usuario desbloqueada correctamente.')

    } catch (error) {
        console.error('Error al actualizar el estado de la cuenta de usuario:', error);
        return sendResponse(res, 500, {}, 'Error del servidor al actualizar el estado de la cuenta de usuario.')
    }
});

module.exports = router;