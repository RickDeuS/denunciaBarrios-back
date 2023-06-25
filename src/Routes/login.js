const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Usuario = require('../Models/user');
const crypto = require('crypto');
const app = express();

app.post('/login', async (req, res) => {
    try {
    const { email, password } = req.body;

    // Buscar el usuario por su correo electrónico
    const usuarioDB = await Usuario.findOne({ email });

    // Verificar si el usuario existe
    if (!usuarioDB) {
        return res.status(400).json({
        ok: false,
        err: {
            message: 'El usuario no existe'
        }
        });
    }

    // Verificar la contraseña
    const isPasswordValid = await bcrypt.compare(password, usuarioDB.password);
    if (!isPasswordValid) {
        return res.status(400).json({
        ok: false,
        err: {
            message: 'Contraseña incorrecta'
        }
        });
    }

    // Generar una clave secreta aleatoria
    const secretKey = crypto.randomBytes(32).toString('hex');

    // Generar el token de autenticación
    const token = jwt.sign({ usuario: usuarioDB }, secretKey, { expiresIn: '1h' });

    // Omitir el campo "password" en la respuesta
    const { password: omitPassword, ...usuarioWithoutPassword } = usuarioDB.toObject();

    res.json({
        ok: true,
        usuario: usuarioWithoutPassword
    });
    console.log("Inicio de sesion exitoso");
    } catch (error) {
    console.error('Error en el login:', error);
    res.status(500).json({
        ok: false,
        err: 'Error en el servidor'
    });
    }
});

module.exports = app;
