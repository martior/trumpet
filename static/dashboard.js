$(document).ready(
function() {

    getSites = function(){
    $("#sitetable tbody").html("");
    		$.getJSON(
    			"dashboard/sites",
    			function(data){
    				$.each(data, function(i,enabled){
    					var tblRow =
    						"<tr>"
    						+"<td><a href='/dashboard/"+i+"' netloc='"+i+"'>"+i+"</a></td>"
    						+"<td><span class='label success'>Active</span></td>"
    						+"</tr>"
    					$(tblRow).appendTo("#sitetable tbody");
    				});
    			$("#sitetable tbody tr td a").click(navigateToSite);
    			}

    		);
    }



    getMessages = function(){
    $("#messagetable tbody").html("");
    
    $.getJSON(
		"dashboard/sites/"+window.site+"/messages",
		function(data){

			$.each(data, function(i,value){
				var tblRow =
					"<tr class='message-row' message-id='"+i+"'>"
					+"<td><a href='/dashboard/"+i+"' netloc='"+i+"'>"+value+"</a></td>"
					+"<td>&nbsp;</td>"
					+"<td><a class='btn danger delete-message' href='#'>delete</a></td>"
					+"</tr>"
				$(tblRow).appendTo("#messagetable tbody");
			});
		    $(".delete-message").click(function(e){
                  e.preventDefault();
                  deleteMessage($(this).parents(".message-row"));
            });
            
		}

	);
    }    


    deleteMessage = function(message){
        $.ajax({
        type: "DELETE",
		url: "dashboard/sites/"+window.site+"/messages/"+message.attr("message-id"),
        dataType: "json",
        success: function(data) {

            m = 
            "<div class='alert-message success'>"
            +  "<a class='close' href='#'>×</a>"
            +  "<p>"+data.message+"</p>"
            +"</div>";

            $("#message").html(m);
            $("#message").alert();
            message.remove()
        },

        error: function(data) {
            m = 
            "<div class='alert-message error'>"
            +  "<a class='close' href='#'>×</a>"
            +  "<p>"+data.responseText+"</p>"
            +"</div>";

            $("#message").html(m);
            $("#message").alert();
        }

        });
    }

    navigateToSite = function(e){
        e.preventDefault();
        var site = $(this).attr("netloc");
        window.site = site;
        $("#sites").hide();
        getMessages()
        $("#messages").show();
        $("home").removeClass("active")
        breadcrumb = '<li id="site-breadcrumb" class="active"><a  href="#">'+site+'</a> <span class="divider">/</span></li>'
        $(breadcrumb).appendTo("#breadcrumb");
    }

    navigateHome = function(){
        $("#sites").show();
        $("#messages").hide();
        $("home").addClass("active")
        $("#site-breadcrumb").remove();
    }




    $("#home a").click(navigateHome)
    getSites();
    $("#addsite-form").submit(function(e){
        e.preventDefault();

         dataString = $("#addsite-form").serialize();
         $.ajax({
         type: "POST",
         url: "dashboard/sites",
         data: dataString,
         dataType: "json",
         success: function(data) {

             m = 
             "<div class='alert-message success'>"
             +  "<a class='close' href='#'>×</a>"
             +  "<p>"+data.message+"</p>"
             +"</div>";

             $("#message").html(m);
             $("#message").alert();
             $("#netloc").val("");
             getSites();
             $("#addsite-modal").modal("hide")
         },

         error: function(data) {
             m = 
             "<div class='alert-message error'>"
             +  "<p>"+data.responseText+"</p>"
             +"</div>";

             $("#modal-message").html(m);
         }

         });          

     });
     $("#addmessage-form").submit(function(e){
         e.preventDefault();

          dataString = $("#addmessage-form").serialize();
          $.ajax({
          type: "POST",
          url: "dashboard/sites/"+window.site+"/messages",
          data: dataString,
          dataType: "json",
          success: function(data) {

              m = 
              "<div class='alert-message success'>"
              +  "<a class='close' href='#'>×</a>"
              +  "<p>"+data.message+"</p>"
              +"</div>";

              $("#message").html(m);
              $("#message").alert();
              $("#message-text").val("");
              getMessages();
          },

          error: function(data) {
              m = 
              "<div class='alert-message error'>"
              +  "<p>"+data.responseText+"</p>"
              +"</div>";

              $("#message").html(m);
              $("#message").alert();
            $("#message").alert();
          }

          });          

      });
      
      $("#preview").click(function(e){
          e.preventDefault();
          humane.info($("#message-text").val());
      });
      

     $("#addsite-button").click(function(){
         $("#addsite-form").submit();
     });
});
