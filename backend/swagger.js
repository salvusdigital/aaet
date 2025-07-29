const swaggerAutogen = require('swagger-autogen')();

const doc = {
    info: {
        title: 'Jayéọba API',
        description: 'Jayéọba API'
    },
    host: ['localhost:8000'],
    // host: ['aaet.onrender.com'],
    schemes: ['http', 'https']
};

const outputFile = './swagger.json';
const endpointsFiles = ['./routes/index.js'];

swaggerAutogen(outputFile, endpointsFiles, doc);    