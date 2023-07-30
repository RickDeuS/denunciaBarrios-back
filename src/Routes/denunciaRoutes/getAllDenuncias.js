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
 *                 type: array
 *                 items:
 *                   $ref: '#/components/schemas/Denuncia'
 *         404:
 *           description: No se encontraron denuncias.
 *           content:
 *             application/json:
 *               schema:
 *                 type: object
 *                 properties:
 *                   error:
 *                     type: string
 *                     example: No hay denuncias que mostrar.
 *         500:
 *           description: Error al obtener las denuncias.
 *           content:
 *             application/json:
 *               schema:
 *                 type: object
 *                 properties:
 *                   error:
 *                     type: string
 *                     example: Hubo un error al obtener las denuncias.
 */

// Ruta para obtener todas las denuncias almacenadas en la base de datos.
router.get('/', async (req, res) => {
    try {
        const denuncias = await Denuncia.find({
            isDeleted: false,
        });
        
        if (denuncias.length === 0) {
            return res.status(404).json({ error: 'No hay denuncias que mostrar.' });
        }

        res.json(denuncias);
    } catch (error) {
        res.status(500).json({ error: 'Hubo un error al obtener las denuncias.' });
    }
});

module.exports = router;