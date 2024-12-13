const bcrypt = require('bcrypt');
const { MongoClient } = require('mongodb');
const client = new MongoClient('mongodb+srv://phamphuc240804:123@library.hnekp.mongodb.net/?retryWrites=true&w=majority&appName=Library');

// Get the user collection
async function getUserCollection() {
    const db = client.db('Library');
    return db.collection('users');
}

// Find user by email or username
async function findUserByEmailOrUsername(email, username) {
    const collection = await getUserCollection();
    return await collection.findOne({ $or: [{ email }, { username }] });
}

// Create a new user
async function createUser(email, username, password, role = 'user') {
    const collection = await getUserCollection();
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = { email, username, password: hashedPassword, role }; // Lưu role vào MongoDB
    return await collection.insertOne(newUser);
}



// Check password validity
async function checkPassword(inputPassword, storedPassword) {
    return await bcrypt.compare(inputPassword, storedPassword);
}

module.exports = { getUserCollection, findUserByEmailOrUsername, createUser, checkPassword };
