const router = require('express').Router();
const Denuncia = require('../../Models/denuncia');
const Joi = require('@hapi/joi');
const User = require('../../Models/user');
const verifyToken = require('../../Middleware/validate-token');

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
 *     summary: Marca una denuncia como eliminada.
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
 *               denunciaId:
 *                 type: string
 *                 description: ID de la denuncia a marcar como eliminada.
 *                 example: 613e489aeb037263d4d091ab
 *     responses:
 *       200:
 *         description: Denuncia marcada como eliminada.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                 status:
 *                   type: string
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *       400:
 *         description: Error en la solicitud del cliente.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                 status:
 *                   type: string
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *       404:
 *         description: Denuncia no encontrada.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                 status:
 *                   type: string
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *       500:
 *         description: Error del servidor al marcar la denuncia como eliminada.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                 status:
 *                   type: string
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 */


router.post('/', verifyToken, async (req, res) => {
    const idUsuario = req.user._id;
    const { denunciaId } = req.body;

    // Validación Joi (opcional)
    const schema = Joi.object({
        denunciaId: Joi.string().required(),
    });

    const { error } = schema.validate({ denunciaId });
    if (error) {
        return res.status(400).json({
            code: 400,
            status: 'error',
            message: error.details[0].message,
            data: {}
        });
    }

    try {
        const denunciaActualizada = await Denuncia.findByIdAndUpdate(denunciaId, { isDeleted: true }, { new: true });
        if (!denunciaActualizada) {
            return res.status(404).json({
                code: 404,
                status: 'error',
                message: 'Denuncia no encontrada',
                data: {}
            });
        }

        const usuario = await User.findById(idUsuario);
        if (usuario) {
            usuario.numDenunciasRealizadas = usuario.numDenunciasRealizadas - 1;
            await usuario.save();
        }

        return res.status(200).json({
            code: 200,
            status: 'success',
            message: 'Denuncia marcada como eliminada',
            data: {}
        });
    } catch (error) {
        console.error('Error al marcar la denuncia como eliminada:', error);
        return res.status(500).json({
            code: 500,
            status: 'error',
            message: 'Error del servidor al marcar la denuncia como eliminada',
            data: {}
        });
    }
});

module.exports = router;