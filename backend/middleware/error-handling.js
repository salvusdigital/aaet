// console.log('error-handling');

const constants = require('./constants.json');

const errorHandler = (err, req, res, next) => {
    const statusCode = res.statusCode ? res.statusCode : constants.SERVER_ERROR;

    switch (statusCode) {
        case constants.VALIDATION_ERROR:
            res.status(statusCode).json({
                title: "Validation Error",
                message: err.message,
                stackTrace: process.env.NODE_ENV === 'development' ? err.stack : null
            });
            break;
        case constants.UNAUTHORIZED:
            res.status(statusCode).json({
                title: "Unauthorized",
                message: err.message,
                stackTrace: process.env.NODE_ENV === 'development' ? err.stack : null
            });
            break;
        case constants.FORBIDDEN:
            res.status(statusCode).json({
                title: "Forbidden",
                message: err.message,
                stackTrace: process.env.NODE_ENV === 'development' ? err.stack : null
            });
            break;
        case constants.NOT_FOUND:
            res.status(statusCode).json({
                title: "Not Found",
                message: err.message,
                stackTrace: process.env.NODE_ENV === 'development' ? err.stack : null
            });
            break;
        case constants.SERVER_ERROR:
            res.status(statusCode).json({
                title: "Server Error",
                message: err.message,
                stackTrace: process.env.NODE_ENV === 'development' ? err.stack : null
            });
            break;
        default:
            console.log("No error, all good!");
            break;
    }
};

module.exports = errorHandler;

