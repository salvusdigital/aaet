const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');
const asyncHandler = require("express-async-handler");
const constants = require('./constants.json');

module.exports = asyncHandler(async (req, res, next) => {
    // Get token from header (case-insensitive)
    const authHeader = req.headers.authorization || req.headers.Authorization;

    if (!authHeader || !authHeader.startsWith("Bearer")) {
        res.status(constants.UNAUTHORIZED);
        throw new Error('Authentication required. Please provide a Bearer token.');
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
        res.status(constants.UNAUTHORIZED);
        throw new Error('Invalid token format. Bearer token is required.');
    }

    try {
        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Check if admin still exists
        const admin = await Admin.findById(decoded.id);
        if (!admin) {
            res.status(constants.UNAUTHORIZED);
            throw new Error('Token is invalid - Admin no longer exists');
        }

        // Add admin info and token to request
        req.admin = admin;
        req.token = token;

        next();
    } catch (error) {
        // Handle specific JWT errors
        if (error.name === 'JsonWebTokenError') {
            res.status(constants.UNAUTHORIZED);
            throw new Error('Invalid token format or signature');
        }
        if (error.name === 'TokenExpiredError') {
            res.status(constants.UNAUTHORIZED);
            throw new Error('Token has expired');
        }

        // Generic error handler
        res.status(constants.UNAUTHORIZED);
        throw new Error('Authentication failed: ' + error.message);
    }
}); 