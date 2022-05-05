var gl_map;
var gl_popup;
var gl_marker = null;
var fromPlace = 0;
var locationFromPlace;
var addressFromPlace;
var placeName;
var defaultLatLng;
var mapLoaded = 0;
var geoloc = 0;
var geolocLat = 0;
var geolocLng = 0;
var geolocAddr = "";
// var mapPath=window.location.protocol+'//'+window.location.hostname+'/maps/outdoors_'+locale+'.json';

function myReverseGeocode(latToGeocode, lngToGeocode)
{
    latToGeocode = parseFloat(latToGeocode);
    lngToGeocode = parseFloat(lngToGeocode);
    
    if (latToGeocode>=-90 && latToGeocode<=90 && lngToGeocode>=-180 && lngToGeocode<=180)
    {
        $.ajax({
            type: "GET",
            url: "https://api.opencagedata.com/geocode/v1/json?q="+latToGeocode+"+"+lngToGeocode+"&key=f2c16599bd3546608b91ad1f7452b0c1&no_annotations=1&language="+locale, 
            dataType: "json",
            success: function(data){
                if (data.status.code==200)
                {
                    if (data.total_results>=1)
                    {
						updateAll(data.results[0].formatted, latToGeocode, lngToGeocode);
                    }
                    else
                    {
                        updateAll(textNoGeocodingAddress, latToGeocode, lngToGeocode);
                    }
                }
                else
                {
                    updateAll(textNoGeocodingAddress, latToGeocode, lngToGeocode);
                }
            },
            error: function(xhr, err){
                updateAll(textNoGeocodingAddress, latToGeocode, lngToGeocode);
            }
        }).always();
		
        return false;
    }
    else alert("Invalid coordinates");
}

function updateAll(text,lat,lng) {
	gl_map.setCenter([lng,lat]);
	gl_marker.setLngLat([lng, lat]);
	gl_popup.setHTML('<div id="info_window">'+text+'<br/><strong>Latitude :</strong> ' + Math.round(lat*1000000)/1000000 + ' | <strong>Longitude :</strong> ' + Math.round(lng*1000000)/1000000 + '<br/><strong>URL</strong> : www.myhighst.com/' + locale + '/gps/' + Math.round(lat*1000000)/1000000 + '/' + Math.round(lng*1000000)/1000000 + '<br/><br/>' + elevationButton() + '</div>');
    gl_popup.addTo(gl_map);
	document.getElementById("latitude").value=lat;
    document.getElementById("longitude").value=lng;
    document.getElementById("address").value=text;
    ddversdms();

}
function myForwardGeocode(addr)
{ 
    $.ajax({
        type: "GET",
        url: "https://api.opencagedata.com/geocode/v1/json?q="+encodeURIComponent(addr)+"&key=f2c16599bd3546608b91ad1f7452b0c1&no_annotations=1&language="+locale, 
        dataType: "json",
        success: function(data){
            if (data.status.code==200)
            {
                if (data.total_results>=1)
                {
                    var latres = data.results[0].geometry.lat;
                    var lngres = data.results[0].geometry.lng;
                  
					gl_map.setCenter([lngres,latres]);
                    updateAll(data.results[0].formatted, latres, lngres);
                }
                else
                {
                    alert(textGeocodingFail);
                }
            }
            else
            {
                alert(textGeocodingFail);
            }
        },
        error: function(xhr, err){
            alert(textGeocodingFail);
        }
    }).always(function() {  });
    return false;
}

