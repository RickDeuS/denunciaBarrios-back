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
 *         - palabraSecreta
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
 *         palabraSecreta:
 *           type: string
 *           description: Palabra secreta utilizada para agregar un nuevo administrador. Mínimo 6 caracteres.
 *       example:
 *         nombreCompleto: Juan Pérez
 *         email: juan@example.com
 *         password: password123
 *         palabraSecreta: secreto123
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
    palabraSecreta: { 
        type: String, 
        required: true, 
        minlength: 6, 
        maxlength: 255, 
        trim: true,
    },
});

const Admin = mongoose.model('Admin', adminSchema);

module.exports = Admin;