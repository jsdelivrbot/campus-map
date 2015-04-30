// The first line here loads the data in the building-centroids GeoJSON file
$.getJSON("https://rawgit.com/pennstategeog467/campus-map/gh-pages/data/building-centroids.json", function(centroids) {
  
  $.getJSON("https://rawgit.com/wdc5041/campus-map/gh-pages/data/searchbarv3.json", function (data) {
    
    console.log("centroids:");
    console.log(centroids);
    console.log("data:");
    console.log(data);
  
  // Because everything we do after this depends on the JSON file being loaded, the above line waits for the JSON file to be loaded,
  // then the browser will proceed with the below code. The data from the JSON file is the variable `centroids`.

  
  // Adding all the building centroids as a points layer
  var markers = L.mapbox.featureLayer(centroids) // Creates a new feature layer from the GeoJSON data `centroids`
    .setFilter(function() { return false; }) // Filters out all of the data so no points actually appear on the map. We'll add them when we search for specific points later on.
  .bindPopup(
      '<h1>Penn State Building</h1>' +
      '<ul>' +
      '<li>Department of This</li>' +
      '<li>Department of That</li>' +
      '</ul>' +
      '<div><img style="margin:2px;width:100%;" src="images/old_main.jpg" /></div>' +
      '<button class="btn btn-info" onClick="getDirections()">Directions to here</button>'
    ) // This "bindPopUp" method adds the above HTML content to the pop-up window. We need to make that content specific to the feature's data.
    .addTo(map); // Add the new feature layer to the map.
    
  $.widget( "custom.catcomplete", $.ui.autocomplete, {
    _create: function() {
      this._super();
      this.widget().menu( "option", "items", "> :not(.ui-autocomplete-category)" );
    },
    _renderMenu: function( ul, items ) {
      var that = this,
        currentCategory = "";
      $.each( items, function( index, item ) {
        var li;
        if ( item.category != currentCategory ) {
          ul.append( "<li class='ui-autocomplete-category'>" + item.category + "</li>" );
          currentCategory = item.category;
        }
        li = that._renderItemData( ul, item );
        if ( item.category ) {
          li.attr( "aria-label", item.category + " : " + item.label );
        }
      });
    }
  }); 
  
  // Setting up the search bar behavior with jQuery UI Autocomplete
  $(function() {
    
    $("#search").catcomplete({
        source: data, //!!Change availableTags to Database Json file!!! The list of tags for the autocomplete is availableTags.
        minLength: 2, // Give autocomplete suggestions after two letters are typed
        autoFocus: true,
        select: function (event, ui) { // An event listener that does the following code once an option from the autocomplete menu is selected
            setTimeout(focusMap, 50); // When an option is selected, zoom to that point. The focusMap function is definded below.
        }
    });
  });
  
  // Defining a function that automatically zooms the map to the feature with the same title as whatever's in the search field.
  function focusMap() {
    
    var targetName = document.getElementById('search').value; // Gets whatever text the user has entered into the search field.
    
    
    // For each of the centroids points, check if the title matches our target, and if it does,
    // break out of the loop and set the map view to that point,
    // then filter our markers feature layer so that only the target point is showing.
    
    for (var i = 0; i < data.length; i++) { // Initialize the for loop
      if (data[i].label === targetName) { // For each point, check if the title of the point matches the target
        var targetID = data[i]["PICTURE ID"]; // Remembers whichever building id it was that matches for use later.
        break; // Skip the rest of the loop, we already found what we wanted.
      } else {
        console.log('not found'); // If we don't find it, and this should never happen, write in the console that we didn't find it.
      }
    }
    
    for (var i = 0; i < centroids.features.length; i++) { // Initialize the for loop
      if (centroids.features[i].properties.building_id == targetID) { // For each point, check if the title of the point matches the target
        var targetPointIndex = i; // Remembers whichever building id it was that matches for use later.
        break; // Skip the rest of the loop, we already found what we wanted.
      } else {
        console.log('not found'); // If we don't find it, and this should never happen, write in the console that we didn't find it.
      }
    }
    
    targetLat = centroids.features[targetPointIndex].geometry.coordinates[1];
    targetLon = centroids.features[targetPointIndex].geometry.coordinates[0];
    
    // Change the map view to the coordinates of the target point.
    map.setView(
      [centroids.features[targetPointIndex].geometry.coordinates[1],  // This will be the latitude of the point
       centroids.features[targetPointIndex].geometry.coordinates[0]], // This will be the longitude of the point
       18);
    
    // Filter all the features in the markers feature layer so that only the feature with the same title as our target is showing
    markers.setFilter(function(feature) { 
      return feature.properties.building_id == targetID; // Filter the feature with a title property that exactly matches our target.
    });
    
  }
});
});


///////////// DIRECTIONS /////////////////

function getDirections() { 
  
  var directionsAPI = getDirectionsObject(40.793273230746074, -77.86677171823554, targetLat, targetLon)
  console.log(directionsAPI);
  
  $.get(directionsAPI, function (directions) {
    console.log(directions);
    L.geoJson(directions.origin).addTo(map);
    L.geoJson(directions.destination).addTo(map);
    L.geoJson(directions.routes[0].geometry, {
        color: "#ff7800",
        weight: 5,
        opacity: 0.65
    }).addTo(map)
        .bindPopup("Distance: " + (directions.routes[0].distance * 0.000621371).toFixed(2) + " miles" + "<br>Duration: " + (directions.routes[0].duration / 60).toFixed(0) + " mins")
        .openPopup();
  });

};

L.mapbox.accessToken = 'pk.eyJ1IjoibW9yZ2FuaGVybG9ja2VyIiwiYSI6Ii1zLU4xOWMifQ.FubD68OEerk74AYCLduMZQ';

function getDirectionsObject(startLat, startLng, endLat, endLng) {
    var startEnd = startLng + ',' + startLat + ';' + endLng + ',' + endLat;
    var directions = 'https://api.tiles.mapbox.com/v4/directions/mapbox.walking/' + startEnd + '.json?access_token=' + L.mapbox.accessToken;
    console.log(directions);
    return directions;
}



/////////////////////////
