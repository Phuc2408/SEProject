const jwt = require('jsonwebtoken');
const { getUserCollection } = require('../services/userService');
const { ObjectId } = require('mongodb');
const secretKey = 'your_secret_key';

function verifyToken(req, res, next) {
    const token = req.headers['authorization']?.split(' ')[1];
    if (!token) {
        console.error('Token missing in request headers');
        return res.status(401).json({ message: 'No token provided' });
    }

    jwt.verify(token, secretKey, async (err, decoded) => {
        if (err) {
            console.error('Token verification failed:', err.message);
            return res.status(401).json({ message: 'Invalid or expired token' });
        }
        const usersCollection = await getUserCollection();
        const user = await usersCollection.findOne({ _id: new ObjectId(decoded.userId) });
        if (!user) {
            console.error('User not found in database');
            return res.status(404).json({ message: 'User not found' });
        }
        req.user = user; // Gắn thông tin user vào req
        console.log('Token verified. User:', decoded);
        next();
    });
}

function isAdmin(req, res, next) {
    if (!req.user || req.user.role !== 'admin') {
        console.error(`Access denied. User role: ${req.user?.role}`);
        return res.status(403).json({ message: 'Access denied. Admins only.' });
    }
    console.log('Admin access granted for user:', req.user.username);
    next();
}

module.exports = { verifyToken, isAdmin };
