jQuery.fn.center = function () {
    	this.each(function() {
		var elem = jQuery(this);
                elem.css("position","relative");
		elem.css("top", ((elem.parent().height() - elem.height()) / 2)+'px');
		elem.css("left", ((elem.parent().width() - elem.width()) / 2)+'px');		
	});
	return this;
};

jQuery.extend({ centerOnLoad:function() {
  jQuery(document).bind('ready',function() {
  
    // recenter all .vcenter .hcenter classes on window resize
    jQuery('.vcenter.hcenter:not(img)').center(); // initial trigger
    var resizeE = jQuery(window).fj('extEvtE','resize');
    resizeE.mapE(function(e) {
        jQuery('.vcenter.hcenter').center();
    });
  });
  
  jQuery(window).bind('load',function(){
    // images aren't always ready onready => their width&height is 0
    // so we need to center them again.
    jQuery('img.vcenter.hcenter').center();
  });
}});