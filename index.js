
const express = require('express');
const app = express();
const port = 3000;
const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = "mongodb+srv://raneemn:raneem1234@cluster0.rpwfoxy.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

// Middleware to parse JSON bodies
// مشان يصير يعتمد على body parameters اللي برسلله اياهم 
app.use(express.json());

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

let collection;

async function connectToDatabase() {
  try {
    // Connect the client to the server
    await client.connect();
    // Send a ping to confirm a successful connection
    await client.db("learnEase").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
    const database = client.db('learnEase');
    collection = database.collection('learnEase');
  } catch (error) {
    console.error(error);
  }
}

// Connect to the database when the server starts
connectToDatabase().catch(console.dir);

// GET method for the collection
app.get('/api/learnEase/', async (req, res) => {
  try {
    const result = await collection.find({}).toArray();
    console.log(result);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).send(error.message);
  }
});



// POST method to add an item to the collection

app.post('/api/learnEase/', async (req, res) => {
  try {
    const newItem = req.body;
    if(!newItem.name || !newItem.description){
      return res.status(400).send('name and description are required')
    }
    const result = await collection.insertOne(newItem);
    if(result.acknowledged){
      console.log(`inserted with id: ${result.insertedId}`)
      const insertedItemId = await collection.findOne({ _id: result.insertedId})
      console.log(`inserted Item: ${insertedItemId}`)
      res.status(201).json(insertedItemId)
    }
    else{
      res.status(500).send('Failed to insert')
    }
    
  } catch (error) {
    res.status(500).send(error.message);
  }
});

// Root endpoint
app.get('/', (req, res) => {
  res.send('hello world');
});

// New endpoint
app.get('/new', (req, res) => {
  res.send('hello world in new endpoint');
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});