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

module.exports = router;