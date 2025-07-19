const routes = require('express').Router();

routes.use('/api/menu', require('./menu'));

routes.use('/api/admin', require('./admin'));

// routes.use('/user', require('./user'));

module.exports = routes;
