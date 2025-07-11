// Form validation for latitude/longitude
document.getElementById("birthChartForm").addEventListener("submit", function(e) {
    let lat = document.getElementById("latitude").value;
    let lng = document.getElementById("longitude").value;
    if (isNaN(lat) || isNaN(lng)) {
        alert("Please enter valid latitude and longitude values.");
        e.preventDefault();
    }
});

// Leaflet Map Picker for Latitude/Longitude
document.addEventListener("DOMContentLoaded", function() {
    var map = L.map('map').setView([20, 78], 5); // Centered on India
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    var marker;

    map.on('click', function(e) {
        var lat = e.latlng.lat.toFixed(4);
        var lng = e.latlng.lng.toFixed(4);

        // Set input fields
        document.getElementById('latitude').value = lat;
        document.getElementById('longitude').value = lng;

        // Add/Move marker
        if (marker) {
            marker.setLatLng(e.latlng);
        } else {
            marker = L.marker(e.latlng).addTo(map);
        }
    });
});
