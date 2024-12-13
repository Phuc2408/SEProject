const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { getUserCollection, findUserByEmailOrUsername, createUser, checkPassword } = require('../services/userService');

const router = express.Router();
const secretKey = 'your_secret_key'; // Secret key for JWT

// Signup
router.post('/signup', async (req, res) => {
    const { email, username, password, role } = req.body; // Nhận thêm role từ body

    if (!email || !username || !password) {
        return res.status(400).json({ message: "All fields (email, username, password) are required" });
    }

    const existingUser = await findUserByEmailOrUsername(email, username);
    if (existingUser) {
        return res.status(400).json({ message: existingUser.email === email ? "Email is already in use" : "Username is already taken" });
    }

    try {
        const newUser = await createUser(email, username, password, role || 'user'); // Role mặc định là 'user'
        res.status(201).json({ message: "Signup successful", userId: newUser.insertedId });
    } catch (error) {
        console.error("Error during signup:", error);
        res.status(500).json({ message: "Signup failed due to a server error" });
    }
});

// Signin
router.post('/signin', async (req, res) => {
    const { username, password } = req.body;

    try {
        const collection = await getUserCollection();
        const user = await collection.findOne({ username });

        if (!user || !(await checkPassword(password, user.password))) {
            return res.status(401).json({ message: 'Invalid username or password' });
        }

        // Log để kiểm tra role
        console.log('User fetched from DB:', user);

        const token = jwt.sign(
            { userId: user._id, username: user.username, role: user.role }, // Thêm role vào payload
            secretKey,
            { expiresIn: '1h' }
        );

        res.status(200).json({
            message: 'Login successful',
            token,
            role: user.role, // Trả về role trong response
        });
    } catch (error) {
        console.error('Error during signin:', error);
        res.status(500).json({ message: 'Server error during signin' });
    }
});


// JWT Verification
router.get('/verify', async (req, res) => {
    const token = req.headers['authorization']?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'No token provided' });

    try {
        const decoded = jwt.verify(token, secretKey);
        res.status(200).json({
            valid: true,
            userId: decoded.userId,
            username: decoded.username,
            role: decoded.role // Trả về role
        });
    } catch (error) {
        console.error('Error during token verification:', error);
        res.status(401).json({ message: 'Invalid or expired token' });
    }
});


module.exports = router;
