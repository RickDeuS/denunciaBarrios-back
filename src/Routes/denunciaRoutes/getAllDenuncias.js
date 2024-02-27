const router = require('express').Router();
const Denuncia = require('../../Models/denuncia');
const { sendResponse } = require('../../utils/responseHandler');

/**
 * @swagger
 * tags:
 *   name: Denuncias
 *   description: Endpoints para denuncias
 */

/**
 * @swagger
 *   /denuncias/getAllDenuncias:
 *     get:
 *       summary: Obtiene todas las denuncias almacenadas en la base de datos.
 *       tags: [Denuncias]
 *       security:
 *         - BearerAuth: []
 *       responses:
 *         200:
 *           description: Retorna un arreglo de denuncias.
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
 *           description: No se encontraron denuncias.
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
 *           description: Error al obtener las denuncias.
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


// Ruta para obtener todas las denuncias almacenadas en la base de datos.
router.get('/', async (req, res) => {
    try {
        const denuncias = await Denuncia.find({ isDeleted: false });

        if (denuncias.length === 0) {
            return sendResponse(res, 404, {}, 'No hay denuncias que mostrar');
        }

        sendResponse(res, 200, denuncias, 'Denuncias obtenidas correctamente');
    } catch (error) {
        console.error('Error al obtener las denuncias:', error);
        sendResponse(res, 500, {}, 'Hubo un error al obtener las denuncias');
    }
});

module.exports = router;