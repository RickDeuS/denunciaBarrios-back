const router = require('express').Router();
const Denuncia = require('../../Models/denuncia');
const User = require('../../Models/user');
const verifyAdminToken = require('../../Middleware/verifyAdminToken');

/**
 * @swagger
 * tags:
 *   - name: Administrador
 *     description: Endpoints para administradores
 * 
 * /admin/getGeneralView:
 *   post:
 *     summary: Obtiene estadísticas y reportes del sistema.
 *     tags:
 *       - Administrador
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Estadísticas y reportes generados correctamente.
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
 *                   example: "Estadísticas y reportes generados correctamente."
 *                 data:
 *                   type: object
 *                   properties:
 *                     totalDenuncias:
 *                       type: number
 *                     denunciasPorCategoria:
 *                       type: object
 *                     promedioTiempoResolucion:
 *                       type: number
 *                     totalUsuarios:
 *                       type: number
 *                     usuariosRegistrados:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/User'
 *                     denunciasPorEstado:
 *                       type: object
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
 *         description: Error del servidor al generar estadísticas.
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
 *                   example: "Error del servidor al generar estadísticas."
 *                 data:
 *                   type: object
 */

router.post('/', verifyAdminToken, async (req, res) => {
    try {
        const totalDenuncias = await Denuncia.countDocuments();
        const denunciasPorCategoria = await Denuncia.aggregate([
            {
                $group: {
                    _id: '$categoria',
                    count: { $sum: 1 },
                },
            },
        ]);
        const promedioTiempoResolucion = await Denuncia.aggregate([
            {
                $match: {
                    estado: 'Solucionada',
                },
            },
            {
                $group: {
                    _id: null,
                    promedio: { $avg: { $divide: [{ $subtract: ['$fechaHoraSolucion', '$fechaHora'] }, (1000 * 60 * 60 * 24)] } },
                },
            },
        ]);
        const totalUsuarios = await User.countDocuments();
        const usuariosRegistrados = await User.find({}, '-password -verificationToken -resetToken');
        const denunciasPorEstado = await Denuncia.aggregate([
            {
                $group: {
                    _id: '$estado',
                    count: { $sum: 1 },
                },
            },
        ]);

        res.status(200).json({
            code: 200,
            status: 'success',
            message: 'Estadísticas y reportes generados correctamente.',
            data: {
                totalDenuncias,
                denunciasPorCategoria,
                promedioTiempoResolucion: promedioTiempoResolucion.length > 0 ? promedioTiempoResolucion[0].promedio : 0,
                totalUsuarios,
                usuariosRegistrados,
                denunciasPorEstado,
            }
        });
    } catch (error) {
        console.error('Error al generar estadísticas:', error);
        res.status(500).json({
            code: 500,
            status: 'error',
            message: 'Error del servidor al generar estadísticas.',
            data: {}
        });
    }
});

module.exports = router;