const express = require('express');
const connMongo = require('./src/Config/Database/configMongo');
const bodyparser = require('body-parser');
const swaggerUi = require('swagger-ui-express');
const morgan = require('morgan');
const swaggerJsdoc = require('swagger-jsdoc');
require('dotenv').config();
const app = express();
const cors = require('cors');

connMongo.mongoose;

app.use(cors());
app.use(morgan('dev'));


// Capturar body
app.use(bodyparser.urlencoded({ extended: false }));
app.use(bodyparser.json());



// Importar rutas
const authRoutes = require('./src/Routes/ authRoutes');
const homeRoutes = require('./src/Routes/homeRoutes');
const denunciaRoutes = require('./src/Routes/denunciaRoutes');
const verifyToken = require('./src/Middleware/validate-token');

// Ruta de autenticación
app.use('/auth', authRoutes);

// Middleware para verificar el token en las rutas protegidas 
//app.use('/', verifyToken);
app.use('/home', verifyToken);
app.use('/denuncia', verifyToken);

// Ruta por defecto
app.get('/', (req, res) => {
    res.json({
        estado: true,
        mensaje: 'Bienvenid@, inicia sesion o registrate por favor =)',
    });
});

// Ruta protegida /home
app.use('/home', homeRoutes);

// Ruta protegida /denuncia
app.use('/denuncia', denunciaRoutes);

// Configuración de Swagger
const swaggerOptions = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Backend de Denuncias en Barrios',
            version: '1.0.0',
            description: 'Documentación de la API para Denuncias en Barrios de Loja',
        },
        servers: [
            {
                url: `http://localhost:${process.env.PORT}`,
                url: `https://back-barrios-462cb6c76674.herokuapp.com`,
            },
        ],
    },
    apis: ['./src/Routes/authRoutes/*.js','./src/Routes/denunciaRoutes/.*js', './src/Models/*.js'],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Iniciar servidor
const PORT = process.env.PORT;
app.listen(PORT, () => {
    console.log(`Servidor en ejecución en el puerto: ${PORT}`);
});
