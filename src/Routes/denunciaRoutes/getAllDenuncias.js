const router = require('express').Router();
const Denuncia = require('../../Models/denuncia');
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
 * path:
 *   denuncia/getAllDenuncias:
 *     get:
 *       summary: Obtiene todas las denuncias almacenadas en la base de datos
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




//Ruta para obtener todas las denuncias almacenadas en la base de datos.
 

router.get('/', async (req, res) => {
    try {
        const denuncias = await Denuncia.find();
        res.json(denuncias);
    } catch (error) {
        res.status(500).json({ error: 'Hubo un error al obtener las denuncias.' });
    }
});

module.exports = router;