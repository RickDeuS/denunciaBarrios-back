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
 *                 type: object
 *                 properties:
 *                   code:
 *                     type: integer
 *                   status:
 *                     type: string
 *                   message:
 *                     type: string
 *                   data:
 *                     type: array
 *                     items:
 *                       $ref: '#/components/schemas/Denuncia'
 *         404:
 *           description: Usuario no encontrado o el usuario no ha presentado denuncias.
 *           content:
 *             application/json:
 *               schema:
 *                 type: object
 *                 properties:
 *                   code:
 *                     type: integer
 *                   status:
 *                     type: string
 *                   message:
 *                     type: string
 *                   data:
 *                     type: object
 *         500:
 *           description: Error del servidor al obtener las denuncias.
 *           content:
 *             application/json:
 *               schema:
 *                 type: object
 *                 properties:
 *                   code:
 *                     type: integer
 *                   status:
 *                     type: string
 *                   message:
 *                     type: string
 *                   data:
 *                     type: object
 */


// Ruta para obtener todas las denuncias realizadas por el usuario autenticado.
router.get('/', verifyToken, async (req, res) => {
    try {
        const usuarioId = req.user._id; // Asegurando que esto coincide con la propiedad usada en el token

        const usuario = await User.findById(usuarioId);
        if (!usuario) {
            return res.status(404).json({
                code: 404,
                status: 'error',
                message: 'Usuario no encontrado',
                data: {}
            });
        }

        const denuncias = await Denuncia.find({ idDenunciante: usuarioId, isDeleted: false });
        if (denuncias.length === 0) {
            return res.json({
                code: 200,
                status: 'success',
                message: 'El usuario no ha presentado denuncias',
                data: denuncias
            });
        }

        res.json({
            code: 200,
            status: 'success',
            message: 'Denuncias obtenidas correctamente',
            data: denuncias
        });
    } catch (error) {
        console.error('Error al obtener las denuncias:', error);
        res.status(500).json({
            code: 500,
            status: 'error',
            message: 'Error del servidor al obtener las denuncias',
            data: {}
        });
    }
});

module.exports = router;