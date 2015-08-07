/*
Requires
<script src="https://maps.googleapis.com/maps/api/js"></script>
*/
function initialiseGoogleMap() {
	var mapCanvas = document.getElementById('map-canvas');
	var wedTrainLocation = new google.maps.LatLng(-34.9094512,138.6073773);
	var mapOptions = {
		center: wedTrainLocation,
		zoom: 16,
		mapTypeId: google.maps.MapTypeId.ROADMAP
	}
	var map = new google.maps.Map(mapCanvas, mapOptions);
	
	var image = {
		url: 'img/arc/arc-logo-t-small.png',
		// This marker is 20 pixels wide by 32 pixels tall.
		size: new google.maps.Size(48, 32),
		// The origin for this image is 0,0.
		origin: new google.maps.Point(0,0),
		// The anchor for this image is the base of the flagpole at 0,32.
		anchor: new google.maps.Point(24, 16)
	  };
	
	var shape = {
      coords: [1, 1, 1, 20, 18, 20, 18 , 1],
      type: 'poly'
  };
	
	var marker = new google.maps.Marker({
		position: wedTrainLocation,
		map: map,
		icon: image,
		shape: shape,
		title: 'ARC Wednesday 6pm meet point'
	});
	
	var contentString =
		'<div>' +
		'<img src="https://lh3.googleusercontent.com/-iEr2Y6XJFQ8/VbmHsYpBnaI/AAAAAAAAADo/sGRI3IgCSWg/s400-Ic42/lofty.jpg" class="image-in-map" ></img>' +
		'</div>';
	
	
	var infowindow = new google.maps.InfoWindow({
	  content: contentString
	});
	
	google.maps.event.addListener(marker, 'click', function() {
		infowindow.open(map,marker);
	});
}

function toggleMapVisibility() {
	if (document.getElementById("map-wrapper").style.display == "inline") {
		document.getElementById("map-wrapper").style.display = "none";
	} else {
		document.getElementById("map-wrapper").style.display = "inline";
		initialiseGoogleMap();
	}
}



