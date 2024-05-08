const fs = require('fs');
const path = require('path');
const { MongoClient } = require('mongodb');

async function fetchSensorData() {
    
    // Update the options passed to MongoClient constructor
    const client = new MongoClient('mongodb://localhost:27017');
    try {
        await client.connect();
        const db = client.db('smartcity');
        const sensorDataCollection = db.collection('TrafficSensors');
        return await sensorDataCollection.find({}).toArray();
    } finally {
        await client.close();
    }
}
fetchSensorData().then((data)=>{
    let outputJson ={}
    data.map((sensor)=>{
        console.log(`processing ${sensor.name}...`)
        let isCongested = isSensorCongested(sensor.sensorData)
        console.log(isCongested)
        outputJson[sensor.name] = {"isCongested":isCongested, "location":sensor.location}
    })
    console.log(outputJson)
    fs.writeFile('CongestionReport.json', JSON.stringify(outputJson), 'utf8', ()=>{})
    }
)

function isSensorCongested(sensorData) {

    const currentDate = new Date();
    const tenDaysAgo = new Date(currentDate);

    // Past days set
    tenDaysAgo.setDate(tenDaysAgo.getDate() - 10);

    let totalSpeed = 0;
    let totalCount = 0;

    for (const dataPoint of sensorData) {
        const timestamp = new Date(dataPoint.timestamp);
        if (timestamp >= tenDaysAgo && timestamp <= currentDate) {
            totalSpeed += dataPoint.speed_kph;
            totalCount++;
        }
    }

    const averageSpeedLast10Days = totalSpeed / totalCount;

    const currentAverageSpeed = sensorData.reduce((sum, dataPoint) => {
        return sum + dataPoint.speed_kph;
    }, 0) / sensorData.length;

    if (currentAverageSpeed < averageSpeedLast10Days) {
        return true;
    } else {
        return false;
    }
}