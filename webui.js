$.ajaxSetup({'async': false});

var api_baseurl = "https://ibis.jufo.mytfg.de/api1/";

$( document ).ready( function() {
	setTrackSelectOptions($("#track_select_num").val());

	// Set profile select options
	setProfileOptions();

	// admin
	$.getJSON(api_baseurl + "login.php?status", function(json) {
		if(json.status=="ok") {
			postLogin();
		} else {
			postLogout();
		}
	});

});

function postLogin() {
	$("#login_div").hide();
	$("#logout_div").show();
	$("#admin_content_noauth").hide();
	$("#admin_content_authuser").show();
	$("#profile_content_noauth").hide();
	$("#profile_content_authuser").show();
	setAdminDeleteOptions($("#admin_delete_num").val());
}

function postLogout() {
	$("#logout_div").hide();
	$("#login_div").show();
	$("#admin_content_authuser").hide();
	$("#admin_content_noauth").show();
	$("#profile_content_authuser").hide();
	$("#profile_content_noauth").show();
}

function deleteTracks() {
	var url = api_baseurl + "deletetrack.php?deletetrack&track_ids=";
	$('#admin_delete_select option:selected').each(function() {
		url += $(this).val() + ";";
	});
	
	$.getJSON(url, function(json) {
		if(json.error){
			alert("Fehler: "+json.error);
		} else if(json.success) {
			alert("Erfolg: "+json.success);
		} else {
			alert("Unknown error");
		}
		
		// refresh admin and tracks pane
		setAdminDeleteOptions($("#admin_delete_num").val());
		setTrackSelectOptions($("#track_select_num").val());
	});
}

function loginUser() {
	var url = api_baseurl + "login.php?login&user="+$("#login_user").val()+"&password="+$("#login_pw").val();
	$.getJSON(url, function(json) {
		if(json.error){
			postLogout();
			alert("Fehler: "+json.error);
		} else if(json.success) {
			postLogin();
		} else {
			postLogout();
			alert("Unknown error");
		}
	});
}

function logoutUser() {
	$.getJSON(api_baseurl + "login.php?signout", function(json) {
		if(json.error){
			postLogout();
			alert("Fehler: "+json.error);
		} else if(json.success) {
			postLogout();
		} else {
			postLogout();
			alert("Unknown error");
		}
	});
}

function userTokenParam() {
	var url_token = document.URL.split('#token(');
	//var token_array = token_str[token_str.length-1].split(';');
	if(url_token[1]) {
		var token = url_token[1].substring(0, url_token[1].indexOf(')'))
		return "&user_token=" + token;
	}
	return "";
}

$("#track_select_num_form").submit( function () {
	setTrackSelectOptions($("#track_select_num").val());
});

$("#admin_delete_num_form").submit( function () {
	setAdminDeleteOptions($("#admin_delete_num").val());
});

function setTrackSelectOptions(num) {
	var options_uri = api_baseurl + "gettrack.php?tracklist=tracklist&num=" + num + userTokenParam();
	$.getJSON(options_uri, function (json) {
		var options = "";
		for (var i = 0; i< json.length; i++) {
			options += "<option value=\"" + json[i].track_id + "\">" + json[i].name + "</option>";
		}
		$('#track_select').find("option").remove().end()
		.append(options);
	});
	var num_uri = api_baseurl + "gettrack.php?tracknum=tracknum" + userTokenParam();
	$.getJSON(num_uri, function (json) {
		$('#track_select_num_p').replaceWith("<p id=\"track_select_num_p\">Es sind " + json.num + " Tracks vorhanden.</p>");
		var options = "";
		for (var i = 0; i < json.num; i = i+25) {
			options += "<option value=\"" + i + "\">" + i + "..." + (Math.min((i+24),json.num)) + "</option>";
		}
		var s_num = $("#track_select_num").val();
		$('#track_select_num').find("option").remove().end()
		.append(options);
		$("#track_select_num").val(s_num);
	});
}

