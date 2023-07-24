const router = require('express').Router();
const Denuncia = require('../../Models/denuncia');
const User = require('../../Models/user');
const Joi = require('@hapi/joi');
const cloudinary = require('cloudinary').v2;

//ELIMINAR DENUNCIA

router.delete('/', async (req, res) => {
    try {
        const { tituloDenuncia } = req.body;

        // Validar los datos de entrada usando Joi (puedes ajustar las reglas de validación según tus necesidades)
        const schema = Joi.object({
            tituloDenuncia: Joi.string().required().trim(),
        });

        const { error } = schema.validate({ tituloDenuncia });

        if (error) {
            return res.status(400).json({ error: error.details[0].message });
        }

        // Buscar y eliminar la denuncia por su título
        const denunciaEliminada = await Denuncia.findOneAndDelete({ tituloDenuncia });

        if (!denunciaEliminada) {
            return res.status(400).json({ error: 'Denuncia no encontrada.' });
        }

        return res.status(200).json({ message: 'Denuncia eliminada exitosamente.' });
    } catch (error) {
        console.error('Error al eliminar la denuncia:', error);
        return res.status(500).json({ error: 'Error del servidor al eliminar la denuncia.' });
    }
});

module.exports = router;