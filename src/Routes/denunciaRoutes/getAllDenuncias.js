/**
 * @swagger
 * path:
 *   denuncia/getAllDenuncias:
 *     get:
 *       summary: Obtiene todas las denuncias almacenadas en la base de datos
 *       tags: [Denuncias]
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

const router = require('express').Router();
const Denuncia = require('../../Models/denuncia');
const Joi = require('@hapi/joi');
const cloudinary = require('cloudinary').v2;

/**
 * Ruta para obtener todas las denuncias almacenadas en la base de datos.
 *
 * @name GET /denuncias
 * @function
 * @async
 * @memberof module:Rutas/Denuncias
 *
 * @returns {JSON} - Un objeto JSON que contiene todas las denuncias.
 * @throws {JSON} - Un objeto JSON que indica un error si ocurre algún problema al obtener las denuncias.
 */
router.get('/', async (req, res) => {
    try {
        const denuncias = await Denuncia.find();
        res.json(denuncias);
    } catch (error) {
        res.status(500).json({ error: 'Hubo un error al obtener las denuncias.' });
    }
});

module.exports = router;