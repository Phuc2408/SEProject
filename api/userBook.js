const express = require('express');
const { getBooks } = require('../services/bookService'); // Import hàm getBooks từ service
const router = express.Router();

// Endpoint lấy danh sách sách
router.get('', async (req, res) => {
    try {
        const books = await getBooks();  // Lấy danh sách sách từ dịch vụ
        res.json(books);  // Trả về danh sách sách dưới dạng JSON
    } catch (error) {
        console.error('Error fetching books:', error);
        res.status(500).json({ message: 'Error fetching books from database' });  // Trả về lỗi nếu có vấn đề
    }
});
module.exports = router;
