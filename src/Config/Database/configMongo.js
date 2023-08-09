const mongoose = require('mongoose');
require('dotenv').config();

// Conexión a Base de datos
const uri = `mongodb+srv://${process.env.USER}:${process.env.PASSWORD}@denuncias-back.eugamd3.mongodb.net/barrios`;

mongoose
    .connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('Se estableció conexión con la base de datos'))
    .catch((e) => console.log('Error de conexión a la base de datos:', e));

exports.mongoose = mongoose;    