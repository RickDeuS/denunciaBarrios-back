/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       required:
 *        - nombreCompleto
 *        - cedula
 *        - numTelefono
 *        - email
 *        - password
 *       properties:
 *         nombreCompleto:
 *           type: string
 *           minLength: 6
 *           maxLength: 255
 *         cedula:
 *           type: string
 *           minLength: 6
 *           maxLength: 10
 *         numTelefono:
 *           type: string
 *           minLength: 6
 *           maxLength: 10
 *         email:
 *           type: string
 *           minLength: 6
 *           maxLength: 255
 *         password:
 *           type: string
 *           minLength: 6
 *         photo:
 *           type: string
 *         isVerified:
 *           type: boolean
 *           default: false
 *         token:
 *           type: string
 *         verificationToken:
 *           type: string
 *         resetToken:
 *           type: string
 *         numDenunciasRealizadas:
 *           type: number
 *           default: 0
 *       example:
 *         nombreCompleto: Juanito Alimaña
 *         cedula: 12345678
 *         numTelefono: 98765432
 *         email: juanito@example.com
 *         password: password123
 *         photo: https://example.com/profile.jpg
 *         isVerified: true
 *         token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *         verificationToken: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *         resetToken: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *         numDenunciasRealizadas: 3
 */
const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

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
        isVerified: {
            type: Boolean,
            default: false,
        },
        token: { 
            type: String,
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
