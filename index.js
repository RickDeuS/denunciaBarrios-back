const express = require('express');
const mongoose = require('mongoose');
const bodyparser = require('body-parser');
require('dotenv').config();
const app = express();

// Conexión a Base de datos
const uri = `mongodb+srv://riosr3060:${process.env.PASSWORD}@denuncias-back.eugamd3.mongodb.net/${process.env.DBNAME}`;

mongoose.connect(uri,
    { useNewUrlParser: true, useUnifiedTopology: true }
)
.then(() => console.log('Se estableció conexión con la base de datos'))
.catch(e => console.log('error db:', e))

// capturar body
app.use(bodyparser.urlencoded({ extended: false }));
app.use(bodyparser.json());

// import routes
const authRoutes = require('./src/Routes/auth');
const homeRoutes = require('./src/Routes/home');
const verifyToken = require('./scr/Routes/validate-token');

// route middlewares
app.use("/home", verifyToken, homeRoutes);
app.use('/auth', authRoutes);
app.get('/', (req, res) => {
    res.json({
        estado: true,
        mensaje: 'funciona!'
    })
});

// iniciar server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Levantamos servidor en puerto: ${PORT}`)
})