mapboxgl.accessToken = 'pk.eyJ1IjoiY2xpbnRvbmNydWl6YSIsImEiOiJjbDF3a2x4MjgzNDVjM2JxcnY3eDVuemFoIn0.qh0Ni8NWqKgGSEZTdk3IAw';


navigator.geolocation.getCurrentPosition(successLocation, errorLocation, { enableHighAccuracy:true });

function successLocation(position){
    settingMap([position.coords.longitude, position.coords.latitude])
}

function errorLocation(){
    settingMap([101.91835,2.70330])
}

function settingMap(center){
    const map = new mapboxgl.Map({
        container: 'map',
        style: 'mapbox://styles/mapbox/streets-v11',
        center: [101.91835,2.70330],
        zoom: 15
    });

   const layerList = document.getElementById('menu');
const inputs = layerList.getElementsByTagName('input');
 
for (const input of inputs) {
input.onclick = (layer) => {
const layerId = layer.target.id;
map.setStyle('mapbox://styles/mapbox/' + layerId);
};
}
  
const geocoder = new MapboxGeocoder({
accessToken: mapboxgl.accessToken,
marker: {
color: 'orange'
},
mapboxgl: mapboxgl
});
 
map.addControl(geocoder); 

    map.addControl(new mapboxgl.NavigationControl());

    var directions = new MapboxDirections({
        accessToken: mapboxgl.accessToken,
        unit: 'metric',
      });
      map.addControl(directions, 'top-left');


// Add geolocate control to the map.
map.addControl(
new mapboxgl.GeolocateControl({
positionOptions: {
enableHighAccuracy: true
},
// When active the map will receive updates to the device's location as it changes.
trackUserLocation: true,
// Draw an arrow next to the location dot to indicate which direction the device is heading.
showUserHeading: true
})
);


}

// navbar section 
const bar = document.getElementById('menubar');
const close = document.getElementById('close');
const closing = document.querySelector('#map_canvas');
const scroll = document.querySelector('.header');

if (bar)
{
    bar.addEventListener('click', () => {
        scroll.classList.add('active');
    })
}
if (close)
{
    close.addEventListener('click', () => {
        scroll.classList.remove('active');
    })
}

if (closing)
{
    closing.addEventListener('click', () => {
        scroll.classList.remove('active');
    })
}
function codeAddress() {
    var x = document.querySelector(".lineii");
    if (x.style.display !== "none") {
      x.style.display = "none";
    } else {
      x.style.display = "block";
    }
  }
//  Oakland Commerce Square, 137 - 1 Lorong Haruan 5 / 5, 70300 Seremban, Negeri Sembilan, West Malaysia
// 2.7033862732498335 
//  101.91835468552387