// Initialize the map

var map = L.map('map').setView([49.4, 8.7], 13);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

// Object to keep track of marker click state
var markerClickState = {};

// Function to reverse geocode coordinates
function reverseGeocode(lat, lon) {
    const apiKey = '6c007673173c497c88eecc1ac1fa0596';
    return fetch(`https://api.opencagedata.com/geocode/v1/json?q=${lat}+${lon}&key=${apiKey}&language=en&pretty=1`)
        .then(response => response.json())
        .then(data => {
            if (data.results && data.results.length > 0) {
                const addressComponents = data.results[0].components;
                return addressComponents.road || addressComponents.street || "Street";
            } else {
                return "Street";
            }
        })
        .catch(error => {
            console.error('Error geocoding coordinates:', error);
            return "Street";
        });
}
function plotMarkersTest() {
    fetch('CongestionReport.json')
        .then(response => response.json())
        .then(data => console.log(data))
}
function plotMarkersTest2() {
    fetch('/cr')
        .then(response => response.json())
        .then(data => console.log(data))
}

// Function to plot markers on the map
function plotMarkers() {
    fetch('/cr')
        .then(response => response.json())
        .then(data => {
            map.eachLayer(layer => {
                if (layer instanceof L.Marker) {
                    map.removeLayer(layer);
                }
            });

            Object.keys(data).forEach(async sensor => {
                var sensorData = data[sensor];
                var location = sensorData.location;

                var marker = L.marker([location[0], location[1]]).addTo(map);
                var firstStreetName = await reverseGeocode(location[0], location[1]);
                marker.bindPopup(sensor + " on " + firstStreetName);

                markerClickState[sensor] = false;

                marker.on('click', function() {
                    if (!markerClickState[sensor]) {
                        // If circle is not displayed, plot circles for this sensor
                        plotCirclesForSensor(sensorData);
                        markerClickState[sensor] = true; // Update state to true
                    } else {
                        // If circle is displayed, remove it from the map
                        map.eachLayer(layer => {
                            if (layer instanceof L.Circle) {
                                map.removeLayer(layer);
                            }
                        });
                        markerClickState[sensor] = false; // Update state to false
                    }
                });
            });
        })
        .catch(error => {
            console.error('Error reading JSON data:', error);
        });
}

// Function to plot circles on the map
function plotCircles() {
    fetch('/cr')
        .then(response => response.json())
        .then(data => {
            map.eachLayer(layer => {
                if (layer instanceof L.Circle) {
                    map.removeLayer(layer);
                }
            });

            Object.keys(data).forEach(async sensor => {
                var sensorData = data[sensor];
                var location = sensorData.location;

                var circleColor = sensorData.isCongested ? 'red' : 'green';
                var circle = L.circle([location[0], location[1]], {
                    color: 'transparent',
                    fillColor: circleColor,
                    fillOpacity: 0.5,
                    radius: 125
                }).addTo(map);
                circle.bindPopup(sensorData.isCongested ? "Congested" : "Not Congested");

                map.on('zoomend', () => {
                    const zoom = map.getZoom();
                    const maxRadius = 5000;
                    const minRadius = 125;
                    const minZoom = 15;
                    const maxZoom = 20;

                    const adjustedRadius = circle.options.radius * Math.pow(2, minZoom - zoom);

                    circle.setRadius(Math.max(minRadius, Math.min(maxRadius, adjustedRadius)));
                });
            });
        })
        .catch(error => {
            console.error('Error reading JSON data:', error);
        });
}

// Function to plot circles on the map for sensor data
function plotCirclesForSensor(sensorData) {
    map.eachLayer(layer => {
        if (layer instanceof L.Circle) {
            map.removeLayer(layer);
        }
    });

    var location = sensorData.location;
    var circleColor = sensorData.isCongested ? 'red' : 'green';
    var circle = L.circle([location[0], location[1]], {
        color: 'transparent',
        fillColor: circleColor,
        fillOpacity: 0.5,
        radius: 125
    }).addTo(map);
    circle.bindPopup(sensorData.isCongested ? "Congested" : "Not Congested");

    map.on('zoomend', () => {
        const zoom = map.getZoom();
        const maxRadius = 5000;
        const minRadius = 125;
        const minZoom = 15;
        const maxZoom = 20;

        const adjustedRadius = circle.options.radius * Math.pow(2, minZoom - zoom);

        circle.setRadius(Math.max(minRadius, Math.min(maxRadius, adjustedRadius)));
    });
}


// Function to reset the map
function resetMap() {
    map.eachLayer(layer => {
        if (layer instanceof L.Circle) {
            map.removeLayer(layer);
        }
    });
    map.setView([49.4, 8.7], 13);
}


