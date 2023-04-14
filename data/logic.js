// Store our API endpoint inside queryUrl
let link = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";

// Perform a GET request to the query URL
d3.json(link).then(function(data) {
  console.log(data.features);

  // Send features of data to function CreateFeatures below
  createFeatures(data.features);
});

// Assign sizing for markers
function size(magnitude){
  return magnitude *100000;
}

// Loop through data and create colors based on elif statments for magnitude bins
function color(magnitude){ 
  let color = "";
  if (magnitude<=1){
    return color = "#07D408"
  }
  else if (magnitude<=3){
    return color = "#FFF21F"
  }
  else if (magnitude<=5){
    return color = "#F5710E"
  }
  else {
    return color = "#FF0404"
  }
}
function createFeatures(quake_data) {
  // Log/Check for data for first item in array
  console.log(quake_data[0].geometry.coordinates[1]);
  console.log(quake_data[0].geometry.coordinates[0]);
  console.log(quake_data[0].properties.mag);

  // Function used to create a popup for each marker for location/magnitude
  function onEachFeature(feature, layer) {
    layer.bindPopup("Location: " + feature.properties.place +
   " Magnitude: " + feature.properties.mag)
  }

  let earthquakes = L.geoJSON(quake_data, {
    onEachFeature: onEachFeature,
    // Make layer for GeoJSON which is run through the eachFeature function to get data
    pointToLayer: function (feature, coordinates) {
      // Set size/color of markers based on above functions and return as circles.
      var geoMarkers = {
        radius: size(feature.properties.mag),
        fillColor: color(feature.properties.mag),
        fillOpacity: 0.30,
        stroke: true,
        weight: 1
      }
      return L.circle(coordinates, geoMarkers);
    }
  })

  // Sends earthquake GeoJSON layer to map
  createMap(earthquakes);
}
// Function to create map for earthquake data
function createMap(earthquakes) {

  // Define streetmap and topographic layers
  let streetmap = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
  });

  let basetopo = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
	  attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
});

  //Create baseMaps for our tile layers
  let baseMaps = {
    "Street Map": streetmap,
    "Topographic Map": basetopo
  };

  // Create overlay to hold our JSON data/markers
  let overlays = {
    Earthquakes: earthquakes
  };


  // Create our map, giving it the streetmap and earthquakes layers to display on load
  let myMap = L.map("map", {
    center: [
      40.7, -94.5
    ],
    zoom: 3,
    layers: [streetmap, earthquakes]
  });

  // Create layer control and give it our overlays/base. Then add to map
  L.control.layers(baseMaps, overlays, {
    collapsed: false
  }).addTo(myMap);
}

// Set up the legend in bottom right corner of page
let legend = L.control({ 
  position: 'bottomright' 
});

// WIP legend (code adopted from stack exchange)
legend.onAdd = function(map) {
  let div= L.DomUtil.create('div', 'info legend');
  labels=['<strong> Magnitudes <strong>'],
  categories= [1.0, 3.0, 5.0];

  for (var i=0; i<categories.length; i++){
    div.innerHTML +=
    labels.push(
      '<i style= "background:' + color( categories[i]+1) + '"></i> ' + (categories[i] ? categories[i] : '+')
    );
  }
  div.innterHTML=labels.join('<br>');
return div;
};
legend.addTo(map);