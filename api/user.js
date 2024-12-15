const express = require('express');
const { getUserCollection } = require('../services/userService');

const router = express.Router();

// Example: Get user profile by user ID
router.get('/:id', async (req, res) => {
    const userId = req.params.id;
    const user = await getUserCollection().findOne({ _id: userId });

    if (!user) {
        return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(user);
});

// Cập nhật giá trị isBanned thành true của người dùng
router.patch("/:id", async (req, res) => {
    const { id } = req.params; // Lấy ID từ tham số URL
    const value = req.query.value;
    try {
        const usersCollection = await getUserCollection()// Specify the collection name
        // Cập nhật giá trị isBanned thành true của người dùng
        const result = await usersCollection.updateOne(
            { id }, // Tìm người dùng theo ID
            {
                $set: {
                    isBanned: value
                }
            }
        );

        // Kiểm tra nếu không có người dùng nào bị cập nhật
        if (result.matchedCount === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json({ message: 'User isBanned status set to true successfully' });
    } catch (err) {
        console.error('Error updating isBanned:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

router.delete("/:id", async (req, res) => {
    const { id } = req.params;
    try {
        const usersCollection = await getUserCollection()// Specify the collection name
        console.log(id)
        const result = await usersCollection.deleteOne({ id });
        if (result.deletedCount === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json({ message: 'User deleted successfully' });
    } catch (err) {
        console.error('Error deleting user:', err);
        res.status(500).json({ message: 'Server error' });
    }
})
router.get('/', async (req, res) => {
    collection = await getUserCollection();
    const users = await collection.find({ role: "user" }).toArray();
    res.status(200).json(users);
})

module.exports = router;