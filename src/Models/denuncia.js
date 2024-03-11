const mongoose = require('mongoose');

const denunciaSchema = new mongoose.Schema(
  {
    tituloDenuncia: {
      type: String,
      required: true,
      trim: true
    },
    idDenunciante: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    nombreDenunciante: {
      type: String,
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
      trim: true,
    },
    categoria: {
      type: String,
      enum: [
        'Agua Potable, Alcantarillado Sanitario, Alcantarillado Pluvial', 
        'Recolección de Desechos y Saneamiento Ambiental', 
        'Movilidad Urbana: Bacheo de Calles, Frecuencias, Obstrucciones de aceras, etc.', 
        'Obstrucción de vías por construcciones, ornato, permisos de construcción'
      ],
      required: true
    },
    estado: {
      type: String,
      enum: ['En revisión', 'En proceso', 'Atendida'],
      default: 'En revisión'
    },
    isDeleted: {
      type: Boolean,
      default: false
    },
    fechaHora: {
      type: Date,
      default: Date.now
    }
  },
  {
    versionKey: false,
    timestamps: true
  }
);

denunciaSchema.index({ ubicacion: '2dsphere' });

const Denuncia = mongoose.model('Denuncia', denunciaSchema);

module.exports = Denuncia;


/**
 * @swagger
 * components:
 *   schemas:
 *     Denuncia:
 *       type: object
 *       required:
 *         - tituloDenuncia
 *         - idDenunciante
 *         - nombreDenunciante
 *         - descripcion
 *         - evidencia
 *         - ubicacion
 *         - categoria
 *       properties:
 *         tituloDenuncia:
 *           type: string
 *           description: Título de la denuncia.
 *           example: Denuncia de contaminación en parque público.
 *         idDenunciante:
 *           type: string
 *           description: ID del denunciante.
 *           example: 611d4d25db48de5f8c18e4e1
 *         nombreDenunciante:
 *           type: string
 *           description: Nombre del denunciante.
 *           example: Juanito Pérez
 *         descripcion:
 *           type: string
 *           description: Descripción detallada de la denuncia.
 *           example: Existe contaminación del agua en el parque cercano a mi casa.
 *         evidencia:
 *           type: string
 *           description: URL de la evidencia adjunta (imagen, video, etc.).
 *           example: https://ejemplo.com/evidencia.jpg
 *         ubicacion:
 *           type: object
 *           properties:
 *             type:
 *               type: string
 *               description: Tipo de ubicación, siempre debe ser "Point".
 *               example: Point
 *             coordenadas:
 *               type: array
 *               description: Coordenadas de la ubicación [longitud, latitud].
 *               items:
 *                 type: number
 *               example: [-77.12345, 12.34567]
 *           description: Información de ubicación de la denuncia (GPS).
 *         categoria:
 *           type: string
 *           description: Categoría de la denuncia.
 *           enum: [Seguridad, Infraestructura, Contaminacion, Ruido, Otro]
 *           example: Contaminacion
 *         estado:
 *           type: string
 *           description: Estado actual de la denuncia.
 *           enum: [En revisión, En proceso de solución, Solucionada]
 *           example: En revisión
 *         isDeleted:
 *           type: boolean
 *           description: Indica si la denuncia ha sido eliminada por el usuario.
 *           default: false
 *         fechaHora:
 *           type: string
 *           format: date-time
 *           description: Fecha y hora de creación de la denuncia.
 *           example: '2023-07-29T12:34:56Z'
 *       example:
 *         tituloDenuncia: Denuncia de contaminación en parque público.
 *         idDenunciante: 611d4d25db48de5f8c18e4e1
 *         nombreDenunciante: Juanito Pérez
 *         descripcion: Existe contaminación del agua en el parque cercano a mi casa.
 *         evidencia: https://ejemplo.com/evidencia.jpg
 *         ubicacion:
 *           type: Point
 *           coordenadas: [-77.12345, 12.34567]
 *         categoria: Contaminacion
 *         estado: En revisión
 *         isDeleted: false
 *         fechaHora: '2023-07-29T12:34:56Z'
 */