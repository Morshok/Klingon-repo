$("button#filter_toggle").click(function(e){
	$("div#filters").toggleClass("closed");
	$("button#filter_toggle i.fa").toggleClass("fa-angle-down fa-angle-up");
});

$("button#menu_toggle").click(function(e){
	$("nav ul").toggleClass("visible");
	$("nav button#menu_toggle .fa").toggleClass("fa-bars fa-times");
});