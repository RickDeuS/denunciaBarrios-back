const router = require('express').Router();
const verifyToken = require('../../Middleware/validate-token');
const Denuncia = require('../../Models/denuncia');
const User = require('../../Models/user');
const Joi = require('@hapi/joi');

/**
 * @swagger
 * tags:
 *   name: Denuncias
 *   description: Endpoints para denuncias
 */

/**
 * @swagger
 *   /denuncias/getDenunciasUser:
 *     get:
 *       summary: Obtiene todas las denuncias realizadas por el usuario autenticado.
 *       tags: [Denuncias]
 *       security:
 *         - BearerAuth: []
 *       responses:
 *         200:
 *           description: Retorna un arreglo de denuncias realizadas por el usuario.
 *           content:
 *             application/json:
 *               schema:
 *                 type: array
 *                 items:
 *                   $ref: '#/components/schemas/Denuncia'
 *         404:
 *           description: Usuario no encontrado o el usuario no ha presentado denuncias.
 *           content:
 *             application/json:
 *               schema:
 *                 type: object
 *                 properties:
 *                   error:
 *                     type: string
 *                     example: Usuario no encontrado.
 *         500:
 *           description: Error del servidor al obtener las denuncias.
 *           content:
 *             application/json:
 *               schema:
 *                 type: object
 *                 properties:
 *                   error:
 *                     type: string
 *                     example: Error del servidor al obtener las denuncias.
 */

// Ruta para obtener todas las denuncias realizadas por el usuario autenticado.
router.get('/', async (req, res) => {
    try {
        // const usuarioId = '64c5688cfb56baad04c3ad58';
        const usuarioId = req.user._id;

        const usuario = await User.findById(usuarioId);
        if (!usuario) {
            return res.status(404).json({ error: 'Usuario no encontrado.' });
        }

        const denuncias = await Denuncia.find({
            idDenunciante: usuarioId,
            isDeleted: false,
        });

        if (denuncias.length === 0) {
            return res.status(200).json({ message: 'El usuario no ha presentado denuncias.' });
        }

        res.status(200).json(denuncias);
    } catch (error) {
        console.error('Error al obtener las denuncias:', error);
        res.status(500).json({ error: 'Error del servidor al obtener las denuncias.' });
    }
});

module.exports = router;

