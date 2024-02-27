const router = require('express').Router();
const verifyToken = require('../../Middleware/validate-token');
const Denuncia = require('../../Models/denuncia');
const User = require('../../Models/user');
const Joi = require('@hapi/joi');
const { sendResponse } = require('../../utils/responseHandler');

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
        const usuarioId = req.user._id; 

        const usuario = await User.findById(usuarioId);
        if (!usuario) {
            return sendResponse(res, 404, {}, 'Usuario no encontrado');
        }

        const denuncias = await Denuncia.find({ idDenunciante: usuarioId, isDeleted: false });
        if (denuncias.length === 0) {
            return sendResponse(res, 200, denuncias, 'El usuario no ha presentado denuncias');
        }

        sendResponse(res, 200, denuncias, 'Denuncias obtenidas correctamente');
    } catch (error) {
        console.error('Error al obtener las denuncias:', error);
        sendResponse(res, 500, {}, 'Error del servidor al obtener las denuncias');
    }
});

module.exports = router;