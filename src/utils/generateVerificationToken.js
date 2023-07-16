const uuid = require('uuid');

function generateVerificationToken() {
    const { v4: uuidv4 } = require('uuid');
    return uuidv4();
}

module.exports = generateVerificationToken;