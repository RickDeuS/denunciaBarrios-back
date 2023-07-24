const express = require('express');
const routes = require('express').Router();
const registerRoutes = require('./authRoutes/register');
const loginRoutes = require('./authRoutes/login');
const verifyUserRoutes = require('./authRoutes/verifyUser');
const newPasswordRoutes = require('./authRoutes/newPassword');
const passwordRecoveryRoutes = require('./authRoutes/passwordRecovery');

routes.use('/register', registerRoutes);
routes.use('/login', loginRoutes);
routes.use('/verifyUser', verifyUserRoutes);
routes.use('/newPassword', newPasswordRoutes);
routes.use('/passwordRecovery', passwordRecoveryRoutes);

module.exports = routes;