function setAdminDeleteOptions(num) {
	var options_uri = api_baseurl + "gettrack.php?tracklist=tracklist&num=" + num;
	$.getJSON(options_uri, function (json) {
		var options = "";
		for (var i = 0; i< json.length; i++) {
			options += "<option value=\"" + json[i].track_id + "\">" + json[i].name + "</option>";
		}
		$('#admin_delete_select').find("option").remove().end()
		.append(options);
	});
	var num_uri = api_baseurl + "gettrack.php?tracknum=tracknum";
	$.getJSON(num_uri, function (json) {
		$('#admin_delete_num_p').replaceWith("<p id=\"admin_delete_num_p\">Es sind " + json.num + " Tracks vorhanden.</p>");
		var options = "";
		for (var i = 0; i < json.num; i = i+25) {
			options += "<option value=\"" + i + "\">" + i + "..." + (Math.min((i+24),json.num)) + "</option>";
		}
		var s_num = $("#admin_delete_num").val();
		$('#admin_delete_num').find("option").remove().end()
		.append(options);
		$("#admin_delete_num").val(s_num);
	});
}

function setProfileOptions() {
	var options_uri = api_baseurl + "updatecost.php?getprofiles";
	$.getJSON(options_uri, function (json) {
		var options = "";
		for (var key in json) {
			options += "<option value=\"" + key + "\">" + json[key] + "</option>";
		}
		$('#profile_select').find("option").remove().end()
		.append(options);
		$('#showedges_staticcost_profile').find("option").remove().end()
		.append(options);
		$('#route_profile_latlon').find("option").remove().end()
		.append(options);
		$('#route_profile_address').find("option").remove().end()
		.append(options);
	});
}

// extend the default marker class (custon icon)
var StartIcon = L.Icon.Default.extend({
options: {
		//iconUrl: 'leaflet/marker-start.png'
}
});
var startIcon = new StartIcon();

var DestIcon = L.Icon.Default.extend({
options: {
		iconUrl: 'leaflet/images/dest-Pin-2x.png'
}
});
var destIcon = new DestIcon();

function setStart(e) {
	$("#start_lat").val(e.latlng.lat);
	$("#start_lon").val(e.latlng.lng);
	startMark.setLatLng(e.latlng).bindPopup("Start (" + e.latlng.toString() + ")").update();
	/*popup_start
		.setLatLng(e.latlng)
		.setContent("Start at " + e.latlng.toString())
		.openOn(map);*/
}

function setDest(e) {
	$("#end_lat").val(e.latlng.lat);
	$("#end_lon").val(e.latlng.lng);
	destMark.setLatLng(e.latlng).bindPopup("Ziel (" + e.latlng.toString() + ")").update();
	/*popup_end
		.setLatLng(e.latlng)
		.setContent("End at " + e.latlng.toString())
		.openOn(map);*/
}

function onMapClick(e) {
	if(clickTyp == 0){
		setStart(e);
		clickTyp = clickTyp+1;
	} else if(clickTyp == 1){
		setDest(e);
		clickTyp = clickTyp+1;
	} else if(clickTyp >= 2){
		clickTyp = 0;
	}
}
	
function drawPolyline(urlJsonData){
	// Get points of selected track an show it on map
	// Create array of lat,lon points
	var line_points = [];
	$.getJSON(urlJsonData, function (json) {
		if(json.points) {
			for (var i = 0; i < json.points.length; i++) {
				line_points.push(L.latLng(parseFloat(json.points[i].lat), parseFloat(json.points[i].lon)));
			}
			// create a red polyline from an array of LatLng points
			var polyline = L.polyline(line_points, {color: 'red'}).addTo(map);
			// add lat and lon to array:
			lats.push(polyline.getBounds().getSouth());
			lats.push(polyline.getBounds().getNorth());
			lons.push(polyline.getBounds().getWest());
			lons.push(polyline.getBounds().getEast());
		} else {
			alert("Keine Punkte in Routendaten enthalten.");
		}
		if(json.distance) {
			if(json.distance>1000) {
				// Display distance in km with 2 decimal places
				alert("Länge der Route beträgt: "+Math.round(json.distance/10)/100+" Kilometer.");
			} else {
				// Display distance in m without any decimal places
				alert("Länge der Route beträgt: "+Math.round(json.distance)+" Meter.");
			}
		}
	});
}
	
