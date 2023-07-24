const router = require('express').Router();
const Denuncia = require('../../Models/denuncia');
const User = require('../../Models/user');
const Joi = require('@hapi/joi');

// NUEVA DENUNCIA    
router.post('/', async (req, res) => {
    try {
        const usuarioId = req.user.id;

        const usuario = await User.findById(usuarioId);

        if (!usuario) {
            return res.status(404).json({ error: 'Usuario no encontrado.' });
        }

        const schema = Joi.object({
            tituloDenuncia: Joi.string().required().trim(),
            descripcion: Joi.string().required().trim(),
            evidencia: Joi.string().required().trim(),
            ubicacion: Joi.object({
                type: Joi.string().valid('Point').required(),
                coordinates: Joi.array().items(Joi.number()).length(2).required(),
            }).required(),
            estado: Joi.string().trim(),
            categoria: Joi.string().valid('Seguridad', 'Infraestructura', 'Contaminacion', 'Ruido', 'Otro').required(),
        });

        const { error } = schema.validate(req.body);

        if (error) {
            return res.status(400).json({ error: error.details[0].message });
        }

        const denunciaExistente = await Denuncia.findOne({
            tituloDenuncia: req.body.tituloDenuncia,
            denunciante: usuario.nombreCompleto,
        });

        if (denunciaExistente) {
            return res.status(400).json({ error: 'Ya has presentado una denuncia con el mismo título.' });
        }

        const nuevaDenuncia = new Denuncia({
            tituloDenuncia: req.body.tituloDenuncia,
            denunciante: usuario.nombreCompleto,
            descripcion: req.body.descripcion,
            evidencia: req.body.evidencia,
            ubicacion: req.body.ubicacion,
            estado: req.body.estado,
            categoria: req.body.categoria,
        });
        
        await nuevaDenuncia.save();
        
        usuario.Denuncias.push(nuevaDenuncia);
        usuario.numDenunciasRealizadas += 1;
        await usuario.save();
        
        return res.status(201).json({ message: 'Denuncia creada exitosamente.' });
    } catch (error) {
        console.error('Error al crear la denuncia:', error);
        return res.status(500).json({ error: 'Error del servidor al crear la denuncia.' });
    }
});

module.exports = router;