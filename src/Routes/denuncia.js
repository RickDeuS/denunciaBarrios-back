const router = require('express').Router();
const Denuncia = require('../Models/denuncia');
const Joi = require('@hapi/joi');

const crearDenuncia = async (req, res) => {
    try {
        const nuevaDenuncia = new Denuncia(req.body);
        const denunciaGuardada = await nuevaDenuncia.save();
        res.status(201).json(denunciaGuardada);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Controlador para obtener todas las denuncias
const obtenerDenuncias = async (req, res) => {
    try {
        const denuncias = await Denuncia.find();
        res.json(denuncias);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Controlador para obtener una denuncia por su ID
const obtenerDenunciaPorId = async (req, res) => {
    try {
        const denuncia = await Denuncia.findById(req.body.id);
        if (!denuncia) {
            return res.status(404).json({ mensaje: 'Denuncia no encontrada' });
        }
        res.json(denuncia);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Controlador para actualizar una denuncia por su ID
const actualizarDenuncia = async (req, res) => {
    try {
        const denuncia = await Denuncia.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
        });
        if (!denuncia) {
            return res.status(404).json({ mensaje: 'Denuncia no encontrada' });
        }
        res.json(denuncia);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Controlador para eliminar una denuncia por su ID
const eliminarDenuncia = async (req, res) => {
    try {
        const denuncia = await Denuncia.findByIdAndDelete(req.params.id);
        if (!denuncia) {
            return res.status(404).json({ mensaje: 'Denuncia no encontrada' });
        }
        res.json({ mensaje: 'Denuncia eliminada correctamente' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    crearDenuncia,
    obtenerDenuncias,
    obtenerDenunciaPorId,
    actualizarDenuncia,
    eliminarDenuncia,
};