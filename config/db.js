const { MongoClient, ServerApiVersion } = require('mongodb');

const uri = "mongodb+srv://phamphuc240804:123@library.hnekp.mongodb.net/?retryWrites=true&w=majority&appName=Library";

const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function connectDB() {
    try {
        await client.connect();
        console.log("MongoDB connected!");
    } catch (error) {
        console.error("MongoDB connection failed:", error);
        throw error;
    }
}

module.exports = { connectDB, client };
