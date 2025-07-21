const swaggerAutogen = require('swagger-autogen')();

const doc = {
    info: {
        title: 'Jayéọba API API',
        description: 'Jayéọba API API'
    },
    host: 'localhost:8080',
    schemes: ['http', 'https']
};

const outputFile = './swagger.json';
const endpointsFiles = ['./routes/index.js'];

swaggerAutogen(outputFile, endpointsFiles, doc);    