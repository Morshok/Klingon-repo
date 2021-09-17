$("button#filter_toggle").click(function(e){
	$("div#filters").toggleClass("closed");
	$("button#filter_toggle i.fa").toggleClass("fa-angle-down fa-angle-up");
});

$("button#menu_toggle").click(function(e){
	$("nav ul").toggleClass("visible");
	$("nav button#menu_toggle .fa").toggleClass("fa-bars fa-times");
});
var map = L.map('map').setView([57.690072772287735, 11.974254546462964], 16);
L.tileLayer('https://api.maptiler.com/maps/streets/{z}/{x}/{y}.png?key=7Y1QmhU25CpvrabZ6trI',{
	attribution:'<a href="https://www.maptiler.com/copyright/" target="_blank">&copy; MapTiler</a> <a href="https://www.openstreetmap.org/copyright" target="_blank">&copy; OpenStreetMap contributors</a>'
}).addTo(map);
var marker = L.marker([57.690072772287735, 11.974254546462964]).addTo(map);
marker.bindPopup("<b>Chalmers Johanneberg</b><br>Campus").openPopup();