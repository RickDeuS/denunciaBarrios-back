/**
 * @param {Object} res - Objeto de respuesta de Express.
 * @param {number} code - Código de estado HTTP.
 * @param {Object} data - Datos a enviar en la respuesta.
 * @param {string} [message=''] - Mensaje opcional.
 */
const sendResponse = (res, code, data = {}, message = '') => {
    const response = {
        code,
        status: code >= 200 && code < 300 ? 'success' : 'error',
        data,
        message,
    };

    res.status(code).json(response);
};

module.exports = { sendResponse };
