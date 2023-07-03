const mongoose = require('mongoose');

const denunciaSchema = new mongoose.Schema(
    {
        nombreDenuncia: {
            type: String,
            required: true,
            trim: true
        },
        denunciante: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Usuario',
            required: true
        },
        descripcion: {
            type: String,
            required: true,
            trim: true
        },
        evidencia: {
            type: String,
            required: true,
            trim: true
        },
        ubicacion: {
            type: String,
            required: true,
            trim: true
        },
        estado: {
            type: String,
            required: false,
            trim: true
        }    
    },
    {
        versionKey: false
    }
);

const Denuncia = mongoose.model('Denuncia', denunciaSchema);

module.exports = Denuncia;
