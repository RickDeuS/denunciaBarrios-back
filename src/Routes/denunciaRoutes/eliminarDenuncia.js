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
 *                 message:
 *                   type: string
 *                   example: Denuncia marcada como eliminada.
 *       400:
 *         description: Error en la solicitud del cliente.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Datos de entrada inválidos.
 *       404:
 *         description: Denuncia no encontrada.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Denuncia no encontrada.
 *       500:
 *         description: Error del servidor al marcar la denuncia como eliminada.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Error del servidor al marcar la denuncia como eliminada.
 */

router.post('/eliminarDenuncia', verifyToken, async (req, res) => {
    const idUsuario = req.user._id;
    const { denunciaId } = req.body; // Obtener el ID de la denuncia desde el cuerpo de la solicitud

    // Validación Joi (opcional)
    const schema = Joi.object({
        denunciaId: Joi.string().required(),
    });

    const { error } = schema.validate({ denunciaId });
    if (error) {
        return res.status(400).json({ error: error.details[0].message });
    }

    try {
        // Actualizar la denuncia marcándola como eliminada
        const denunciaActualizada = await Denuncia.findByIdAndUpdate(denunciaId, { isDeleted: true }, { new: true });

        if (!denunciaActualizada) {
            return res.status(404).json({ error: 'Denuncia no encontrada.' });
        }

        // Opcional: Actualizar el contador de denuncias del usuario
        const usuario = await User.findById(idUsuario);
        if (usuario) {
            usuario.numDenunciasRealizadas = usuario.numDenunciasRealizadas - 1;
            await usuario.save();
        }

        return res.status(200).json({ message: 'Denuncia marcada como eliminada.' });
    } catch (error) {
        console.error('Error al marcar la denuncia como eliminada:', error);
        return res.status(500).json({ error: 'Error del servidor al marcar la denuncia como eliminada.' });
    }
});

module.exports = router;