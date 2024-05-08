// Initialize Leaflet map
var map = L.map('map').setView([49.4, 8.7], 13);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

// Reverse geocode coordinates to get street names
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

// Initialize an object to store marker click state
var markerClickState = {};

// Plot markers on the map based on data from CongestionReport.json
function plotMarkers() {
    fetch('CongestionReport.json')
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

                // Initialize flag for each marker
                markerClickState[sensor] = false;

                // Add click event listener to the marker
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


// Plot circles on the map to represent congestion status for a specific sensor
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

// Plot circles on the map to represent congestion status for all sensors
function plotCircles() {
    fetch('CongestionReport.json')
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

// Reset the map to its initial state
function resetMap() {
    map.eachLayer(layer => {
        if (layer instanceof L.Circle) {
            map.removeLayer(layer);
        }
    });
    map.setView([49.4, 8.7], 13);
}
