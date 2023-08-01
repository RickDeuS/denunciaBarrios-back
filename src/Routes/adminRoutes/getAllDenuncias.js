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
 * /admin/getAllDenuncias:
 *   get:
 *     summary: Ver todas las denuncias.
 *     tags: [Administrador]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de todas las denuncias.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Denuncia'
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
 *         description: Error del servidor al obtener las denuncias.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Error del servidor al obtener las denuncias.
 */

router.get('/', async (req, res) => {
    try {
        // Buscar todas las denuncias
        const denuncias = await Denuncia.find();

        return res.status(200).json(denuncias);
    } catch (error) {
        console.error('Error al obtener todas las denuncias:', error);
        return res.status(500).json({ error: 'Error del servidor al obtener las denuncias.' });
    }
});

module.exports = router;