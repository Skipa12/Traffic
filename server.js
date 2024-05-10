const express = require('express');
const app = express();
const path = require('path');
const { MongoClient } = require('mongodb');

app.use(express.static(path.join(__dirname)));

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'sensors.html'));
});


app.get('/cr', (req, res) => {
    const client = new MongoClient('mongodb://localhost:27017');
    try {
        client.connect().then(() => {  
            const db = client.db('smartcity');
            const crCollection = db.collection('CongestionReports');
            crCollection.find({}).toArray()
                .then((data)=>{ 
                    delete data[0]._id
                    res.send(data[0])})
        }
        ) 
    }
    catch(err){
        console.err(err);
    }
    
});
