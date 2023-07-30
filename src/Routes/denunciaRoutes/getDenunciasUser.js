const router = require('express').Router();
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
 * path:
 *   /denuncia/getDenunciasUser:
 *     get:
 *       summary: Obtiene todas las denuncias realizadas por el usuario autenticado
 *       tags: [Denuncias]
 *       security:
 *       - BearerAuth: []
 *       responses:
 *         200:
 *           description: Retorna un arreglo de denuncias
 *           content:
 *             application/json:
 *               schema:
 *                 type: array
 *                 items:
 *                   $ref: '#/components/schemas/Denuncia'
 *         500:
 *           description: Error al obtener las denuncias
 *           content:
 *             application/json:
 *               schema:
 *                 type: object
 *                 properties:
 *                   error:
 *                     type: string
 *                     description: Mensaje de error
 */

router.get('/', async (req, res) => {
    try {
        // Obtener el ID del usuario autenticado desde el token JWT en los headers
        const usuarioId = req.user.id;

        const usuario = await User.findById(usuarioId);
        if (!usuario) {
            return res.status(404).json({ error: 'Usuario no encontrado.' });
        }

        const denuncias = await Denuncia.find({ denunciante: usuario.nombreCompleto });
        res.status(200).json(denuncias);
    } catch (error) {
        console.error('Error al obtener las denuncias:', error);
        res.status(500).json({ error: 'Error del servidor al obtener las denuncias.' });
    }
});

module.exports = router;
