const router = require('express').Router();
const User = require('../../Models/user');
const verifyAdminToken = require('../../Middleware/verifyAdminToken');

/**
 * @swagger
 * tags:
 *   - name: Administrador
 *     description: Endpoints para administradores
 * 
 * /admin/getAllUsers:
 *   get:
 *     summary: Obtener todas las cuentas de usuario registradas.
 *     tags:
 *       - Administrador
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de todas las cuentas de usuario obtenida exitosamente.
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
 *                   example: "Lista de todas las cuentas de usuario obtenida exitosamente."
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/User'
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
 *       500:
 *         description: Error del servidor al obtener las cuentas de usuario.
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
 *                   example: "Error del servidor al obtener las cuentas de usuario."
 *                 data:
 *                   type: object
 */

router.get('/getAllUsers', verifyAdminToken, async (req, res) => {
    try {
        const usuarios = await User.find({}, '-password'); 
        res.status(200).json({
            code: 200,
            status: 'success',
            message: 'Lista de todas las cuentas de usuario obtenida exitosamente.',
            data: usuarios
        });
    } catch (error) {
        console.error('Error al obtener las cuentas de usuario:', error);
        res.status(500).json({
            code: 500,
            status: 'error',
            message: 'Error del servidor al obtener las cuentas de usuario.',
            data: {}
        });
    }
});

module.exports = router;