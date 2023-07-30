const router = require('express').Router();
const Denuncia = require('../../Models/denuncia');
const Joi = require('@hapi/joi');

/**
 * @swagger
 * tags:
 *   name: Denuncias
 *   description: Endpoints para denuncias
 */

/**
 * @swagger
 * /denuncias/eliminarDenuncia:
 *   post:
 *     summary: Elimina una denuncia por su ID.
 *     tags: [Denuncias]
 *     security:
 *        - BearerAuth: []
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
 *                 example: 613e489aeb037263d4d091ab
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

        // Validar los datos 
        const schema = Joi.object({
            _id: Joi.string().required().trim(),
        });

        const { error } = schema.validate({ _id });

        if (error) {
            return res.status(400).json({ error: error.details[0].message });
        }

        // Buscar  la denuncia por ID para cambiar el campo isDeleted a true
        const denunciaActualizada = await Denuncia.findByIdAndUpdate(_id, { isDeleted: true }, { new: true });

        if (!denunciaActualizada) {
            return res.status(404).json({ error: 'Denuncia no encontrada.' });
        }

        return res.status(200).json({ message: 'Denuncia eliminada exitosamente.' });
    } catch (error) {
        console.error('Error al eliminar la denuncia:', error);
        return res.status(500).json({ error: 'Error del servidor al eliminar la denuncia.' });
    }
});

module.exports = router;