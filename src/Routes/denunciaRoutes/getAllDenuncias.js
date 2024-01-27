const router = require('express').Router();
const Denuncia = require('../../Models/denuncia');

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
            return res.status(404).json({
                code: 404,
                status: 'error',
                message: 'No hay denuncias que mostrar',
                data: {}
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
            message: 'Hubo un error al obtener las denuncias',
            data: {}
        });
    }
});

module.exports = router;