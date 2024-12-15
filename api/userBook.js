const express = require('express');
const { getBooks, borrowBook, getBorrowedBooks, extendBookReturnDate, markBookAsLost } = require('../services/bookService'); // Import thêm getBorrowedBooks
const { verifyToken } = require('../middleware/authMiddleware');

const router = express.Router();

// Endpoint lấy danh sách sách
router.get('', async (req, res) => {
    const { param } = req.query;
    try {
        const books = await getBooks(param); // Lấy danh sách sách từ dịch vụ
        res.json(books); // Trả về danh sách sách dưới dạng JSON
    } catch (error) {
        console.error('Error fetching books:', error);
        res.status(500).json({ message: 'Error fetching books from database' }); // Trả về lỗi nếu có vấn đề
    }
});

// Endpoint mượn sách
router.post('/borrow', verifyToken, async (req, res) => {
    try {
        const { bookId, pickupDate, returnDate } = req.body; // Thêm pickupDate
        const userId = req.user._id;

        const result = await borrowBook(userId, bookId, pickupDate, returnDate);
        res.status(201).json({
            message: 'Book borrowed successfully',
            transactionId: result.insertedId,
        });
    } catch (error) {
        console.error('Error borrowing book:', error);
        res.status(500).json({ message: 'Failed to borrow book', error: error.message });
    }
});



// Endpoint xem danh sách sách đã mượn
router.get('/borrowed', verifyToken, async (req, res) => {
    try {
        const userId = req.user._id; // Middleware verifyToken phải thêm userId vào req.user
        const books = await getBorrowedBooks(userId);
        res.json(books); // Trả về danh sách sách đã mượn
    } catch (error) {
        console.error('Error fetching borrowed books:', error.message);
        res.status(500).json({ message: 'Failed to fetch borrowed books', error: error.message });
    }
});

//Endpoint gia hạn sách
router.put('/extend/:borrowedBookId', verifyToken, async (req, res) => {
    try {
        const { borrowedBookId } = req.params;
        const { newReturnDate } = req.body;
        const userId = req.user._id;

        console.log('UserId:', userId);
        console.log('BorrowedBookId:', borrowedBookId);
        console.log('NewReturnDate:', newReturnDate);

        const result = await extendBookReturnDate(userId, borrowedBookId, newReturnDate);
        res.status(200).json({ message: 'Return date extended successfully.' });
    } catch (error) {
        console.error('Error extending book return date:', error.message);
        res.status(500).json({ message: 'Failed to extend return date', error: error.message });
    }
});

//Endpoint mất sách 
router.put('/lost/:borrowedBookId', verifyToken, async (req, res) => {
    try {
        const { borrowedBookId } = req.params; // ID của giao dịch mượn
        const userId = req.user._id; // Lấy userId từ token

        console.log('UserId:', userId);
        console.log('BorrowedBookId:', borrowedBookId);

        const result = await markBookAsLost(userId, borrowedBookId);
        res.status(200).json({ message: 'Book marked as lost successfully.' });
    } catch (error) {
        console.error('Error marking book as lost:', error.message);
        res.status(500).json({ message: 'Failed to mark book as lost', error: error.message });
    }
});


module.exports = router;
