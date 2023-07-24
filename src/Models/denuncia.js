const mongoose = require('mongoose');

const denunciaSchema = new mongoose.Schema(
  {
    tituloDenuncia: {
      type: String,
      required: true,
      trim: true
    },
    denunciante: {
      type: String,
      required: false
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
      type: {
        type: String,
        enum: ['Point'], 
        required: true
      },
      coordenadas: {
        type: [Number], 
        required: true
      }
    },
    estado: {
      type: String,
      required: false,
      trim: true
    },
    fechaHora: {
      type: Date,
      default: Date.now 
    },
    categoria: {
      type: String,
      enum: ['Seguridad', 'Infraestructura', 'Contaminacion', 'Ruido', 'Otro'], 
      required: true
    }
  },
  {
    versionKey: false
  }
);

denunciaSchema.index({ ubicacion: '2dsphere' });

denunciaSchema.pre('save', async function (next) {
  if (!this.denunciante) {
    this.denunciante = this._id.nombreCompleto;
  }
  next();
});

const Denuncia = mongoose.model('Denuncia', denunciaSchema);

module.exports = Denuncia;


/**
 * @swagger
 * components:
 *   schemas:
 *     Denuncia:
 *       type: object
 *       required:
 *         - tituloDenuncia
 *         - denunciante
 *         - descripcion
 *         - evidencia
 *         - ubicacion
 *       properties:
 *         tituloDenuncia:
 *           type: string
 *           description: Título de la denuncia
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
