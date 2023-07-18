const express = require('express');
const routes = require('express').Router();
const registerRoutes = require('./registerRoutes');
const loginRoutes = require('./loginRoutes');
const verifyUserRoutes = require('./verifyUserRoutes');
const newPasswordRoutes = require('./newPasswordRoutes');
const passwordRecoveryRoutes = require('./passwordRecoveryRoutes');

routes.use('/register', registerRoutes);
routes.use('/login', loginRoutes);
routes.use('/verifyUser', verifyUserRoutes);
routes.use('/newPassword', newPasswordRoutes);
routes.use('/passwordRecovery', passwordRecoveryRoutes);

module.exports = routes;