function drawMultiPolyline(urlJsonData){
	// Get points of selected track an show it on map
	// Create array of lat,lon points
	var line_points = [];
	$.getJSON(urlJsonData, function (json) {
		for (var j = 0; j < json.length; j++) {
			line_points = [];
			for (var i = 0; i < json[j].length; i++) {
				if (json[j][i].lat)
					line_points.push(L.latLng(parseFloat(json[j][i].lat), parseFloat(json[j][i].lon)));
			}
			// create a red polyline from an array of LatLng points
			var polyline = L.polyline(line_points, {color: 'blue'}).addTo(map);
			// Polylines should be inside current bounds
			/* // add lat and lon to array:
			lats.push(polyline.getBounds().getSouth());
			lats.push(polyline.getBounds().getNorth());
			lons.push(polyline.getBounds().getWest());
			lons.push(polyline.getBounds().getEast()); */
		}
	});
}

function distance(lat1, lon1, lat2, lon2) {
	var radlat1 = Math.PI * lat1/180;
	var radlat2 = Math.PI * lat2/180;
	var radlon1 = Math.PI * lon1/180;
	var radlon2 = Math.PI * lon2/180;
	var theta = lon1-lon2;
	var radtheta = Math.PI * theta/180;
	var dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
	dist = Math.acos(dist);
	dist = dist * 180/Math.PI;
	dist = dist * 60 * 1.1515;
	dist = dist * 1.609344;
	return dist * 1000;
}

function drawColorPolyline(urlJsonData){
	$.getJSON(urlJsonData, function (json) {
		for (var i = 0; i < json.length-1; i++) {
			var line_points = [2];
			// Line from point i to point i+1
			line_points[0] = L.latLng(parseFloat(json[i].lat), parseFloat(json[i].lon)); 
			line_points[1] = L.latLng(parseFloat(json[i+1].lat), parseFloat(json[i+1].lon));
			// Distance between point i and point i+1
			var dist = distance(json[i].lat, json[i].lon, json[i+1].lat, json[i+1].lon); // in meters
			// Speed calculation based on  timestamp difference and distance
			var dtime = json[i+1].timestamp-json[i].timestamp; 		// in seconds
			var speed = dist/dtime;		// in m/s (meter/second)
			// Color of line dependung on Speed
			var color;
			var speed_co = 0.500;
			if(speed<1*speed_co) {
				color = "#FF0000";
			} else if(speed<(3*speed_co)) {
				color = "#FF4000";
			} else if(speed<(5*speed_co)) {
				color = "#FF8000";
			} else if(speed<(8*speed_co)) {
				color = "#FFC000";
			} else if(speed<(11*speed_co)) {
				color = "#FFFF00";
			} else if(speed<(14*speed_co)) {
				color = "#C0FF00";
			} else if(speed<(17*speed_co)) {
				color = "#80FF00";
			} else if(speed<(20*speed_co)) {
				color = "#40FF00";
			} else if(speed<(25*speed_co)) {
				color = "#10FF00";
			} else {
				color = "#0000FF";
			}
			var polyline = L.polyline(line_points, {color: color}).addTo(map);
			lats.push(polyline.getBounds().getSouth());
			lats.push(polyline.getBounds().getNorth());
			lons.push(polyline.getBounds().getWest());
			lons.push(polyline.getBounds().getEast());
		}
	});
}

function drawMultiColorPolyline(urlJsonData){
	$.getJSON(urlJsonData, function (json) {
		for (var j = 0; j < json.length-1; j++) {
			line_points = [];
			
			var cost = 100000;
			
			for (var i = 0; i < json[j].length; i++) {
				if (json[j][i].cost)
					cost = parseFloat(json[j][i].cost);
				if (json[j][i].lat)
					line_points.push(L.latLng(parseFloat(json[j][i].lat), parseFloat(json[j][i].lon)));
			}
			
			// Color of line dependung on Speed
			var color;
			if(cost<0.55) {
				color = "#00FF00";
			} else if(cost<(0.65)) {
				color = "#40FF00";
			} else if(cost<(0.75)) {
				color = "#80FF00";
			} else if(cost<(0.90)) {
				color = "#C0FF00";
			} else if(cost<(1.05)) {
				color = "#FFFF00";
			} else if(cost<(1.25)) {
				color = "#FFC000";
			} else if(cost<(1.60)) {
				color = "#FF8000";
			} else if(cost<(2.50)) {
				color = "#FF4000";
			} else if(cost<(100.0)) {
				color = "#FF0000";
			} else {
				color = "#000000";
			}
			
			// create a red polyline from an array of LatLng points
			var polyline = L.polyline(line_points, {color: color}).addTo(map);
		}
	});
}

