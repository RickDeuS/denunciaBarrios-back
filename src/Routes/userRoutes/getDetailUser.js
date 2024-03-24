const router = require('express').Router();
const verifyToken = require('../../Middleware/validate-token');
const Denuncia = require('../../Models/denuncia');
const User = require('../../Models/user');
const { sendResponse } = require('../../utils/responseHandler');

router.get('/', verifyToken, async (req, res) => {
    try {
        const usuarioId = req.user._id; 

        const usuario = await User.findById(usuarioId).select('-password'); 
        if (!usuario) {
            return sendResponse(res, 404, {}, 'User not found');
        }

        return sendResponse(res, 200, usuario, 'User retrieved successfully.');

    } catch (error) {
        console.error('Error retrieving user:', error);
        return sendResponse(res, 500, {}, 'Server error while retrieving user.');
    }
});

module.exports = router;
