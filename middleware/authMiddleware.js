const jwt = require('jsonwebtoken');
const secretKey = 'your_secret_key';

function verifyToken(req, res, next) {
    const token = req.headers['authorization']?.split(' ')[1];
    if (!token) {
        console.error('Token missing in request headers');
        return res.status(401).json({ message: 'No token provided' });
    }

    jwt.verify(token, secretKey, (err, decoded) => {
        if (err) {
            console.error('Token verification failed:', err.message);
            return res.status(401).json({ message: 'Invalid or expired token' });
        }
        req.user = decoded; // Gắn thông tin user vào req
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
