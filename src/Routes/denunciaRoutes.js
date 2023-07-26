const router = require('express').Router();
const getDenunciasUser = require('./denunciaRoutes/getDenunciasUser');
const nuevaDenuncia = require('./denunciaRoutes/nuevaDenuncia');
const eliminarDenuncia = require('./denunciaRoutes/eliminarDenuncia');
const getAllDenuncias = require('./denunciaRoutes/getAllDenuncias');


router.use('/getDenunciasUser', getDenunciasUser);
router.use('/nuevaDenuncia', nuevaDenuncia);
router.use('/eliminarDenuncia', eliminarDenuncia);
router.use('/getAllDenuncias', getAllDenuncias);

module.exports = router;