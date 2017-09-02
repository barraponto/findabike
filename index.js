let searchLng;
let searchLat;
let indexOfBikeFound = 0;
let bikeDocks = [ ];


function initAutocomplete() {
        var map = new google.maps.Map(document.getElementById('map'), {
          center: {lat: 40.744696, lng: -73.9822},
          zoom: 11,
          mapTypeId: 'roadmap'
        });

        // Create the search box and link it to the UI element.
        var input = document.getElementById('pac-input');
        var searchBox = new google.maps.places.SearchBox(input);
        

        // Bias the SearchBox results towards current map's viewport.
        map.addListener('bounds_changed', function() {
          searchBox.setBounds(map.getBounds());
        });

        var markers = [];
        // Listen for the event fired when the user selects a prediction and retrieve
        // more details for that place.
        searchBox.addListener('places_changed', function() {
          var places = searchBox.getPlaces();

          if (places.length == 0) {
            return;
          }

          searchLng = places[0].geometry.location.lng();
          searchLat = places[0].geometry.location.lat();

          findBike();

          /*places[0] = `"${bikeDocks[indexOfBikeFound]['lat']}, ${bikeDocks[indexOfBikeFound]['lng']}"`;*/
          

          // Clear out the old markers.
          markers.forEach(function(marker) {
            marker.setMap(null);
          });
          markers = [];

          // For each place, get the icon, name and location.
          var bounds = new google.maps.LatLngBounds();
          places.forEach(function(place) {
            if (!place.geometry) {
              console.log("Returned place contains no geometry");
              return;
            }
            var icon = {
              url: place.icon,
              size: new google.maps.Size(71, 71),
              origin: new google.maps.Point(0, 0),
              anchor: new google.maps.Point(17, 34),
              scaledSize: new google.maps.Size(25, 25)
            };

            // Create a marker for each place.
            markers.push(new google.maps.Marker({
              map: map,
              icon: icon,
              title: place.name,
              position: place.geometry.location
            }));

            if (place.geometry.viewport) {
              // Only geocodes have viewport.
              bounds.union(place.geometry.viewport);
            } else {
              bounds.extend(place.geometry.location);
            }
          });
          map.fitBounds(bounds);

        });
      }



function getBikeDocks() {
  $.getJSON("https://gbfs.citibikenyc.com/gbfs/en/station_information.json", function(results) {
      for (let i = 0; i < results.data.stations.length; i++) {
        bikeDocks.push({
          'station_id': results.data.stations[i].station_id,
          'station_name': results.data.stations[i].name,
          'lat': results.data.stations[i].lat,
          'lng': results.data.stations[i].lon,
          'num_bikes_available': ''
        });
      }
  });
}

function sortBikeDocksByLocation(array) {
  array.sort(sortByLocation);
}

function sortByLocation(a, b) {
  if ((Math.abs(a.lat - searchLat) + Math.abs(a.lng - searchLng)) < (Math.abs(b.lat - searchLat) + Math.abs(b.lng - searchLng))) {
    return -1;
  }
  else {
    return 1;
  }
};

function addNumBikesAvailableToArray() {
  for (let i = 0; i < 10; i++) {
    getNumBikesAvailable(i);
  }
}

function getNumBikesAvailable(index) {
$.getJSON("https://gbfs.citibikenyc.com/gbfs/en/station_status.json", function(results) {  
  for (let i = 0; i < results.data.stations.length; i++) {
    if (results.data.stations[i].station_id === bikeDocks[index]['station_id']) {
      bikeDocks[index]['num_bikes_available'] = results.data.stations[i].num_bikes_available;
    }
  }
  });
}

function displayBikeLocation() {
  for (let i = 0; i < 10; i++) {
    if (bikeDocks[i]['num_bikes_available'] > 2) {
      renderResult(i);
      indexOfBikeFound = i;
      break;
    }
  };
}

function renderResult(index) {
  $('.js-search-result').html(`<div class="result">The ${bikeDocks[index].station_name} station has ${bikeDocks[index]['num_bikes_available']} bikes available</div>`);
}

function findBike() {
  sortBikeDocksByLocation(bikeDocks);
  addNumBikesAvailableToArray();
  displayBikeLocation();
  console.log(bikeDocks[0]);
}

$(getBikeDocks());
$(initAutocomplete());
