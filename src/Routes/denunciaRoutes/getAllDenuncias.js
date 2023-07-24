const router = require('express').Router();
const Denuncia = require('../Models/denuncia');
const User = require('../Models/user');
const Joi = require('@hapi/joi');
const cloudinary = require('cloudinary').v2;

router.get('/', async (req, res) => {
});


module.exports = router;