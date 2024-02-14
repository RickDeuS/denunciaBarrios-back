const express = require('express');
const routes = require('express').Router();
const registerRoutes = require('./Authentication/register');
const loginRoutes = require('./Authentication/login');
const verifyUserRoutes = require('./Authentication/verifyUser');
const newPasswordRoutes = require('./Authentication/newPassword');
const passwordRecoveryRoutes = require('./Authentication/passwordRecovery');

routes.use('/register', registerRoutes);
routes.use('/login', loginRoutes);
routes.use('/verifyUser', verifyUserRoutes);
routes.use('/newPassword', newPasswordRoutes);
routes.use('/passwordRecovery', passwordRecoveryRoutes);

module.exports = routes;
 