function initialize(x,y)
{
    var input = document.getElementById('address');
	mapboxgl.accessToken = 'pk.eyJ1IjoiY2xpbnRvbmNydWl6YSIsImEiOiJjbDF3a2x4MjgzNDVjM2JxcnY3eDVuemFoIn0.qh0Ni8NWqKgGSEZTdk3IAw';


	gl_map = new mapboxgl.Map({
			container: 'map_canvas',
			style: 'mapbox://styles/mapbox/streets-v11',
			center: [x, y],
			zoom: 15
	});
	mapboxgl.setRTLTextPlugin('https://api.mapbox.com/mapbox-gl-js/plugins/mapbox-gl-rtl-text/v0.2.1/mapbox-gl-rtl-text.js');
	
	gl_map.addControl(new mapboxgl.NavigationControl());
	gl_map.scrollZoom.disable();

	gl_popup = new mapboxgl.Popup({closeOnClick: false, offset:40, anchor: "bottom"});
gl_marker = new mapboxgl.Marker()
	.setLngLat([y, x])
	.setPopup(gl_popup)
	.addTo(gl_map);

    mapLoaded = 1;	

    
    if(navigator.geolocation)
    {
		navigator.geolocation.getCurrentPosition(function(position) {
	        var geolocLat=position.coords.latitude;
			var geolocLng=position.coords.longitude;
	    
			gl_map.setCenter([geolocLng,geolocLat]);
	    	map_recenter(0);
	    	
			myReverseGeocode(geolocLat,geolocLng);
	    
        }, function() {
	    	updateAll('Malaysia',4.5693754, 102.2656823);
			
        });
    }
    else
    {
        updateAll('Malaysia',4.5693754, 102.2656823);
  		
    }
	
	gl_map.on('click', codeLatLngfromclick);
	gl_map.on('zoomend', function() {
        map_recenter_after_zoom_changed(0);
    });
   
        
}
  
function codeAddress()
{
    var address = document.getElementById("address").value;
	myForwardGeocode(address);
}
  
function codeLatLng(origin)
{
    var lat = parseFloat(document.getElementById("latitude").value);
    var lng = parseFloat(document.getElementById("longitude").value);
    myReverseGeocode(lat,lng);
}
  
function codeLatLngfromclick(event)
{
	var lat = event.lngLat.lat;
    var lng = event.lngLat.lng;
    var latlng = event.lngLat;
    fromPlace = 0;
    myReverseGeocode(lat,lng);
}

function getElevation()
{
    var get_elevation = document.getElementById( 'get_elevation' );
    var get_elevation_ladda = Ladda.create( get_elevation );
    get_elevation_ladda.start();
	
    $.ajax({
        type: "GET",
        url: "https://elevation-api.io/api/elevation?points=("+gl_marker.getLngLat().lat+","+gl_marker.getLngLat().lng+")&resolution=90&key=88cbi8DcXBn9EQnedB3tFoOd96Bax4", 
        dataType: "json",
        success: function(data){
            if (data.elevations.length>=1)
            {
                var ele = parseFloat(data.elevations[0].elevation);
				document.getElementById("altitude").innerHTML = "<strong>" + textElevation + " :</strong> " + Math.floor(ele) + textMeter;
            }
            else
            {
                document.getElementById("altitude").innerHTML = textElevationNoResult;
            }
        },
        error: function(xhr, err){
            document.getElementById("altitude").innerHTML = textElevationNoResult;
        }
    });
}  
  
function ddversdms()
{
    var lat, lng, latdeg, latmin, latsec, lngdeg, lngmin, lngsec;
    lat=document.getElementById("latitude").value;	
    lng=document.getElementById("longitude").value;
    if (lat>0) document.getElementById("nord").checked=true;
    if (lat<0) document.getElementById("sud").checked=true;
    if (lng>0) document.getElementById("est").checked=true;
    if (lng<0) document.getElementById("ouest").checked=true;
    lat=Math.abs(lat);	
    lng=Math.abs(lng);
    latdeg=Math.floor(lat);
    latmin=Math.floor((lat-latdeg)*60);
    latsec=Math.round((lat-latdeg-latmin/60)*1000*3600)/1000;
    lngdeg=Math.floor(lng);
    lngmin=Math.floor((lng-lngdeg)*60);
    lngsec=Math.floor((lng-lngdeg-lngmin/60)*1000*3600)/1000;
    document.getElementById("latitude_degres").value=latdeg;
    document.getElementById("latitude_minutes").value=latmin;
    document.getElementById("latitude_secondes").value=latsec;
    document.getElementById("longitude_degres").value=lngdeg;
    document.getElementById("longitude_minutes").value=lngmin;
    document.getElementById("longitude_secondes").value=lngsec;
}
  
