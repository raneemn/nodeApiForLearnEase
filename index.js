
const express = require('express')
const app = express()
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

const port = 3000
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb')
const uri = "mongodb+srv://raneemn:raneem1234@cluster0.rpwfoxy.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"
let collection
let InterestCollection
let userInfoCollection
let courseInfoCollection
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
    courseInfoCollection = database.collection('courses')
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

// delete one interest by id
app.delete('/api/userInterest/:id', async (req,res)=>{
  var result
  try {
    const id = req.params.id
    result = await InterestCollection.deleteOne({_id: new ObjectId(id)})
    if (result.deletedCount === 1) {
      console.log("Successfully deleted one interest.");
      res.status(200).json(`${id} deleted successfully from database`)
    } else {
      console.log("No interest matched the query. Deleted 0 documents.");
      res.status(400).json({message: 'failed deleted one interest'})
    }
  } catch (error) {
    res.status(500).json({message: error.message})
  }
})
//###################### USER INFO ############################
// GET method for the user info collection
app.get('/api/userInfo/', async (req, res) => {
  try {
    const result = await userInfoCollection.find({}).toArray();
    
    res.status(200).json(result);
  } catch (error) {
    res.status(500).send(error.message);
  }
});


// POST method to REGISTER user info collection
app.post('/api/userInfo/register/', async (req, res) => {
  var newItem
  var userData
  var isEmailExist
  try {    
    newItem = req.body;
    if(!newItem.firstName || !newItem.lastName || !newItem.email || !newItem.password){
      return res.status(400).send('all fields are required')
    }
    isEmailExist = await userInfoCollection.findOne({email:newItem.email}) 
    console.log(`is email exist? ${isEmailExist}`) 
    if(isEmailExist){
      return res.status(400).send('This Email is already registered')
    }
    else{
      const hashedPass = await bcrypt.hash(newItem.password,10)
      console.log(`hashed password : ${hashedPass}`)
      userData = {
        firstName:newItem.firstName,
        lastName:newItem.lastName,
        email:newItem.email,
        password:hashedPass
      }
      const result = await userInfoCollection.insertOne(userData);
      console.log(`result is: ${result.text}`)
      res.status(200).json({message: 'user registered succesffully',userId:result.insertedId})
    }
  } catch (error) {
    res.status(500).send(error.message);
  }
})

// POST method to LOGIN user collection
app.post('/api/userInfo/login/', async (req, res) => {
  const email = req.body.email
  const pass = req.body.password
  if(!email || !pass){
    return res.status(400).send('email and password are required')
  }
  var user = await userInfoCollection.findOne({email:email})  
  if(!user){
    return res.status(400).send('Invalid email or password.');
  }
  console.log(user)
  const isPassValid = await bcrypt.compare(pass,user.password)
  if(!isPassValid){
    return res.status(400).send('Invalid email or password.');
  }
  const token = jwt.sign({id: user._id},'your_secret_key',{expiresIn:'1h'})
   res.status(200).json({message: 'logged is successfully', userId:user._id, token:token})
})

// middleware to validate JWT token
function authJWT (req,res,next){
  const token = req.header('authentication').replace('Bearer ','')
  if(!token){
    return res.status(401).send('Token is required')
  }
  try {
    const decode = jwt.verify(token,'your_secret_key')
    req.user = decode
    next()
    
  } catch (error) {
    return res.status(401).send('Invalid Token')
  }
}

// protect endpoint with JWT
app.get('/api/auth/', authJWT, (req,res) => {
  res.send('Access granted')
})

//update password
app.put('/api/userInfo/:id', async (req,res)=>{
  const id = req.params.id
  const body = req.body
  console.log(`Id is ${id}`)
  console.log(`updating ${body.email}`)
  const hashedPass = await bcrypt.hash(body.password,10)
  var result = await userInfoCollection.updateOne({_id: new ObjectId(id),},
    {$set:{password : hashedPass,      
    }}
  )
  console.log(result)
  res.status(200).json(result)
  //res.send(`updating with id ${id}`)
})

//######################  COURSE INFO  ###############################

app.get('/api/courseInfo',async (req,res)=>{
try {
  const result = await courseInfoCollection.find({}).toArray()
  res.status(200).json(result)
} catch (error) {
  res.status(500).send(error.message)
}
})

// Root endpoint
app.get('/', (req, res) => {
  res.send('hello world');
});


