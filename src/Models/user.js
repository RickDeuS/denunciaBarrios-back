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
 *         photoUrl:
 *           type: string
 *         role:
 *           type: string
 *           default: 'USER'
 *           enum:
 *             - USER
 *         numDenunciasRealizadas:
 *           type: number
 *           default: 0
 */
const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

const rolesValidos = {
    values: ['USER'],
    message: '{VALUE} no es un rol válido',
};

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
            default: 'USER',
            enum: rolesValidos,
            trim: true,
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

userSchema.plugin(uniqueValidator, {
    message: '{PATH} debe ser único',
});

module.exports = mongoose.model('User', userSchema);
