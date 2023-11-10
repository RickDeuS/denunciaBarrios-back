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
 * /denuncias/eliminarDenuncia/{id}:
 *   delete:
 *     summary: Elimina una denuncia por su ID.
 *     tags: [Denuncias]
 *     security:
 *        - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID de la denuncia a eliminar.
 *         example: 613e489aeb037263d4d091ab
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

router.delete('/:_id', verifyToken, async (req, res) => {
    const idUsuario = req.user._id;
    const denunciaId = req.params._id;

    try {
        // Buscar y eliminar la denuncia por ID
        const denunciaEliminada = await Denuncia.findByIdAndRemove(denunciaId);

        if (!denunciaEliminada) {
            return res.status(404).json({ error: 'Denuncia no encontrada.' });
        }

        const usuario = await User.findById(idUsuario);
        usuario.numDenunciasRealizadas = usuario.numDenunciasRealizadas - 1;
        await usuario.save();

        return res.status(200).json({ message: 'Denuncia eliminada exitosamente.' });
    } catch (error) {
        console.error('Error al eliminar la denuncia:', error);
        return res.status(500).json({ error: 'Error del servidor al eliminar la denuncia.' });
    }
});

module.exports = router;