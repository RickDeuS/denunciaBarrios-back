const express = require('express');
const mongoose = require('mongoose');
const bodyparser = require('body-parser');
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');
require('dotenv').config();
const app = express();

// Conexión a Base de datos
const uri = `mongodb+srv://riosr3060:${process.env.PASSWORD}@denuncias-back.eugamd3.mongodb.net/${process.env.DBNAME}`;

mongoose
    .connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('Se estableció conexión con la base de datos'))
    .catch((e) => console.log('Error de conexión a la base de datos:', e));

// cors
const cors = require('cors');
const corsOptions = {
    origin: 'https://back-barrios-462cb6c76674.herokuapp.com', 
};
app.use(cors(corsOptions));

// Capturar body
app.use(bodyparser.urlencoded({ extended: false }));
app.use(bodyparser.json());

// Importar rutas
const authRoutes = require('./src/Routes/auth');
const homeRoutes = require('./src/Routes/home');
const verifyToken = require('./src/Routes/validate-token');

// Ruta de autenticación
app.use('/auth', authRoutes);

// Middleware para verificar el token en las rutas / y /home
//app.use('/', verifyToken);
app.use('/home', verifyToken);

// Ruta por defecto
app.get('/', (req, res) => {
    res.json({
        estado: true,
        mensaje: '¡Funciona!',
    });
});

// Ruta protegida /home
app.use('/home', homeRoutes);

// Configuración de Swagger
const swaggerOptions = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Backend de Denuncias en Barrios',
            version: '1.0.0',
            description: 'Documentación de la API para Denuncias en Barrios',
        },
        servers: [
            {
                url: 'http://localhost:3000', // Reemplaza con la URL de tu servidor
            },
        ],
    },
    apis: ['./src/Routes/auth.js', './src/Models/user.js'], // Reemplaza con la ruta a tus archivos de rutas
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Iniciar servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor en ejecución en el puerto: ${PORT}`);
});
