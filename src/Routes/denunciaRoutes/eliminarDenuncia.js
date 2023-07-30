const router = require('express').Router();
const Denuncia = require('../../Models/denuncia');
const User = require('../../Models/user');
const Joi = require('@hapi/joi');
const cloudinary = require('cloudinary').v2;
const verifyToken = require('../../Middleware/validate-token');

/**
 * @swagger
 * tags:
 *   name: Denuncias
 *   description: Endpoints para  denucnias
 */

/**
 * @swagger
 * /denuncia/eliminarDenuncia:
 *   delete:
 *     summary: Elimina una denuncia por su título.
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
 *               tituloDenuncia:
 *                 type: string
 *                 description: Título de la denuncia a eliminar.
 *                 example: Denuncia de contaminación en parque público.
 *             required:
 *               - tituloDenuncia
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


//ELIMINAR DENUNCIA

router.delete('/', async (req, res) => {
    try {
        const { tituloDenuncia } = req.body;

        // Validar los datos de entrada usando Joi (puedes ajustar las reglas de validación según tus necesidades)
        const schema = Joi.object({
            tituloDenuncia: Joi.string().required().trim(),
        });

        const { error } = schema.validate({ tituloDenuncia });

        if (error) {
            return res.status(400).json({ error: error.details[0].message });
        }

        // Buscar y eliminar la denuncia por su título
        const denunciaEliminada = await Denuncia.findOneAndDelete({ tituloDenuncia });

        if (!denunciaEliminada) {
            return res.status(400).json({ error: 'Denuncia no encontrada.' });
        }

        return res.status(200).json({ message: 'Denuncia eliminada exitosamente.' });
    } catch (error) {
        console.error('Error al eliminar la denuncia:', error);
        return res.status(500).json({ error: 'Error del servidor al eliminar la denuncia.' });
    }
});

module.exports = router;