const router = require('express').Router();
const getDetailUser = require('./userRoutes/getDetailUser');

router.use('/getDetailUser', getDetailUser);




module.exports = router;