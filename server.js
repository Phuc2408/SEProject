const express = require('express');
const app = express();
const port = 5000;
const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = "mongodb+srv://phamphuc240804:123@library.hnekp.mongodb.net/?retryWrites=true&w=majority&appName=Library";
const cors = require('cors');
app.use(cors());

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});
async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    await client.close();
  }
}
run().catch(console.dir);
// Middleware để xử lý JSON
app.use(express.json());

// Tạo route API để trả về dữ liệu
app.get('/api/data', (req, res) => {
  res.json({ message: "Hello from the Backend!" });
});

// Lắng nghe ở cổng 5000
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
