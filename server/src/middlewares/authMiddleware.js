import jwt from 'jsonwebtoken';
import ApiError from '../utils/ApiError.js';

const JWT_SECRET = process.env.ACCESS_TOKEN_SECRET;

export const protect = (req, res, next) => {
    const token = req.cookies?.accessToken;

    if (!token) {
        return next(new ApiError(401, 'No token found in cookies'));
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = { id: decoded._id, email: decoded.email };
        next();
    } catch (err) {
        return next(new ApiError(401, 'Invalid or expired token', [err.message], err.stack));
    }
};