const { MongoClient, ObjectId } = require('mongodb'); // Import ObjectId đúng
const { client, getDbConnection } = require('../config/db'); // Import client từ file config/db.js


// Hàm lấy danh sách sách
async function getBooks(param = null) {
    try {
        const db = client.db("Library"); // Đảm bảo sử dụng đúng tên database
        const query = { title: { $regex: param ? `.*${param}.*` : ".*", $options: 'i' } };  // 'i' for case-insensitive search
        console.log(query)
        const books = await db.collection("books").find(query).toArray(); // Lấy danh sách sách từ collection "books"
        return books;
    } catch (error) {
        console.error("Error fetching books:", error);
        throw error;
    }
}

// Hàm thêm sách
async function addBook(book) {
    try {
        const db = client.db("Library"); // Đảm bảo sử dụng đúng tên database
        const result = await db.collection("books").insertOne(book); // Thêm sách vào collection
        return result;
    } catch (error) {
        console.error("Error adding book:", error);
        throw error;
    }
}

// Hàm xóa sách
async function deleteBook(bookId) {
    try {
        const db = client.db("Library"); // Đảm bảo sử dụng đúng tên database
        const result = await db.collection("books").deleteOne({ _id: new ObjectId(bookId) }); // Sử dụng ObjectId chính xác
        return result;
    } catch (error) {
        console.error("Error deleting book:", error);
        throw error;
    }
}

// Hàm mượn sách
async function borrowBook(userId, bookId, returnDate) {
    const db = client.db('Library');

    // Lấy thông tin sách
    const book = await db.collection('books').findOne({ _id: new ObjectId(bookId) });

    // Kiểm tra sách có tồn tại không
    if (!book) {
        throw new Error('Book not found');
    }

    // Tạo giao dịch mượn sách
    const borrowTransaction = {
        userId: new ObjectId(userId),
        bookId: new ObjectId(bookId),
        borrowDate: new Date(),
        returnDate: new Date(returnDate),
        status: 'borrowed',
    };

    // Chèn giao dịch mượn sách vào cơ sở dữ liệu
    const result = await db.collection('borrowedBooks').insertOne(borrowTransaction);

    // Không cập nhật trạng thái sách
    return result;
}

// Hàm lấy danh sách sách đã mượn của user
async function getBorrowedBooks(userId) {
    const db = client.db('Library');
    try {
        const borrowedBooks = await db.collection('borrowedBooks').aggregate([
            { $match: { userId: new ObjectId(userId) } }, // Lọc theo userId
            {
                $lookup: {
                    from: 'books',
                    localField: 'bookId',
                    foreignField: '_id',
                    as: 'bookDetails',
                },
            },
            { $unwind: '$bookDetails' },
            {
                $project: {
                    _id: 1,
                    bookTitle: '$bookDetails.title',
                    borrowDate: 1,
                    returnDate: 1,
                    status: 1,
                },
            },
        ]).toArray();

        return borrowedBooks;
    } catch (error) {
        console.error('Error in getBorrowedBooks:', error);
        throw error;
    }
}

// Hàm gia hạn sách 
async function extendBookReturnDate(userId, borrowedBookId, newReturnDate) {
    const db = client.db('Library'); // Sử dụng client từ db.js để kết nối đúng database

    // Chuyển userId và borrowedBookId thành ObjectId
    const objectUserId = new ObjectId(userId);
    const objectBorrowedBookId = new ObjectId(borrowedBookId);

    console.log("Query Condition:");
    console.log({ _id: objectBorrowedBookId, userId: objectUserId, status: 'borrowed' });

    // Thực hiện truy vấn
    const borrowedBook = await db.collection('borrowedBooks').findOne({
        _id: objectBorrowedBookId,
        userId: objectUserId,
        status: 'borrowed',
    });

    console.log("Borrowed Book Found:", borrowedBook);

    if (!borrowedBook) {
        throw new Error("Failed to extend return date. Book not found or already returned.");
    }

    const result = await db.collection('borrowedBooks').updateOne(
        { _id: objectBorrowedBookId },
        { $set: { returnDate: new Date(newReturnDate) } }
    );

    console.log("Update Result:", result);

    if (result.modifiedCount === 0) {
        throw new Error("Failed to extend return date. Update operation failed.");
    }

    return result;
}

// Hàm đánh dấu mất sách
async function markBookAsLost(userId, borrowedBookId) {
    const db = client.db('Library'); // Kết nối database

    // Chuyển userId và borrowedBookId thành ObjectId
    const objectUserId = new ObjectId(userId);
    const objectBorrowedBookId = new ObjectId(borrowedBookId);

    // Tìm giao dịch mượn sách cần đánh dấu là "lost"
    const borrowedBook = await db.collection('borrowedBooks').findOne({
        _id: objectBorrowedBookId,
        userId: objectUserId,
        status: 'borrowed'
    });

    if (!borrowedBook) {
        throw new Error("Book not found or already returned/lost.");
    }

    // Cập nhật trạng thái giao dịch thành 'lost'
    const result = await db.collection('borrowedBooks').updateOne(
        { _id: objectBorrowedBookId },
        { $set: { status: 'lost' } }
    );

    if (result.modifiedCount === 0) {
        throw new Error("Failed to mark the book as lost.");
    }

    return result;
}


module.exports = { getBooks, addBook, deleteBook, borrowBook, getBorrowedBooks, extendBookReturnDate, markBookAsLost };
