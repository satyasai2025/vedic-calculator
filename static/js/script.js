document.getElementById("birthChartForm").addEventListener("submit", function(e) {
    let lat = document.getElementById("latitude").value;
    let lng = document.getElementById("longitude").value;
    if (isNaN(lat) || isNaN(lng)) {
        alert("Please enter valid latitude and longitude values.");
        e.preventDefault();
    }
});
