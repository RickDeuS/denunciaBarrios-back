const User = require('../Models/user');
const { sendResponse } = require('../utils/responseHandler');
const Denuncia = require('../Models/denuncia');

exports.getUsersCount = async (req, res) => {
    try {
        const count = await User.countDocuments();
        sendResponse(res, 200, { count }, 'Número de usuarios obtenido correctamente.');
    } catch (error) {
        sendResponse(res, 500, {}, 'Error al obtener el número de usuarios.');
    }
};


exports.getNewDenunciasLastMonth = async (req, res) => {
    try {
        const lastMonthDate = moment().subtract(1, 'months').startOf('month');
        
        const newDenuncias = await Denuncia.find({ createdAt: { $gte: lastMonthDate } });
        
        sendResponse(res, 200, { newDenuncias }, 'Nuevas denuncias del último mes obtenidas correctamente.');
    } catch (error) {
        sendResponse(res, 500, {}, 'Error al obtener las nuevas denuncias del último mes.');
    }
};