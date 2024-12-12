const jwt = require('jsonwebtoken');
const secretKey = 'your_secret_key';

function verifyToken(req, res, next) {
    const token = req.headers['authorization']?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'No token provided' });

    jwt.verify(token, secretKey, (err, decoded) => {
        if (err) return res.status(401).json({ message: 'Invalid or expired token' });
        req.user = decoded; // Attach user info to request
        next();
    });
}

module.exports = verifyToken;
