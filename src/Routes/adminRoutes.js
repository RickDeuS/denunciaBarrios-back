const express = require('express');
const router = express.Router();

const statusUser = require('./adminRoutes/statusUser');
const deleteDenuncia = require('./adminRoutes/deleteDenuncia');
const detallesDenuncia = require('./adminRoutes/detallesDenuncia');
const estadoDenuncia = require('./adminRoutes/estadoDenuncia');
const getAllDenuncias = require('./adminRoutes/getAllDenuncias');
const getAllUsers = require('./adminRoutes/getAllUsers');
const getGeneralView = require('./adminRoutes/getGeneralView');
const getUser = require('./adminRoutes/getUser');
const addAdmin = require('./adminRoutes/addAdmin');
const loginAdmin = require('./adminRoutes/loginAdmin');

router.use('/changeStatusUser', statusUser);
router.use('/deleteDenuncia', deleteDenuncia);
router.use('/detallesDenuncia', detallesDenuncia);
router.use('/estadoDenuncia', estadoDenuncia);
router.use('/getAllDenuncias', getAllDenuncias);
router.use('/getAllUsers', getAllUsers);
router.use('/getGeneralView', getGeneralView);
router.use('/getUser', getUser);
router.use('/addAdmin', addAdmin);
router.use('/loginAdmin', loginAdmin);

module.exports = router;
