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
 * /admin/getUser:
 *   post:
 *     summary: Obtener detalles de un usuario por su ID.
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
 *                 description: ID del usuario a consultar.
 *             example:
 *               _id: "123456789"
 *     responses:
 *       200:
 *         description: Detalles del usuario obtenidos exitosamente.
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
 *                   example: "Detalles del usuario obtenidos exitosamente."
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         description: Usuario no encontrado o ID de usuario faltante.
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
 *                   example: "Usuario no encontrado o ID de usuario faltante."
 *                 data:
 *                   type: object
 *       500:
 *         description: Error del servidor al obtener los detalles del usuario.
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
 *                   example: "Error del servidor al obtener los detalles del usuario."
 *                 data:
 *                   type: object
 */

router.post('/', verifyAdminToken, async (req, res) => {
    try {
        const { _id } = req.body;

        if (!_id) {
            return  sendResponse(res, 400, {}, 'Se debe proporcionar el ID del usuario.')
        }

        const usuario = await User.findById(_id, '-password'); 

        if (!usuario) {
            return sendResponse(res, 400, {},'Usuario no encontrado.' )
        }

        return sendResponse(res, 200, usuario, 'Detalles del usuario obtenidos exitosamente.')
    } catch (error) {
        console.error('Error al obtener los detalles del usuario:', error);
        return sendResponse(res, 500, {}, 'Error del servidor al obtener los detalles del usuario.')
    }
});

module.exports = router;