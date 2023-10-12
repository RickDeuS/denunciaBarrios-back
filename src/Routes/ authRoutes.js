const express = require('express');
const routes = require('express').Router();
const registerRoutes = require('./AuthRoutes/register');
const loginRoutes = require('./AuthRoutes/login');
const verifyUserRoutes = require('./AuthRoutes/verifyUser');
const newPasswordRoutes = require('./AuthRoutes/newPassword');
const passwordRecoveryRoutes = require('./AuthRoutes/passwordRecovery');

routes.use('/register', registerRoutes);
routes.use('/login', loginRoutes);
routes.use('/verifyUser', verifyUserRoutes);
routes.use('/newPassword', newPasswordRoutes);
routes.use('/passwordRecovery', passwordRecoveryRoutes);

module.exports = routes;
