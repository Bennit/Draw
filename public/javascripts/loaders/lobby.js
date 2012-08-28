/**
 * LOBBY MODULE
 * 
 * This module handles functionality concerning the lobby view.
 * It is executed as it it included on the page.
 * 
 * @author Ben Corne
 */
(function() {
  
  // Hide the loader & show the rest of the page once nowfx is ready.
  // Else, clients might be pressing buttons that won't work yet.
  nowfx.readyE.mapE(function(){
      jQuery('#loader').hide();
      jQuery('#lobby-inner').show();
  });
  
}())