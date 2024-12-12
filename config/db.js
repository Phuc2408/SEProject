const { MongoClient, ServerApiVersion } = require('mongodb');

// MongoDB URI
const uri = "mongodb+srv://phamphuc240804:123@library.hnekp.mongodb.net/?retryWrites=true&w=majority&appName=Library";
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

// Connect to MongoDB
async function connectDB() {
    try {
        await client.connect();
        await client.db("admin").command({ ping: 1 });
        console.log("MongoDB connected!");
    } catch (error) {
        console.error("MongoDB connection failed:", error);
    }
}

module.exports = { connectDB };
