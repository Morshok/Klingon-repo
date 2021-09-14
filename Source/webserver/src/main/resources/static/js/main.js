$("button#filter_toggle").click(function(e){
	$("div#filters").toggleClass("closed");
	$("button#filter_toggle i.fa").toggleClass("fa-angle-double-down fa-angle-double-up");
});