const router = require('express').Router();
const Denuncia = require('../../Models/denuncia');
const User = require('../../Models/user');
const verifyAdminToken = require('../../Middleware/verifyAdminToken');

/**
 * @swagger
 * tags:
 *   name: Administrador
 *   description: Endpoints para administradores
 */

/**
 * @swagger
 * /admin/getGeneralView:
 *   get:
 *     summary: Obtiene estadísticas y reportes del sistema.
 *     tags: [Administrador]
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
 *                 totalDenuncias:
 *                   type: number
 *                   description: Número total de denuncias registradas en el sistema.
 *                 denunciasPorCategoria:
 *                   type: object
 *                   description: Número de denuncias por cada categoría.
 *                 promedioTiempoResolucion:
 *                   type: number
 *                   description: Promedio de tiempo (en días) para resolver denuncias.
 *                 totalUsuarios:
 *                   type: number
 *                   description: Número total de usuarios registrados en el sistema.
 *                 usuariosRegistrados:
 *                   type: array
 *                   description: Detalles de los usuarios registrados.
 *                   items:
 *                     $ref: '#/components/schemas/User'
 *                 denunciasPorEstado:
 *                   type: object
 *                   description: Número de denuncias por cada estado.
 *       401:
 *         description: No se proporcionó un token de autenticación válido.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Acceso no autorizado.
 *       500:
 *         description: Error del servidor al generar estadísticas.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Error del servidor al generar estadísticas.
 */

router.get('/', async (req, res) => {
    try {
        // Número total de denuncias registradas en el sistema
        const totalDenuncias = await Denuncia.countDocuments();

        // Número de denuncias por cada categoría
        const denunciasPorCategoria = await Denuncia.aggregate([
            {
                $group: {
                    _id: '$categoria',
                    count: { $sum: 1 },
                },
            },
        ]);

        // Promedio de tiempo (en días) para resolver denuncias
        const promedioTiempoResolucion = await Denuncia.aggregate([
            {
                $match: {
                    estado: 'Solucionada',
                },
            },
            {
                $group: {
                    _id: null,
                    promedio: { $avg: { $divide: [{ $subtract: ['$fechaHora', '$fechaHoraSolucion'] }, (1000 * 60 * 60 * 24)] } },
                },
            },
        ]);

        // Número total de usuarios registrados en el sistema
        const totalUsuarios = await User.countDocuments();

        // Detalles de los usuarios registrados
        const usuariosRegistrados = await User.find({}, { password: 0, verificationToken: 0, resetToken: 0 });

        // Número de denuncias por cada estado
        const denunciasPorEstado = await Denuncia.aggregate([
            {
                $group: {
                    _id: '$estado',
                    count: { $sum: 1 },
                },
            },
        ]);

        const estadisticas = {
            totalDenuncias,
            denunciasPorCategoria,
            promedioTiempoResolucion: promedioTiempoResolucion.length > 0 ? promedioTiempoResolucion[0].promedio : 0,
            totalUsuarios,
            usuariosRegistrados,
            denunciasPorEstado,
        };

        return res.status(200).json(estadisticas);
    } catch (error) {
        console.error('Error al generar estadísticas:', error);
        return res.status(500).json({ error: 'Error del servidor al generar estadísticas.' });
    }
});

module.exports = router;