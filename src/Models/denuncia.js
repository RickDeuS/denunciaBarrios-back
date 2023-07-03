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

/**
 * @swagger
 * components:
 *   schemas:
 *     Denuncia:
 *       type: object
 *       required:
 *         - nombreDenuncia
 *         - denunciante
 *         - descripcion
 *         - evidencia
 *         - ubicacion
 *       properties:
 *         nombreDenuncia:
 *           type: string
 *           description: Nombre de la denuncia
 *         denunciante:
 *           type: string
 *           description: ID del denunciante
 *         descripcion:
 *           type: string
 *           description: Descripción de la denuncia
 *         evidencia:
 *           type: string
 *           description: Evidencia de la denuncia
 *         ubicacion:
 *           type: string
 *           description: Ubicación de la denuncia
 *         estado:
 *           type: string
 *           description: Estado de la denuncia
 */
