const router = require('express').Router();
const Denuncia = require('../../Models/denuncia');
const verifyAdminToken = require('../../Middleware/verifyAdminToken');

/**
 * @swagger
 * tags:
 *   name: Administrador
 *   description: Endpoints para administradores
 */

/**
 * @swagger
 * /admin/deleteDenuncia:
 *   post:
 *     summary: Eliminar una denuncia por su ID mediante un método POST.
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
 *               id:
 *                 type: string
 *                 description: ID de la denuncia a eliminar.
 *                 example: 6123456789abcdef12345678
 *     responses:
 *       200:
 *         description: Denuncia eliminada exitosamente.
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
 *                   example: "Denuncia eliminada exitosamente."
 *                 data:
 *                   type: object
 *       400:
 *         description: Solicitud incorrecta, denuncia no encontrada o ID no proporcionado.
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
 *                   example: "Denuncia no encontrada o ID no proporcionado."
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
 *                   example: "error"
 *                 message:
 *                   type: string
 *                   example: "Acceso no autorizado."
 *                 data:
 *                   type: object
 *       500:
 *         description: Error del servidor al eliminar la denuncia.
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
 *                   example: "Error del servidor al eliminar la denuncia."
 *                 data:
 *                   type: object
 */

router.post('/', verifyAdminToken, async (req, res) => {
    try {
        const { id } = req.body; // Extraer el ID de la denuncia del cuerpo de la solicitud

        if (!id) {
            return res.status(400).json({
                code: 400,
                status: 'error',
                message: 'Se debe proporcionar el ID de la denuncia.',
                data: {}
            });
        }

        const denunciaEliminada = await Denuncia.findByIdAndRemove(id);

        if (!denunciaEliminada) {
            return res.status(400).json({
                code: 400,
                status: 'error',
                message: 'Denuncia no encontrada.',
                data: {}
            });
        }

        return res.status(200).json({
            code: 200,
            status: 'success',
            message: 'Denuncia eliminada exitosamente.',
            data: {}
        });
    } catch (error) {
        console.error('Error al eliminar la denuncia:', error);
        return res.status(500).json({
            code: 500,
            status: 'error',
            message: 'Error del servidor al eliminar la denuncia.',
            data: {}
        });
    }
});

module.exports = router;
