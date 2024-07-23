
const express = require('express')
const app = express()
const port = 3000
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb')
const uri = "mongodb+srv://raneemn:raneem1234@cluster0.rpwfoxy.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"
let collection
let InterestCollection
let userInfoCollection
// Middleware to parse JSON bodies
// مشان يصير يعتمد على body parameters اللي برسلله اياهم 
app.use(express.json());

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});


async function connectToDatabase() {
  try {
    // Connect the client to the server
    await client.connect();
    // Send a ping to confirm a successful connection
    await client.db("learnEase").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
    const database = client.db('learnEase');
    collection = database.collection('learnEase');
    InterestCollection = database.collection('userInterest')
    userInfoCollection = database.collection('userInfo')
  } catch (error) {
    console.error(error);
  }
}

// Connect to the database when the server starts
connectToDatabase().catch(console.dir);



// GET method for the collection1
app.get('/api/learnEase/', async (req, res) => {
  try {
    const result = await collection.find({}).toArray();
    console.log(result);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).send(error.message);
  }
});


// POST method to add an item to the collection1
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

// GET method for the interset collection
app.get('/api/userInterest/', async (req, res) => {
  try {
    const result = await InterestCollection.find({}).toArray();
    console.log(result);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).send(error.message);
  }
});


// POST method to add an item to the interset collection
app.post('/api/userInterest/', async (req, res) => {
  try {
    const newItem = req.body;
    if(!newItem.userName || !newItem.interest){
      return res.status(400).send('username and interest are required')
    }
    const result = await InterestCollection.insertOne(newItem);
    if(result.acknowledged){
      console.log(`inserted with id: ${result.insertedId}`)
      const insertedItemId = await InterestCollection.findOne({ _id: result.insertedId})
      console.log(`inserted Item: ${insertedItemId}`)
      res.status(201).json(insertedItemId)
    }
    else{
      res.status(500).send('Failed to insert')
    }
    
  } catch (error) {
    res.status(500).send(error.message);
  }
})

//update method to update an item in the interset collection
app.put('/api/userInterest/:id', async (req,res)=>{
  const id = req.params.id
  const body = req.body
  console.log(`Id is ${id}`)
  console.log(`updating ${body.interest}`)
  var result = await InterestCollection.updateOne({_id: new ObjectId(id),},
    {$set:{userName : body.userName,
      description : body.description,
      interest: body.interest
    }}
  )
  console.log(result)
  res.status(200).json(result)
  //res.send(`updating with id ${id}`)
})

// GET method for the user info collection
app.get('/api/userInfo/', async (req, res) => {
  try {
    const result = await userInfoCollection.find({}).toArray();
    console.log(result);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).send(error.message);
  }
});


// POST method to add an item to the user info collection
app.post('/api/userInfo/', async (req, res) => {
  try {
    const newItem = req.body;
    if(!newItem.firstName || !newItem.lastName || !newItem.email || !newItem.password){
      return res.status(400).send('all fields are required')
    }
    const result = await userInfoCollection.insertOne(newItem);
    if(result.acknowledged){
      console.log(`inserted with id: ${result.insertedId}`)
      const insertedItemId = await userInfoCollection.findOne({ _id: result.insertedId})
      console.log(`inserted Item: ${insertedItemId}`)
      res.status(201).json(insertedItemId)
    }
    else{
      res.status(500).send('Failed to insert')
    }
    
  } catch (error) {
    res.status(500).send(error.message);
  }
})



// Root endpoint
app.get('/', (req, res) => {
  res.send('hello world');
});


