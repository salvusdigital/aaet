const routes = require('express').Router(),
    swaggerUi = require('swagger-ui-express'),
    swaggerDocument = require('../swagger.json');

routes.use('/api-docs', swaggerUi.serve);
routes.get('/api-docs', swaggerUi.setup(swaggerDocument));

module.exports = routes;
