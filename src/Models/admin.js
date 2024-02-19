/**
 * @swagger
 * components:
 *   schemas:
 *     Admin:
 *       type: object
 *       required:
 *         - nombreCompleto
 *         - email
 *         - password
 *       properties:
 *         nombreCompleto:
 *           type: string
 *           description: Nombre completo del administrador.
 *         email:
 *           type: string
 *           description: Dirección de correo electrónico del administrador. Debe ser única.
 *         password:
 *           type: string
 *           description: Contraseña del administrador. Mínimo 6 caracteres.
 *         isVerified:
 *           type: boolean
 *           default: false
 *           description: Indica si el administrador ha verificado su cuenta.
 *         isDeleted:
 *           type: boolean
 *           default: false
 *           description: Indica si el administrador ha sido marcado como eliminado.
 *         verificationToken:
 *           type: string
 *           description: Token utilizado para la verificación de la cuenta del administrador.
 *       example:
 *         nombreCompleto: Juan Pérez
 *         email: juan@example.com
 *         password: password123
 *         isVerified: false
 *         isDeleted: false
 *         verificationToken: "123456abcdef"
 */



const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const adminSchema = new Schema({
    nombreCompleto: { 
        type: String, 
        required: true, 
    },
    email: { 
        type: String, 
        required: true, 
        unique: true, 
        trim: true,
    },
    password: { 
        type: String, 
        required: true, 
        minlength: 6, 
        maxlength: 255, 
        trim: true,
    },
    isVerified: { 
        type: Boolean, 
        default: false, 
    },
    isDeleted: { 
        type: Boolean, 
        default: false, 
    },
    verificationToken: {
        type: String,
    },
});

const Admin = mongoose.model('Admin', adminSchema);

module.exports = Admin;
