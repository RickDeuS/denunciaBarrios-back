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
 *     summary: Eliminar una denuncia por su ID.
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
 *               _id:
 *                 type: string
 *                 description: ID de la denuncia a eliminar.
 *                 example: 6123456789abcdef12345678
 *             required:
 *               - _id
 *     responses:
 *       200:
 *         description: Denuncia eliminada exitosamente.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Denuncia eliminada exitosamente.
 *       400:
 *         description: Error en la solicitud del cliente o denuncia no encontrada.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Denuncia no encontrada.
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
 *         description: Error del servidor al eliminar la denuncia.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Error del servidor al eliminar la denuncia.
 */

router.post('/', async (req, res) => {
    try {
        const { _id } = req.body;

        // Validar que se proporcione el ID de la denuncia
        if (!_id) {
            return res.status(400).json({ error: 'Se debe proporcionar el ID de la denuncia.' });
        }

        // Buscar y actualizar el campo isDeleted de la denuncia por su ID
        const denunciaActualizada = await Denuncia.findByIdAndUpdate(_id, { isDeleted: true }, { new: true });

        if (!denunciaActualizada) {
            return res.status(400).json({ error: 'Denuncia no encontrada.' });
        }

        return res.status(200).json({ message: 'Denuncia eliminada exitosamente.' });
    } catch (error) {
        console.error('Error al eliminar la denuncia:', error);
        return res.status(500).json({ error: 'Error del servidor al eliminar la denuncia.' });
    }
});

module.exports = router;