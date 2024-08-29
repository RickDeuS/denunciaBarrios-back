const router = require('express').Router();
const Denuncia = require('../../Models/denuncia');
const User = require('../../Models/user');
const Joi = require('@hapi/joi');
const cloudinary = require('cloudinary').v2;
const _ = require('lodash');
const verifyToken = require('../../Middleware/validate-token');
const fs = require('fs');
const path = require('path');
const { sendResponse } = require('../../utils/responseHandler');
const streamifier = require('streamifier');

const multer = require('multer');
const upload = multer({
    limits: { fileSize: Infinity },
});

/**
 * @swagger
 * tags:
 *   name: Denuncias
 *   description: Endpoints para denuncias
 */

/**
 * @swagger
 * /denuncias/nuevaDenuncia:
 *   post:
 *     summary: Crea una nueva denuncia.
 *     tags: [Denuncias]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               tituloDenuncia:
 *                 type: string
 *                 description: Título de la denuncia.
 *                 example: Denuncia de contaminación en parque público.
 *               descripcion:
 *                 type: string
 *                 description: Descripción detallada de la denuncia.
 *                 example: Existe contaminación del agua en el parque cercano a mi casa.
 *               evidencia:
 *                 type: string
 *                 format: binary
 *                 description: Imagen de evidencia adjunta.
 *               ubicacion:
 *                 type: object
 *                 properties:
 *                   type:
 *                     type: string
 *                     description: Tipo de ubicación, siempre debe ser "Point".
 *                     example: Point
 *                   coordinates:
 *                     type: array
 *                     description: Coordenadas de la ubicación [longitud, latitud].
 *                     items:
 *                       type: number
 *                     example: [-77.12345, 12.34567]
 *               estado:
 *                 type: string
 *                 description: Estado actual de la denuncia.
 *                 example: Pendiente
 *               categoria:
 *                 type: string
 *                 description: Categoría de la denuncia.
 *                 enum: [
 *                   'Agua Potable, Alcantarillado Sanitario, Alcantarillado Pluvial', 
 *                   'Recolección de Desechos y Saneamiento Ambiental', 
 *                   'Movilidad Urbana: Bacheo de Calles, Frecuencias, Obstrucciones de aceras, etc.', 
 *                   'Obstrucción de vías por construcciones, ornato, permisos de construcción'
 *                 ]
 *                 example: Agua Potable
 *             required:
 *               - tituloDenuncia
 *               - descripcion
 *               - evidencia
 *               - ubicacion
 *               - categoria
 *     responses:
 *       201:
 *         description: Denuncia creada exitosamente.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                 status:
 *                   type: string
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/Denuncia'
 *       400:
 *         description: Error en la solicitud del cliente o ya has presentado una denuncia con el mismo título.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                 status:
 *                   type: string
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *       401:
 *         description: No se proporcionó un token de autenticación válido.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                 status:
 *                   type: string
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *       404:
 *         description: No se encontró el usuario en la base de datos.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                 status:
 *                   type: string
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *       500:
 *         description: Error del servidor al crear la denuncia.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                 status:
 *                   type: string
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 */


cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_APIKEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
});

// NUEVA DENUNCIA    
router.post('/', verifyToken, upload.single('evidencia'), async (req, res) => {
    try {
        const usuarioId = req.user._id;

        const schema = Joi.object({
            tituloDenuncia: Joi.string().required().trim(),
            descripcion: Joi.string().required().trim(),
            categoria: Joi.string().valid(
                'Agua Potable, Alcantarillado Sanitario, Alcantarillado Pluvial',
                'Recolección de Desechos y Saneamiento Ambiental',
                'Movilidad Urbana: Bacheo de Calles, Frecuencias, Obstrucciones de aceras, etc.',
                'Obstrucción de vías por construcciones, ornato, permisos de construcción'
            ).required(),
            ubicacion: Joi.required(),
        });

        const { error, value } = schema.validate(req.body, { stripUnknown: true });
        if (error) {
            return sendResponse(res, 400, {}, error.details[0].message);
        }

        const nombreDenunciante = (await User.findById(usuarioId).select('nombreCompleto')).nombreCompleto;
        const nuevaDenuncia = new Denuncia({
            tituloDenuncia: value.tituloDenuncia,
            idDenunciante: usuarioId,
            nombreDenunciante: nombreDenunciante,
            descripcion: value.descripcion,
            categoria: value.categoria,
            evidencia: '',
            ubicacion: value.ubicacion,
            estado: 'En revisión',
        });

        if (req.file) {
            const publicId = `evidencia_${nuevaDenuncia._id}`;
            // Uso de upload_stream para cargar directamente desde el buffer
            await new Promise((resolve, reject) => {
                const uploadStream = cloudinary.uploader.upload_stream({
                    folder: 'denuncia_photos',
                    public_id: publicId,
                    format: 'png' // o el formato que necesites
                }, (error, result) => {
                    if (error) reject(error);
                    else resolve(result);
                });

                streamifier.createReadStream(req.file.buffer).pipe(uploadStream);
            }).then((result) => {
                nuevaDenuncia.evidencia = result.secure_url;
            }).catch((error) => {
                console.error('Error al cargar la imagen en Cloudinary:', error);
                throw new Error('Error al cargar la imagen');
                sendResponse(res, 500, {}, 'El tamaño de la imagen es muy grande. Intente con una imagen más pequeña.');
            });
        }

        await nuevaDenuncia.save();

        const usuario = await User.findById(usuarioId);
        usuario.Denuncias.push(nuevaDenuncia);
        usuario.numDenunciasRealizadas += 1;
        await usuario.save();

        sendResponse(res, 200, nuevaDenuncia, 'Denuncia creada exitosamente');
    } catch (error) {
        console.error('Error en la ruta /denuncia/nuevaDenuncia:', error);
        sendResponse(res, 500, {}, 'Error en el servidor');
    }
});

module.exports = router;