const express = require('express');
const app = express();
const cors = require('cors');
require('dotenv').config();
const { MongoClient, ServerApiVersion } = require('mongodb');
const ObjectId = require('mongodb').ObjectId;


const port = process.env.post || 5000;




// middleware
app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.g7iiy.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
console.log(uri);


async function run() {
    try {
        await client.connect();
        console.log('database connected successfully')
        const database = client.db("niche_watch");
        const watchCollection = database.collection("watches");
        const userCollection = database.collection("users");
        const orderCollection = database.collection("orders");
        const reviewCollection = database.collection('reviews');


        // get all watches
        app.get('/watches', async (req, res) => {
            const cursor = watchCollection.find({});
            const watch = await cursor.toArray();
            res.send(watch);
        });
        // get single watches
        app.get('/watches/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) }
            const watch = await watchCollection.findOne(query);
            res.send(watch);

        })

        // post watches data
        app.post('/watches', async (req, res) => {
            const watch = req.body;
            const result = await watchCollection.insertOne(watch);
            res.json(result)

        });
        // get user to see it is admin or not 
        app.get('/users/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email: email };
            const user = await userCollection.findOne(query);
            let isAdmin = false;
            if (user?.role === 'admin') {
                isAdmin = true
            };
            res.json({ admin: isAdmin });
        })

        // posting user data to server
        app.post('/users', async (req, res) => {
            const user = req.body;
            const result = await userCollection.insertOne(user);

            res.json(result);
        })
        // update user or put user through google sign in
        app.put('/users', async (req, res) => {
            const user = req.body;

            const filter = { email: user.email };
            const options = { upsert: true };
            const updateDoc = { $set: user };

            const result = await userCollection.updateOne(filter, updateDoc, options);
            res.json(result);
        })
        // make admin
        app.put('/users/admin', async (req, res) => {
            const user = req.body;
            const filter = { email: user.email };
            const updateDoc = { $set: { role: 'admin' } };
            const result = await userCollection.updateOne(filter, updateDoc);
            res.json(result);
        })

        // post order
        app.post('/orders', async (req, res) => {
            const order = req.body;
            const result = await orderCollection.insertOne(order);
            res.json(result);


        })
        // get specific order filter by email
        app.get('/orders/:email', async (req, res) => {
            const email = req.params.email;

            const query = { email: email };
            const result = await orderCollection.find(query).toArray();


            res.json(result);


        })
        // delete product
        app.delete('/orders/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await orderCollection.deleteOne(query);
            res.json(result);
        })
        // post review
        app.post('/reviews', async (req, res) => {
            const review = req.body;
            const result = await reviewCollection.insertOne(review);
            res.json(result);
            console.log("review result is", result)
        })
        // get review
        app.get('/reviews', async (req, res) => {
            const cursor = reviewCollection.find({});
            const review = await cursor.toArray();
            res.send(review);

        })



    }
    finally {
        // await client.close();
    }
}
run().catch(console.dir);


app.get('/', (req, res) => {
    res.send('Hello niche watch client')
});
app.listen(port, () => {
    console.log(`hello i am from niche watch portal ${port}`)
})