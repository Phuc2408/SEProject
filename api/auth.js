const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { getUserCollection, findUserByEmailOrUsername, createUser, checkPassword } = require('../services/userService');
const { verifyToken } = require('../middleware/authMiddleware');

const router = express.Router();
const secretKey = 'your_secret_key'; // Secret key for JWT

// Signup
router.post('/signup', async (req, res) => {
    const { email, username, password, name, id, phone, gender, role, isBanned } = req.body; // Nhận thêm isBanned từ body

    // Kiểm tra các trường bắt buộc
    if (!email || !username || !password || !name || !id || !phone || !gender) {
        return res.status(400).json({ message: "All fields (email, username, password, name, id, phone, gender) are required" });
    }

    // Kiểm tra xem email hoặc username đã tồn tại chưa
    const existingUser = await findUserByEmailOrUsername(email, username);
    if (existingUser) {
        return res.status(400).json({ message: existingUser.email === email ? "Email is already in use" : "Username is already taken" });
    }

    try {
        // Thêm trường `isBanned` vào đối tượng người dùng nếu có
        const newUser = await createUser(email, username, password, name, id, phone, gender, role || 'user', typeof isBanned === 'boolean' ? isBanned : false); // Kiểm tra isBanned trước khi truyền vào
        res.status(201).json({ message: "Signup successful", userId: newUser.insertedId });
    } catch (error) {
        console.error("Error during signup:", error);
        res.status(500).json({ message: "Signup failed due to a server error" });
    }
});
// Change the passsword
router.post('/change-password', verifyToken, async (req, res) => {
    const { password, newPassword } = req.body;
    try {
        const collection = await getUserCollection();
        console.log("req.user:", req.user);
        if (!(await checkPassword(password, req.user.password))) {
            return res.status(401).json({ message: 'Invalid password' });
        }
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await collection.updateOne(
            req.user,
            { $set: { password: hashedPassword } }
        );
        res.status(200).json({ message: 'Password changed successfully' });
    } catch (error) {
        console.error('Error during changing password:', error);
        res.status(500).json({ message: 'Server error during changing password' });
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
        console.log("isBanned:", user.isBanned);
        // Kiểm tra xem người dùng có bị cấm không
        if (user.isBanned === "true") {
            return res.status(403).json({ message: 'Your account is banned. Please contact support.' });
        }

        // Log to check user details
        console.log('User fetched from DB:', user);

        const token = jwt.sign(
            {
                userId: user._id,
                username: user.username,
                role: user.role
            },
            secretKey,
            { expiresIn: '1h' }
        );

        // Prepare the response data
        const responseData = {
            message: 'Login successful',
            token,
            user: {
                username: user.username,
                email: user.email,
                phone: user.phone,
                name: user.name,
                id: user._id.toString(),
                role: user.role, // Return role
                isBanned: user.isBanned // Thêm trường isBanned vào đối tượng người dùng
            }
        };
        console.log('Response data:', responseData);
        res.status(200).json(responseData);
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
