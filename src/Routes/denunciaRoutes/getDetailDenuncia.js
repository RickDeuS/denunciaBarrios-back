const router = require('express').Router();
const Denuncia = require('../../Models/denuncia');
const { sendResponse } = require('../../utils/responseHandler');

/**
 * @swagger
 * tags:
 *   name: Denuncias
 *   description: Endpoints para denuncias
 */

/**
 * @swagger
 *   /denuncias/getDetailDenuncia:
 *   post:
 *     summary: Ver detalles de una denuncia por su ID.
 *     tags: [Denuncias]
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
 *                   example: "Detalles de la denuncia obtenidos exitosamente."
 *                 data:
 *                   $ref: '#/components/schemas/Denuncia'
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
 *                   example: "error"
 *                 message:
 *                   type: string
 *                   example: "Denuncia no encontrada."
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
 *         description: Error del servidor al obtener los detalles de la denuncia.
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
 *                   example: "Error del servidor al obtener los detalles de la denuncia."
 *                 data:
 *                   type: object
 */

router.get('/', async (req, res) => {
    try {
        const { _id } = req.query;

        if (!_id) {
            return sendResponse(res, 400, {}, 'Se debe proporcionar el ID de la denuncia.');
        }

        const denuncia = await Denuncia.findById(_id);

        if (!denuncia) {
            return sendResponse(res, 404, {}, 'Denuncia no encontrada.');
        }

        sendResponse(res, 200, {denuncia}, 'Detalles de la denuncia obtenidos exitosamente.');
    } catch (error) {
        console.error('Error al obtener los detalles de la denuncia:', error);
        sendResponse(res, 500, {}, 'Error del servidor al obtener los detalles de la denuncia.');
    }
});

module.exports = router;
