// CATA publishes live bus locations in JSON format (?) to the URL below
// http://realtime.catabus.com/InfoPoint/rest/vehicles/getallvehicles

//POPULATE MYAVAIL PROPERTIES FROM SERVER SIDE WHEN NECESSARY

var geojsonLayer = L.geoJson.ajax("http://realtime.catabus.com/InfoPoint/rest/vehicles/getallvehicles",{dataType:"jsonp"});
console.log(geojsonLayer);