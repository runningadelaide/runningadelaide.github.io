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
	
	var marker = new google.maps.Marker({
		position: wedTrainLocation,
		map: map,
		title: 'ARC Wednesday 6pm meet point'
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
//google.maps.event.addDomListener(window, 'load', initialize);