function clearMap() {
	for(i in map._layers) {
		if(map._layers[i]._path != undefined) {
			try {
				map.removeLayer(map._layers[i]);
			} catch(e) {
				console.log("problem with " + e + map._layers[i]);
			}
		}
	}
}

var map = L.map('map', {
		contextmenu: true,
		contextmenuWidth: 120,
		contextmenuItems: [{
			text: 'Startpunkt setzen',
			//icon: 'images/zoom-in.png',
			callback: setStart
		}, {
			text: 'Ziel setzen',
			callback: setDest
		}]
	});

map.setView([50, 7], 7);

// http://{s}.tile.thunderforest.com/cycle (OpenCycleMap) ist leider nicht über https verfügbar
// -> leider MixedContent 
L.tileLayer('http://{s}.tile.thunderforest.com/cycle/{z}/{x}/{y}.png', {
//L.tileLayer('https://tiles.rleh.de/tiles/thunderforest/{z}/{x}/{y}.png', {
	maxZoom: 18
}).addTo(map);

navigator.geolocation.getCurrentPosition( function GetLocation(location) {
	map.panTo([location.coords.latitude, location.coords.longitude]);
	map.zoomIn(2);
});

var sidebar = L.control.sidebar('sidebar').addTo(map);


var clickTyp = 0;
var popup_start = L.popup();
var popup_end = L.popup();

var lats = [];
var lons = [];

var startMark = L.marker([0, 0], {icon: startIcon}).addTo(map);
var destMark = L.marker([0, 0], {icon: destIcon}).addTo(map);

map.on('click', onMapClick);

$( "#show_track" ).submit(function( event ) {
	// Remove all polylines
	clearMap();
	lats = [];
	lons = [];
	// Draw ploylines for any sleected track
	$('#track_select option:selected').each(function() {
		drawColorPolyline(api_baseurl + "gettrack.php?gettrack=gettrack&track_id=" + $(this).val());
	});
	$('#track_select option:selected').promise().done(function() {
		var latSouth = Math.max.apply(Math, lats);
		var latNorth = Math.min.apply(Math, lats);
		var lngWest = Math.max.apply(Math, lons);
		var lngEast = Math.min.apply(Math, lons);
		var southWest = L.latLng(latSouth, lngWest);
		var northEast = L.latLng(latNorth, lngEast);
		map.fitBounds(L.latLngBounds(southWest, northEast));
	});
	// prevent reload
	event.preventDefault();
	if (!(window.matchMedia('(min-width: 768px)').matches)) {
		sidebar.close();
	}
});

$( "#generate_route" ).submit(function( event ) {
	event.preventDefault();
	// Remove all polylines
	clearMap();
	lats = [];
	lons = [];
	var optimize = "&optimize=0";
	if( $("#route_optimize_latlon").prop("checked") ) {
		optimize = "&optimize=1";
	}
	// draw polyline for route
	drawPolyline(api_baseurl + "getroute.php?getroute=getroute"
		+"&start_lat="+$("#start_lat").val()
		+"&start_lon="+$("#start_lon").val()
		+"&end_lat="+$("#end_lat").val()
		+"&end_lon="+$("#end_lon").val()
		+"&profile="+$("#route_profile_latlon").val()
		+optimize);
	// prevent reload
	var latSouth = Math.max.apply(Math, lats);
	var latNorth = Math.min.apply(Math, lats);
	var lngWest = Math.max.apply(Math, lons);
	var lngEast = Math.min.apply(Math, lons);
	var southWest = L.latLng(latSouth, lngWest);
	var northEast = L.latLng(latNorth, lngEast);
	map.fitBounds(L.latLngBounds(southWest, northEast));
});

$( "#generate_route_2" ).submit(function( event ) {
	event.preventDefault();
	// Remove all polylines
	clearMap();
	lats = [];
	lons = [];
	var optimize = "&optimize=0";
	if( $("#route_optimize_address").prop("checked") ) {
		optimize = "&optimize=1";
	}
	// draw polyline for route
	drawPolyline(api_baseurl + "getroute.php?getroute=getroute"
		+"&start="+$("#start").val()
		+"&end="+$("#end").val()
		+"&profile="+$("#route_profile_address").val()
		+optimize);
	// prevent reload
	var latSouth = Math.max.apply(Math, lats);
	var latNorth = Math.min.apply(Math, lats);
	var lngWest = Math.max.apply(Math, lons);
	var lngEast = Math.min.apply(Math, lons);
	var southWest = L.latLng(latSouth, lngWest);
	var northEast = L.latLng(latNorth, lngEast);
	map.fitBounds(L.latLngBounds(southWest, northEast));
});

