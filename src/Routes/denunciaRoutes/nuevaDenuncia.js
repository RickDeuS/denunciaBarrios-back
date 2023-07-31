const router = require('express').Router();
const Denuncia = require('../../Models/denuncia');
const User = require('../../Models/user');
const Joi = require('@hapi/joi');
const cloudinary = require('cloudinary').v2;
const _ = require('lodash');
const verifyToken = require('../../Middleware/validate-token');
const fs = require('fs');

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
 *                 example: Contaminacion
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
 *                 message:
 *                   type: string
 *                   example: Denuncia creada exitosamente.
 *       400:
 *         description: Error en la solicitud del cliente o ya has presentado una denuncia con el mismo título.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Ya has presentado una denuncia con el mismo título.
 *       401:
 *         description: No se proporcionó un token de autenticación válido.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Acceso no autorizado.
 *       404:
 *         description: No se encontró el usuario en la base de datos.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Usuario no encontrado.
 *       500:
 *         description: Error del servidor al crear la denuncia.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Error del servidor al crear la denuncia.
 */


cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_APIKEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
});

const lastDenunciaTimes = {};
const multer = require('multer');
const upload = multer();

// NUEVA DENUNCIA    
router.post('/', verifyToken, upload.single('evidencia'), async (req, res) => {
    try {
        console.log("Entrando a la ruta '/denuncia/nuevaDenuncia'");
        const usuarioId = req.user.id;

        const schema = Joi.object({
            tituloDenuncia: Joi.string().required().trim(),
            descripcion: Joi.string().required().trim(),
            categoria: Joi.string().valid('Seguridad', 'Infraestructura', 'Contaminacion', 'Ruido', 'Otro').required(),
            evidencia: Joi.string(),
            ubicacion: Joi.object({
                type: Joi.string().valid('Point').required(),
                coordenadas: Joi.array().items(Joi.number()).length(2).required(),
            }).required(),
        });

        const { error, value } = schema.validate(req.body, {
            stripUnknown: true,
        });

        if (error) {
            console.log("Error en la validación del cuerpo de la solicitud:", error.details[0].message);
            return res.status(400).json({ error: error.details[0].message });
        }

        // Verificar si el usuario ha presentado una denuncia en los últimos 15 minutos
        const now = Date.now();
        const lastDenunciaTime = lastDenunciaTimes[usuarioId];
        if (lastDenunciaTime && now - lastDenunciaTime < 15 * 60 * 1000) {
            console.log("El usuario intentó presentar otra denuncia en menos de 15 minutos.");
            return res.status(400).json({ error: 'Debes esperar al menos 15 minutos antes de presentar otra denuncia.' });
        }

        const nombreDenunciante = await User.findById(usuarioId).select('nombreCompleto');
        

        const { ubicacion } = value;

        const nuevaDenuncia = new Denuncia({
            tituloDenuncia: value.tituloDenuncia,
            idDenunciante: usuarioId,
            nombreDenunciante: nombreDenunciante.nombreCompleto,
            descripcion: value.descripcion,
            categoria: value.categoria,
            prueba: '',
            ubicacion,
            estado: 'En revisión',
        });

        if (req.file) {
            // Escribir el archivo temporal
            const tempFilePath = `/tmp/${req.file.originalname}`; 
            fs.writeFileSync(tempFilePath, req.file.buffer);

            // Subir el archivo temporal a Cloudinary
            const publicId = `evidencia_${nuevaDenuncia._id}`;
            const result = await cloudinary.uploader.upload(tempFilePath, {
                folder: 'denuncia_photos',
                public_id: publicId,
            });
            nuevaDenuncia.evidencia = result.secure_url;
            console.log("Imagen subida a Cloudinary");

            // Eliminar el archivo temporal después de subirlo a Cloudinary
            fs.unlinkSync(tempFilePath);
        }
        console.log("Creando denuncia...", nuevaDenuncia);
        await nuevaDenuncia.save();

        const usuario = await User.findById(usuarioId);
        usuario.Denuncias.push(nuevaDenuncia);
        usuario.numDenunciasRealizadas += 1;
        await usuario.save();

        // Actualizar el último tiempo de denuncia para el usuario actual
        lastDenunciaTimes[usuarioId] = now;

        console.log("Denuncia creada exitosamente.");
        return res.status(201).json({ message: 'Denuncia creada exitosamente.' });
    } catch (error) {
        console.error('Error al crear la denuncia:', error);
        return res.status(500).json({ error: 'Error del servidor al crear la denuncia.' });
    }
});

module.exports = router;