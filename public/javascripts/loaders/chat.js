/**
 * CHAT MODULE
 * 
 * This module handles chatting in the draw view.
 * It is executed as it it included on the page.
 * 
 * // NOW.JS
 * now.userJoinedTable(nickname)         -- Notify user join
 * now.userLeftTable(nickname)           -- Notify user leave
 * now.receiveDrawChat(nickname,message) -- Receive a chat message
 * now.receiveDrawMessage(message)       -- Receive a draw message
 * 
 * @author Ben Corne
 */
var Chat = (function() {
    
    /**
     * Send chat messages
     */
    function sendChat(keypress) {
        if(keypress.keyCode == 13) {
            var input = jQuery(keypress.target);
            now.chatWithDraw(input.val());
            input.val('');
        }
    }
    jQuery('#chatbox-input').fj('extEvtE','keypress').mapE(sendChat);
    
    /**
     * Show the chats to the user when they arrive
     */
    var chatE = receiverE();
    var chat = jQuery('#chatbox-messages');
    chatE.mapE(function(message){
        // We cannot append with flapjax, thus we do it with jquery
        chat.append(message);
        chat.animate({scrollTop:chat.prop('scrollHeight')},"slow");
    });
    
    /**
     * now.receiveDrawChat(nickname,message)
     */
    nowfx
        .receiveE('receiveDrawChat','nickname','message')
        .mapE(function(r){
            chatE.sendEvent(P(B(r.nickname),SPAN(' : '+r.message)));
        });
    
    /**
     * now.receiveDrawMessage(message)
     */
    nowfx.receiveE('receiveDrawMessage','message').mapE(function(r){
       chatE.sendEvent(P({className:'message'},r.message));
    });
    
}())