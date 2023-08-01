/**
 * @swagger
/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       required:
 *         - nombreCompleto
 *         - cedula
 *         - numTelefono
 *         - email
 *         - password
 *       properties:
 *         nombreCompleto:
 *           type: string
 *           minLength: 6
 *           maxLength: 255
 *           description: Nombre completo del usuario.
 *         cedula:
 *           type: string
 *           minLength: 6
 *           maxLength: 10
 *           description: Número de cédula del usuario.
 *         numTelefono:
 *           type: string
 *           minLength: 6
 *           maxLength: 10
 *           description: Número de teléfono del usuario.
 *         email:
 *           type: string
 *           minLength: 6
 *           maxLength: 255
 *           description: Dirección de correo electrónico del usuario.
 *         password:
 *           type: string
 *           minLength: 6
 *           description: Contraseña del usuario.
 *         photo:
 *           type: string
 *           description: URL de la foto de perfil del usuario (opcional).
 *         isVerified:
 *           type: boolean
 *           default: false
 *           description: Estado de verificación del usuario.
 *         verificationToken:
 *           type: string
 *           description: Token de verificación del usuario.
 *         resetToken:
 *           type: string
 *           description: Token de restablecimiento de contraseña del usuario.
 *         numDenunciasRealizadas:
 *           type: number
 *           default: 0
 *           description: Número de denuncias realizadas por el usuario.
 *         isBlocked:
 *           type: boolean
 *           default: false
 *           description: Estado de bloqueo del usuario.
 *       example:
 *         nombreCompleto: Juanito Alimaña
 *         cedula: 12345678
 *         numTelefono: 98765432
 *         email: juanito@example.com
 *         password: password123
 *         photo: https://example.com/profile.jpg
 *         isVerified: true
 *         verificationToken: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *         resetToken: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *         numDenunciasRealizadas: 3
 *         isBlocked: false
 */
const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const userSchema = new Schema(
    {
        nombreCompleto: {
            type: String,
            required: true,
            min: 6,
            max: 255,
            trim: true,
        },
        cedula: {
            type: String,
            unique: true,
            required: true,
            min: 6,
            max: 10,
            trim: true,
        },
        numTelefono: {
            type: String,
            unique: true,
            required: true,
            min: 6,
            max: 10,
            trim: true,
        },
        email: {
            type: String,
            unique: true,
            required: true,
            min: 6,
            max: 255,
            trim: true,
        },
        password: {
            type: String,
            required: true,
            min: 6,
            trim: true,
        },
        photo: {
            type: String,
            required: false,
        },
        role: {
            type: String,
            default: 'user',
        },

        isVerified: {
            type: Boolean,
            default: false,
        },
        verificationToken: {
            type: String,
        },
        resetToken: {
            type: String,
        },
        numDenunciasRealizadas: {
            type: Number,
            default: 0,
            required: false,
        },
        isBlocked: {
            type: Boolean,
            default: false,
        },
        Denuncias: [
            {
                type: Schema.Types.ObjectId,
                ref: 'Denuncia',
            },
        ],
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model('User', userSchema);
