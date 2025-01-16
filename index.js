const express = require('express');
const connMongo = require('./src/Config/Database/configMongo');
const swaggerUi = require('swagger-ui-express');
const morgan = require('morgan');
const swaggerJsdoc = require('swagger-jsdoc');
require('dotenv').config();
const app = express();
const cors = require('cors');
const helmet = require('helmet'); 

connMongo.mongoose;

const corsOptions = {
    origin: '*',
    allowedHeaders: ['Content-Type', 'Authorization', 'auth-token', 'auth-admin'],
};

// Middleware para agregar encabezados de seguridad
app.use((req, res, next) => {

    res.setHeader('Content-Security-Policy', "default-src 'self';");
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Referrer-Policy', 'no-referrer');
    res.setHeader('Permissions-Policy', 'geolocation=(self), microphone=()');
    next();
});

morgan.token('custom', function (req, res) {
    return `IP: ${req.ip}, Method: ${req.method}, URL: ${req.originalUrl}, Status: ${res.statusCode}`;
});

app.use(morgan(':custom'));

app.use(cors(corsOptions));

// Capturar body
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Importar rutas
const AuthRoutes = require('./src/Routes/authRoutes');
const denunciaRoutes = require('./src/Routes/denunciaRoutes');
const adminRoutes = require('./src/Routes/adminRoutes');
const verifyToken = require('./src/Middleware/validate-token');
const verifyAdminToken = require('./src/Middleware/verifyAdminToken');
const userRoutes = require('./src/Routes/userRoutes');
const dashboardRoutes = require ('./src/Routes/dashboardRoutes');

// Ruta de autenticación
app.use('/auth', AuthRoutes);
app.use('/admin/dashboard', verifyAdminToken);
app.use('/admin', adminRoutes);

// Middleware para verificar el token en las rutas protegidas
app.use('/denuncias', verifyToken);
app.use('/user', verifyToken);

// Ruta por defecto
app.get('/', (req, res) => {
    res.json({
        estado: true,
        mensaje: 'Bienvenid@, inicia sesión o regístrate por favor =)',
    });
});

// Ruta protegida 
app.use('/admin/dashboard', dashboardRoutes);
app.use('/denuncias', denunciaRoutes);
app.use('/user', userRoutes);

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
                url: `http://${process.env.IP_SERVER}:${process.env.PORT}`,
                // url: `https://localhost:${process.env.PORT}`,
            },
        ],
    },
    apis: ['./src/Routes/Authentication/*.js', './src/Routes/denunciaRoutes/*.js', './src/Routes/adminRoutes/*.js', './src/Models/*.js'],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Iniciar servidor
const PORT = process.env.PORT;
app.listen(PORT, () => {
    console.log(`Servidor en ejecución en el puerto: ${PORT}`);
});
