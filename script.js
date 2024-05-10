const { MongoClient } = require('mongodb');

async function fetchSensorData() {
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

async function saveCongestionReport() {
    const sensorData = await fetchSensorData();

    let outputJson = {};
    sensorData.forEach((sensor) => {
        console.log(`processing ${sensor.name}...`);
        let isCongested = isSensorCongested(sensor.sensorData);
        outputJson[sensor.name] = { "isCongested": isCongested, "location": sensor.location };
    });

    const client = new MongoClient('mongodb://localhost:27017');
    try {
        await client.connect();
        const db = client.db('smartcity');
        const congestionReportCollection = db.collection('CongestionReports');

        // Drop existing collection to rewrite data every time code is run
        await congestionReportCollection.drop();

        // Insert new congestion report
        await congestionReportCollection.insertOne(outputJson);
    } finally {
        await client.close();
    }
}

function isSensorCongested(sensorData) {
    const currentDate = new Date();
    const tenDaysAgo = new Date(currentDate);
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

    return currentAverageSpeed < averageSpeedLast10Days;
}

saveCongestionReport()
    .then(() => {
        console.log("Congestion report saved successfully.");
    })
    .catch((error) => {
        console.error("Error saving congestion report:", error);
    });
