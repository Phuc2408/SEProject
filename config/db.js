const { MongoClient, ServerApiVersion } = require('mongodb');

const uri = "mongodb+srv://phamphuc240804:123@library.hnekp.mongodb.net/?retryWrites=true&w=majority&appName=Library";

const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

let db; // Biến lưu trữ kết nối database

async function connectDB() {
    try {
        await client.connect();
        db = client.db("library"); // Tên database "library"
        console.log("MongoDB connected!");
    } catch (error) {
        console.error("MongoDB connection failed:", error);
        throw error;
    }
}

// Hàm trả về kết nối đến database
function getDbConnection() {
    if (!db) {
        throw new Error("Database connection is not established! Call connectDB first.");
    }
    return db;
}

module.exports = { connectDB, getDbConnection, client };
