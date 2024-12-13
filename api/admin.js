const express = require('express');
const { verifyToken, isAdmin } = require('../middleware/authMiddleware'); // Chắc chắn import đúng middleware
const { addBook, getBooks, deleteBook } = require('../services/bookService'); // Import các service

const router = express.Router();

// Lấy danh sách sách
router.get('/books', verifyToken, isAdmin, async (req, res) => {
    try {
        const books = await getBooks();
        res.status(200).json(books);
    } catch (error) {
        console.error('Error fetching books:', error); // Log lỗi
        res.status(500).json({ message: 'Failed to fetch books', error });
    }
});

// Thêm sách
router.post('/books', verifyToken, isAdmin, async (req, res) => {
    const { title, author, genre, year } = req.body;

    if (!title || !author) {
        return res.status(400).json({ message: 'Title and author are required.' });
    }

    try {
        const newBook = { title, author, genre, year, addedAt: new Date() };
        const result = await addBook(newBook); // Gọi service addBook
        res.status(201).json({ message: 'Book added successfully.', bookId: result.insertedId });
    } catch (error) {
        console.error('Error adding book:', error); // Thêm log chi tiết lỗi
        res.status(500).json({ message: 'Failed to add book', error });
    }
});

// Xóa sách
router.delete('/books/:id', verifyToken, isAdmin, async (req, res) => { // Thêm verifyToken trước isAdmin
    const bookId = req.params.id;

    try {
        const result = await deleteBook(bookId); // Xóa sách theo ID
        if (result.deletedCount === 0) {
            return res.status(404).json({ message: 'Book not found' });
        }
        res.status(200).json({ message: 'Book deleted successfully.' });
    } catch (error) {
        console.error('Error deleting book:', error); // Log lỗi cho server
        res.status(500).json({ message: 'Failed to delete book', error });
    }
});

module.exports = router;
