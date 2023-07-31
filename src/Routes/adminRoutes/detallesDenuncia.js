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
 * /admin/verDetallesDenuncia:
 *   post:
 *     summary: Ver detalles de una denuncia por su ID.
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
 *                 description: ID de la denuncia a consultar.
 *                 example: 6123456789abcdef12345678
 *             required:
 *               - _id
 *     responses:
 *       200:
 *         description: Detalles de la denuncia obtenidos exitosamente.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Denuncia'
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
 *         description: Error del servidor al obtener los detalles de la denuncia.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Error del servidor al obtener los detalles de la denuncia.
 */

router.post('/',verifyAdminToken, async (req, res) => {
    try {
        const { _id } = req.body;

        // Validar que se proporcione el ID de la denuncia
        if (!_id) {
            return res.status(400).json({ error: 'Se debe proporcionar el ID de la denuncia.' });
        }

        // Buscar la denuncia por su ID
        const denuncia = await Denuncia.findById(_id);

        if (!denuncia) {
            return res.status(400).json({ error: 'Denuncia no encontrada.' });
        }

        return res.status(200).json(denuncia);
    } catch (error) {
        console.error('Error al obtener los detalles de la denuncia:', error);
        return res.status(500).json({ error: 'Error del servidor al obtener los detalles de la denuncia.' });
    }
});

module.exports = router;