$( "#showedges_simple" ).submit(function( event ) {
	// Remove all polylines
	clearMap();
	// Get Bound of current leaflet map:
	var bounds = map.getBounds();
	// draw polyline for every edge
	drawMultiPolyline(api_baseurl + "gettopo.php?getedges=getedges"
		+"&start_lat="+bounds.getNorth()
		+"&start_lon="+bounds.getWest()
		+"&end_lat="+bounds.getSouth()
		+"&end_lon="+bounds.getEast() );
	// (Polylines should be inside current bounds)
	// prevent reload
	event.preventDefault();
});

$( "#showedges_staticcost" ).submit(function( event ) {
	// Remove all polylines
	clearMap();
	// Get Bound of current leaflet map:
	var bounds = map.getBounds();
	// draw polyline for every edge
	drawMultiColorPolyline(api_baseurl + "gettopo.php?getedges=getedges&cost=static"
		+"&profile="+$("#showedges_staticcost_profile").val()
		+"&start_lat="+bounds.getNorth()
		+"&start_lon="+bounds.getWest()
		+"&end_lat="+bounds.getSouth()
		+"&end_lon="+bounds.getEast() );
	// (Polylines should be inside current bounds)
	// prevent reload
	event.preventDefault();
});

$( "#showedges_dyncost" ).submit(function( event ) {
	// Remove all polylines
	clearMap();
	// Get Bound of current leaflet map:
	var bounds = map.getBounds();
	// draw polyline for every edge
	drawMultiColorPolyline(api_baseurl + "gettopo.php?getedges=getedges&cost=dynamic"
		+"&start_lat="+bounds.getNorth()
		+"&start_lon="+bounds.getWest()
		+"&end_lat="+bounds.getSouth()
		+"&end_lon="+bounds.getEast() );
	// (Polylines should be inside current bounds)
	// prevent reload
	event.preventDefault();
});

$( "#cleanmap_form" ).submit(function( event ) {
	// Remove all polylines
	clearMap();
});

$( "#profile_select_form" ).submit(function( event ) {
	// Check if user is authenticated
	$.getJSON(api_baseurl + "login.php?status", function(json) {
		if(json.status == "ok") {
			// Load profile
			$.getJSON(api_baseurl + "profiles.php?profile="+$("#profile_select").val(), function(json) {
				if(json.name && json.entries) {
					$("#profile_content").html("<h3>Profil: " + json.name + "</h3>"
					+ '<form id="profile_update_form"><table id="profile_update_form_table">'
					+ "</table></form>");
					$("#profile_update_form")
						.attr("action", "#")
						.attr("onsubmit", "updateProfile(event)")
						.attr("methode", "post");
					$.each(json.entries, function(index, entry){
						$("#profile_update_form_table").append(
							'<tr><td>' + entry.name + '</td>'
							+'<td><input class="cost" type="text" name="' + entry.name + '" value="' + entry.cost + '" id="' + entry.id + '">'
							+'</td></tr>');
					});
					$("#profile_update_form_table").append('<tr><td colspan="2">&nbsp;</td></tr>'
						+'<tr><td>Anteil der Dynamischen Kosten</td><td><input class="cost" type="text" name="amount_dyncost"  value="' + json.amount_dyncost + '" id="amount_dyncost"></td></tr>'
						+'<tr><td></td><td><input type="submit" value="Ändern"></td></tr>'
						+'<input type="hidden" name="profile" id="profile_profile" value="' + json.name +'">');
				} else {
					alert("Cannot get profile editor");
				}
			});
		} else if (json.status == "bad") {
			alert("Please sign in");
		}
		else {
			alert("Unknown error (network connection?)");
		}
	});
});

function updateProfile(event) {
	var url = api_baseurl + "updatecost.php?profile="+$("#profile_profile").val();
	$("#profile_update_form .cost").each(function(){
		url += "&" + $(this).attr("id") + "=" + $(this).val();
	});
	$.getJSON(url, function(json) {
		if(json.error){
			alert("Error: "+json.error);
		} else if(json.success) {
			alert("Success: "+json.success);
		} else {
			alert("Unknown error");
		}
	});
	// Prevent reload:
	event.preventDefault();
	return false;
}