function dmsversdd()
{
    var lat, lng, nordsud, estouest;
    if (document.getElementById("sud").checked) nordsud=-1;
    else nordsud=1;
    if (document.getElementById("ouest").checked) estouest=-1;
    else estouest=1;
    lat=nordsud * (parseFloat(document.getElementById("latitude_degres").value) + parseFloat(document.getElementById("latitude_minutes").value)/60 + parseFloat(document.getElementById("latitude_secondes").value)/3600);
    lng=estouest * (parseFloat(document.getElementById("longitude_degres").value) + parseFloat(document.getElementById("longitude_minutes").value)/60 + parseFloat(document.getElementById("longitude_secondes").value)/3600);
    document.getElementById("latitude").value=Math.round(lat*10000000)/10000000;
    document.getElementById("longitude").value=lng;
}

function elevationButton()
{
    return '<span id="altitude"><input id="get_elevation" type="button" class="submit_button btn btn-primary btn-xs" value="' + textGetElevation + '" onclick="getElevation()"></span>&nbsp;';
}

function addPoiButton(x,y,address)
{
    address=address.replace(/'/g, "&rsquo;");
    return '<span id="add_poi"><input type="button" class="add_poi btn btn-primary btn-xs" value="' + textAddPoi +'" onclick="addPOI(' + x + ',' + y + ',\'' + address +'\')"></span>';
}

function map_recenter(latlng) {
	return false;
    var winWidth = $( window ).width();
    if (winWidth>=768)
    {
	var offsetx = $('#tools').width()/2;
	var offsety = 0;
	var point1 = map.getProjection().fromLatLngToPoint(
	    (latlng instanceof google.maps.LatLng) ? latlng : map.getCenter()
	);
	var point2 = new google.maps.Point(
	    ( (typeof(offsetx) == 'number' ? offsetx : 0) / Math.pow(2, map.getZoom()) ) || 0,
	    ( (typeof(offsety) == 'number' ? offsety : 0) / Math.pow(2, map.getZoom()) ) || 0
	);  
	map.setCenter(map.getProjection().fromPointToLatLng(new google.maps.Point(
	    point1.x - point2.x,
	    point1.y + point2.y
	)));
    }
}

function map_recenter_after_zoom_changed(latlng) {
	
	return false;
	
    var newZoom = map.getZoom();
    var winWidth = $( window ).width();
    if (winWidth>=768)
    {
	if (newZoom>globalZoom) var offsetx = -$('#tools').width()/2;
	else if (newZoom<globalZoom) var offsetx = $('#tools').width()/2;
	else var offsetx = 0;
	var offsety = 0;
	var point1 = map.getProjection().fromLatLngToPoint(
	    (latlng instanceof google.maps.LatLng) ? latlng : map.getCenter()
	);
	var point2 = new google.maps.Point(
	    ( (typeof(offsetx) == 'number' ? offsetx : 0) / Math.pow(2, newZoom) ) || 0,
	    ( (typeof(offsety) == 'number' ? offsety : 0) / Math.pow(2, newZoom) ) || 0
	);  
	map.setCenter(map.getProjection().fromPointToLatLng(new google.maps.Point(
	    point1.x - point2.x,
	    point1.y + point2.y
	)));
	globalZoom = newZoom;
    }
}

function alertPerso(modTitle, modBody) {
    $('#myModalLabel').html(modTitle);
    $('#myModalBody').html(modBody);
    $('#myModal').modal();
}