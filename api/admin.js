const express = require('express');
const { verifyToken, isAdmin } = require('../middleware/authMiddleware'); // Chắc chắn import đúng middleware
const { addBook, getBooks, deleteBook } = require('../services/bookService'); // Import các service
const { client, getDbConnection } = require('../config/db'); // Import getDbConnection
const { ObjectId } = require('mongodb');
const { createClient } = require('@supabase/supabase-js');
const multer = require('multer');

const upload = multer();
const router = express.Router();

// Khởi tạo Supabase client
const supabaseUrl = 'https://lpbtludrezmclaggbyel.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxwYnRsdWRyZXptY2xhZ2dieWVsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzY4MzA2NjQsImV4cCI6MjA1MjQwNjY2NH0.1jxaC4GXi2bQTMt5Z45iJ0gO9oUTE6-VJpylj7fslNY';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

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


// Thêm sách (với upload ảnh qua Supabase)
router.post('/books', verifyToken, isAdmin, upload.single('image'), async (req, res) => {
    const { title, author, genre, year } = req.body;
    const file = req.file;

    if (!title || !author || !file) {
        return res.status(400).json({ message: 'Title, author, and image are required.' });
    }

    try {
        // 1. Tải ảnh lên Supabase Storage
        const fileName = `${Date.now()}-${file.originalname}`;
        const { data: storageData, error: storageError } = await supabase
            .storage
            .from('Image')
            .upload(fileName, file.buffer, {
                upsert: true,
            });

        if (storageError) {
            console.error('Error uploading image to Supabase:', storageError);
            return res.status(500).json({ message: 'Failed to upload image', error: storageError });
        }

        // Lấy URL công khai của ảnh
        const coverImageUrl = supabase
            .storage
            .from('Image')
            .getPublicUrl(fileName).data.publicUrl;
        console.log(coverImageUrl);
        // 2. Thêm sách với coverImageUrl vào MongoDB (sử dụng service addBook)
        const newBook = {
            title,
            author,
            genre,
            year,
            coverImageUrl,
            addedAt: new Date()
        };
        const result = await addBook(newBook);

        res.status(201).json({ message: 'Book added successfully.', bookId: result.insertedId });
    } catch (error) {
        console.error('Error adding book:', error);
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


// Endpoint lấy danh sách pickup
router.get('/pickups', verifyToken, isAdmin, async (req, res) => {
    try {
        const db = getDbConnection(); // Kết nối DB

        const pickups = await db.collection('borrowedBooks').aggregate([
            { $match: { status: 'borrowed' } }, // Lọc status 'borrowed'
            {
                $lookup: {
                    from: 'users', // Join với collection users
                    localField: 'userId',
                    foreignField: '_id',
                    as: 'userDetails'
                }
            },
            {
                $lookup: {
                    from: 'books', // Join với collection books
                    localField: 'bookId',
                    foreignField: '_id',
                    as: 'bookDetails'
                }
            },
            { $unwind: '$bookDetails' }, // Giải nén mảng bookDetails
            { $unwind: { path: '$userDetails', preserveNullAndEmptyArrays: true } }, // Giải nén userDetails
            {
                $project: { // Chỉ lấy các trường cần thiết
                    _id: 1,
                    username: '$userDetails.username', // Lấy username từ userDetails
                    bookTitle: '$bookDetails.title',
                    borrowDate: 1,
                    returnDate: 1,
                    status: 1
                }
            }
        ]).toArray();

        console.log('Filtered pickups:', pickups); // Log kết quả
        res.status(200).json(pickups);
    } catch (error) {
        console.error('Error fetching book pickups:', error.message);
        res.status(500).json({ message: 'Failed to fetch book pickups' });
    }
});

// Endpoint xác nhận đã lấy sách
router.put('/confirm-pickup/:id', verifyToken, isAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const db = getDbConnection();

        const result = await db.collection('borrowedBooks').updateOne(
            { _id: new ObjectId(id), status: 'borrowed' },
            { $set: { status: 'picked-up' } }
        );

        if (result.modifiedCount === 0) {
            return res.status(404).json({ message: 'Book not found or already picked up' });
        }

        res.status(200).json({ message: 'Book pickup confirmed successfully' });
    } catch (error) {
        console.error('Error confirming book pickup:', error.message);
        res.status(500).json({ message: 'Failed to confirm book pickup' });
    }
});

// Endpoint lấy danh sách sách trả
router.get('/returns', verifyToken, isAdmin, async (req, res) => {
    try {
        const db = getDbConnection();

        const returns = await db.collection('borrowedBooks').aggregate([
            { $match: { status: 'picked-up' } }, // Lọc trạng thái 'picked-up'
            {
                $lookup: {
                    from: 'users', // Join với collection users
                    localField: 'userId',
                    foreignField: '_id',
                    as: 'userDetails'
                }
            },
            {
                $lookup: {
                    from: 'books', // Join với collection books
                    localField: 'bookId',
                    foreignField: '_id',
                    as: 'bookDetails'
                }
            },
            { $unwind: '$bookDetails' },
            { $unwind: { path: '$userDetails', preserveNullAndEmptyArrays: true } },
            {
                $project: {
                    _id: 1,
                    username: '$userDetails.username',
                    bookTitle: '$bookDetails.title',
                    borrowDate: 1,
                    returnDate: 1,
                    status: 1
                }
            }
        ]).toArray();

        res.status(200).json(returns);
    } catch (error) {
        console.error('Error fetching book returns:', error.message);
        res.status(500).json({ message: 'Failed to fetch book returns' });
    }
});

// Endpoint xác nhận sách đã trả
router.put('/confirm-return/:id', verifyToken, isAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const db = getDbConnection();

        const result = await db.collection('borrowedBooks').updateOne(
            { _id: new ObjectId(id), status: 'picked-up' },
            { $set: { status: 'returned' } }
        );

        if (result.modifiedCount === 0) {
            return res.status(404).json({ message: 'Book not found or already returned' });
        }

        res.status(200).json({ message: 'Book return confirmed successfully' });
    } catch (error) {
        console.error('Error confirming book return:', error.message);
        res.status(500).json({ message: 'Failed to confirm book return' });
    }
});


module.exports = router;
