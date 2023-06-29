const express = require('express');
const mongoose = require('mongoose');
const bodyparser = require('body-parser');
require('dotenv').config();
const app = express();

// Conexión a Base de datos
const uri = `mongodb+srv://${process.env.USER}:${process.env.PASSWORD}@denuncias-back.eugamd3.mongodb.net/${process.env.DBNAME}`;

mongoose
  .connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Se estableció conexión con la base de datos'))
  .catch((e) => console.log('Error de conexión a la base de datos:', e));

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
app.use('/', verifyToken);
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

// Iniciar servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor en ejecución en el puerto: ${PORT}`);
});
