// The first line here loads the data in the building-centroids GeoJSON file
$.getJSON("../data/building-centroids.json", function(centroids) {
  
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
      '<button class="btn btn-info trigger">Directions to here</button>'
    ) // This "bindPopUp" method adds the above HTML content to the pop-up window. We need to make that content specific to the feature's data.
    .addTo(map); // Add the new feature layer to the map.
  
  // Defines a function that takes all of the names of the buildings and adds them to an array we'll use in the autocomplete search functionality.
  function getTags(data) {
    var tagNames = []; // Initialize an empty array
    // Then for each feature in the dataset, do the following...
    for (var i = 0; i < data.features.length; i++) {
      // If the feature has a name that's not NULL or UNDEFINED, add it to our array of tags for autocomplete.
      if (data.features[i].properties.title !== null && centroids.features[i].properties.title !== undefined) {
        tagNames.push(data.features[i].properties.title); // Adds the feature property to our array/list of tags
      }
    }
    return tagNames; // The function then returns the array tagNames that we filled as an output.
  }
    
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
    // Call the getTags function we defined above on our building centroids point data and save it as availableTags
    var availableTags = getTags(centroids);
    
    $("#search").catcomplete({
        source: data, //!!Change availableTags to Database Json file!!! The list of tags for the autocomplete is availableTags.
        minLength: 2, // Give autocomplete suggestions after two letters are typed
        autoFocus: true,
        select: function (event, ui) { // An event listener that does the following code once an option from the autocomplete menu is selected
            setTimeout(zoomToSearchPoint, 50); // When an option is selected, zoom to that point. The zoomToSearchPoint function is definded below.
        }
    });
  });
  
  // Defining a function that automatically zooms the map to the feature with the same title as whatever's in the search field.
  function zoomToSearchPoint() {
    
    var targetName = document.getElementById('search').value; // Gets whatever text the user has entered into the search field.
    
    
    // For each of the centroids points, check if the title matches our target, and if it does,
    // break out of the loop and set the map view to that point,
    // then filter our markers feature layer so that only the target point is showing.
    
    for (var i = 0; i < centroids.features.length; i++) { // Initialize the for loop
      if (centroids.features[i].properties.title === targetName) { // For each point, check if the title of the point matches the target
        var targetPointIndex = i; // Remembers whatever number feature it was that matches for use later.
        break; // Skip the rest of the loop, we already found what we wanted.
      } else {
        console.log('not found'); // If we don't find it, and this should never happen, write in the console that we didn't find it.
      }
    }
    
    // Change the map view to the coordinates of the target point.
    map.setView(
      [centroids.features[targetPointIndex].geometry.coordinates[1],  // This will be the latitude of the point
       centroids.features[targetPointIndex].geometry.coordinates[0]], // This will be the longitude of the point
       18);
    
    // Filter all the features in the markers feature layer so that only the feature with the same title as our target is showing
    markers.setFilter(function(feature) { 
      return feature.properties.title === targetName; // Filter the feature with a title property that exactly matches our target.
    });
  }
});
});





/////////////////////////
