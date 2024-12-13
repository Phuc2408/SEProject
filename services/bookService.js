const { MongoClient } = require('mongodb');
const { client } = require('../config/db'); // Import client từ file config/db.js

// Hàm lấy danh sách sách
async function getBooks() {
    try {
        const db = client.db("Library"); // Đảm bảo sử dụng đúng tên database
        const books = await db.collection("books").find().toArray(); // Lấy danh sách sách từ collection "books"
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
        const result = await db.collection("books").deleteOne({ _id: new MongoClient.ObjectId(bookId) });
        return result;
    } catch (error) {
        console.error("Error deleting book:", error);
        throw error;
    }
}

module.exports = { getBooks, addBook, deleteBook };
