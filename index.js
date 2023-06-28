const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

// Importar rutas
const loginRoutes = require('../denunciaBarrios-back/src/Routes/login');
const registerRoutes = require('../denunciaBarrios-back/src/Routes/register');


// Configurar la conexión a MongoDB
mongoose.connect('mongodb+srv://riosr3060:Rsrr_060714@denuncias-back.eugamd3.mongodb.net/', {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log('Conexión exitosa a MongoDB');
}).catch((error) => {
    console.error('Error al conectar a MongoDB:', error);
});

const app = express();

// Configurar middlewares
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

// Configurar las rutas
app.use('/auth', loginRoutes);
app.use('/auth', registerRoutes);

// Configurar el puerto
const port = 3000;

// Iniciar el servidor
app.listen(port, () => {
    console.log(`Servidor escuchando en el puerto ${port}`);
});
