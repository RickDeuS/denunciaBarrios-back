const express = require('express');
const bcrypt = require('bcrypt');
const Usuario = require('../Models/user');
const app = express();

app.post('/register', async (req, res) => {
    try {
    const { nombreCompleto, cedula,numTelefono, email, password, role } = req.body;

    // Verificar si todos los campos requeridos están presentes
    if (!nombreCompleto || !cedula || !numTelefono || !email || !password) {
        return res.status(400).json({
            ok: false,
            err: {
                message: 'Todos los campos requeridos deben estar presentes'
            }
        });
    }

    // Verificar si ya existe un usuario con el mismo correo electrónico
    const usuarioExistente = await Usuario.findOne({ email });
    if (usuarioExistente) {
        return res.status(400).json({
            ok: false,
            err: {
                message: 'El correo electrónico ya está en uso'
            }
        });
    }

    const usuarioExistenteDNI = await Usuario.findOne({ cedula });
    if (usuarioExistenteDNI) {
        return res.status(400).json({
            ok: false,
            err: {
                message: 'Esta cédula pertenece a otro usuario'
            }
        });
    }

    // Crear el nuevo usuario
    const usuario = new Usuario({
        nombreCompleto,
        cedula,
        numTelefono,
        email,
        password: bcrypt.hashSync(password, 10),
        role
    });

    // Guardar el usuario en la base de datos
    const usuarioDB = await usuario.save();

    res.json({
        ok: true,
        usuario: usuarioDB
    });
    } catch (error) {
        console.error('Error en el registro:', error);
        res.status(500).json({
        ok: false,
        err: 'Error en el servidor'
        });
    }
});

module.exports = app;
