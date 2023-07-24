const router = require('express').Router();
const getDenunciasUser = require('./denunciaRoutes/getDenunciasUser');
const nuevaDenuncia = require('./denunciaRoutes/nuevaDenuncia');
const eliminarDenuncia = require('./denunciaRoutes/eliminarDenuncia');


router.use('/getDenunciasUser', getDenunciasUser);
router.use('/nuevaDenuncia', nuevaDenuncia);
router.use('/eliminarDenuncia', eliminarDenuncia);

module.exports = router;