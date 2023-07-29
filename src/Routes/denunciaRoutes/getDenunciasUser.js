const router = require('express').Router();
const Denuncia = require('../../Models/denuncia');
const User = require('../../Models/user');
const Joi = require('@hapi/joi');
const cloudinary = require('cloudinary').v2;

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
 *       summary: Obtiene todas las denuncias realizadas por un usuario específico
 *       tags: [Denuncias]
 *       security:
 *       - BearerAuth: []
 *       parameters:
 *         - in: query
 *           name: usuarioId
 *           schema:
 *             type: string
 *           required: true
 *           description: ID del usuario para obtener sus denuncias
 *       responses:
 *         200:
 *           description: Retorna un arreglo de denuncias
 *           content:
 *             application/json:
 *               schema:
 *                 type: array
 *                 items:
 *                   $ref: '#/components/schemas/Denuncia'
 *         404:
 *           description: Usuario no encontrado
 *           content:
 *             application/json:
 *               schema:
 *                 type: object
 *                 properties:
 *                   error:
 *                     type: string
 *                     description: Mensaje de error
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


// LISTAR DENUNCIAS DEL USUARIO

const usuarioIdSchema = Joi.string().required();

router.get('/', async (req, res) => {
    try {
        const { error } = usuarioIdSchema.validate(req.query.usuarioId);
        if (error) {
            return res.status(400).json({ error: 'ID de usuario no válido.' });
        }

        const usuarioId = req.query.usuarioId;

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