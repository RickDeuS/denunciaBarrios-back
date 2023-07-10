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

denunciaSchema.pre('save', async function (next) {
  if (!this.denunciante) {
    // Asignar el nombre completo del usuario autenticado como denunciante si no se ha establecido previamente
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
