$(document).ready(
function() {
    var message = "";
    setup = function(){
        message = $("#message-text").attr("placeholder");
        if (message != ""){
            $("#preview").attr("disabled",true);
            $("#send").html("Delete message")
        }
        else{
            $("#preview").removeAttr("disabled");
            $("#send").html("Send message")   
        }
        
        
    }
    setup();
    $("#message-text").focusin(function() {
           $("#send").html("Send message")   
    });
    $("#message-text").focusout(function() {
           if ($("#message-text").val()=="" & $("#message-text").attr("placeholder")!=""){
               $("#send").html("Delete message");
           }
           else{
               $("#send").html("Send message");
           }
    });

     $("#addmessage-form").submit(function(e){
         e.preventDefault();
          dataString = $("#addmessage-form").serialize();
          message = $("#message-text").val();
          if (message==""){
            $("#send").html("Deleting...");              
          }
          else{
            $("#send").html("Sending...")
          }

          $.ajax({
          type: "POST",
          url: "",
          data: dataString,
          dataType: "json",
          success: function(data) {
              $("#message").html(data.message);
              $("#message-text").attr("placeholder",data.message_text);
              $("#message-text").val("");
              setup()
          },

          error: function(data) {
              $("#message").html(data.responseText);
          }

          });          

      });
      
      $("#preview").click(function(e){
          e.preventDefault();
          humane.info($("#message-text").val());
      });
      

     $("#send").click(function(e){
         e.preventDefault();
         $("#addmessage-form").submit();

     });

});
