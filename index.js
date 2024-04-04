const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

const app = express();

// midewaare
const corsOptions = {
  origin: "*",
  credentials: true,
  optionSuccessStatus: 200,
};
app.use(cors(corsOptions));
app.use(express.json());

const port = process.env.PORT || 5000;

const uri = `mongodb+srv://amirhossainbc75:15qInqH23QpvkVtV@cluster0.spkoynb.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;
// console.log(uri)
// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();



    // user collection
    const usercollection = client.db("Heliverse").collection("user");
    const teamCollection = client.db("Heliverse").collection("team");

    //user related api post
    app.post("/user", async (req, res) => {
      const user = req.body;
      const result = await usercollection.insertOne(user);
      res.send(result);
    });
// add to team api
app.post('/team',async(req,res)=>{
  const team =req.body;
  const result=await teamCollection.insertOne(team);
  res.send(result)
})

// get added team data
app.get('/team',async(req,res)=>{
  const cursor = teamCollection.find();
  const result = await cursor.toArray();
  res.send(result);
})
    
    app.get("/user", async (req, res) => {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 20;
      const skip = (page - 1) * limit;
    
      // Construct filter based on query parameters
      const filter = {};
      if (req.query.name) {
        filter.$or = [
          { first_name: { $regex: req.query.name, $options: "i" } },
          { last_name: { $regex: req.query.name, $options: "i" } }
        ];
      }
    
      try {
        const cursor = usercollection.find(filter).skip(skip).limit(limit);
        const result = await cursor.toArray();
        res.send(result);
      } catch (error) {
        console.error("Error fetching users:", error);
        res.status(500).send("Internal Server Error");
      }
    });


    // get user by id
    app.get("/user/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await usercollection.findOne(query);
      res.send(result);
    });
    
      // updated a User
      app.put("/user/:id", async (req, res) => {
        const id = req.params.id;
        const filter = { _id: new ObjectId(id) };
        const options = { upsert: true };
        const updateUser = req.body;
        const user = {
          $set: {
            first_name: updateUser.first_name,
            last_name: updateUser.last_name,
            email: updateUser.email,
            gender: updateUser.gender,
            domain: updateUser.domain,
            available: updateUser.available,
          },
        };
        const result = await usercollection.updateOne(
          filter,
          user,
          options
        );
        res.send(result);
      });
  
    //  user delete
    app.delete("/user/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await usercollection.deleteOne(query);
      res.send(result);
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Crud is running...");
});

app.listen(port, () => {
  console.log(`Simple Crud is Running on port ${port}`);
});
