window.onmessage = function(event){
// in iFrame
// window.postMessage('{"id":"123","transactionTime":"","directionAsString":"GTW -> VIC","productName":"Anytime Single - Adult","ShortCode":""}', '*');
  
    console.log("received:"+event.data);
               
    // event.data is a JSON string
    if(event.data != null) {
               var ticket = jQuery.parseJSON(event.data);

               var storedTickets = localStorage.getItem("ticketsHistory");
        var allTickets = [];
               
               console.log("stored: "+storedTickets);
               if (storedTickets) {
                   allTickets = JSON.parse(storedTickets);
                   numItems = allTickets.length;
                   allTickets.push(ticket);
               } else {
                   allTickets.push(ticket);
               }
               
               localStorage.setItem("ticketsHistory", JSON.stringify(allTickets));
    }
};

function onBodyLoad() {
    //$.mobile.ajaxEnabled = true;
    //document.addEventListener("deviceready", onDeviceReady, false);
}

//function onDeviceReady()
//{
//}

function showEmbeddedPage( urlObj, options, redirect ) {
    console.log("URL:" + urlObj.href);
    console.log("Redirect:" + redirect);
    var userAgent = navigator.userAgent.toLowerCase();
    $.browser.chrome = /chrome/.test(navigator.userAgent.toLowerCase());
    var version = 0;
    
    // Is this a version of Chrome?
    if($.browser.chrome){
        userAgent = userAgent.substring(userAgent.indexOf('chrome/') +7);
        userAgent = userAgent.substring(0,userAgent.indexOf('.'));	
        version = userAgent;
        // If it is chrome then jQuery thinks it's safari so we have to tell it it isn't
        $.browser.safari = false;
        useDataType = 'jsonp';
    } else
        useDataType = '';
    
    // Is this a version of Mozilla?
	if($.browser.mozilla){
		//Is it Firefox?
		if(navigator.userAgent.toLowerCase().indexOf('firefox') != -1){
			userAgent = userAgent.substring(userAgent.indexOf('firefox/') +8);
			userAgent = userAgent.substring(0,userAgent.indexOf('.'));
			version = userAgent;
			useDataType = 'jsonp';
		}
	}

    $.ajax({
           type: "HEAD",
           url: redirect,
           crossDomain:true,
           timeout:3000,
           //async: false,
           dataType: useDataType,
           
           success: function(data){
           		console.log("success");
                console.log(data); // data is what comes back from your remote file
                var $page = $( "#iframepage" );
                var $content = $page.children( ":jqmData(role=content)" );
                var src = "<iframe src='" + redirect + "' width='100%' frameborder='0' id='embedsrv'></iframe>";
                $content.html( src );
                $page.page();
                options.dataUrl = urlObj.href;
                $.mobile.changePage( $page, options );
    
                var wh = parseInt($(window).height());
                $('iframe').css("height", wh);
           },
           
           error: function(jqXHR, textStatus, errorThrown){
           console.log("error");
                console.log(jqXHR.status + "\n" + errorThrown);
           if(jqXHR.status == 200) {
           var $page = $( "#iframepage" );
           var $content = $page.children( ":jqmData(role=content)" );
           var src = "<iframe src='" + redirect + "' width='100%' frameborder='0' id='embedsrv'></iframe>";
           $content.html( src );
           $page.page();
           options.dataUrl = urlObj.href;
           $.mobile.changePage( $page, options );
           
           var wh = parseInt($(window).height());
           $('iframe').css("height", wh);
           } else {
           
                var $page = $( "#noconnpage" );
                var $content = $page.children( ":jqmData(role=content)" );
                var btnhtml = "<a href='"+ urlObj.href +"' data-role='button' data-icon='refresh'>Try it again</a>";
                $content.find( "#tryagain" ).html( btnhtml );
                $page.page();
                $content.find( ":jqmData(role=button)" ).button();
                options.dataUrl = urlObj.href;
                $.mobile.changePage( $page, options );
           }
           }
    });
}

function showTickets( urlObj, options ) {
    var $page = $( "#ticketspage" );
    var $header = $page.children( ":jqmData(role=header)" );
    var $content = $page.children( ":jqmData(role=content)" );
    var markup;
    var numItems;
    
    var storedTickets = localStorage.getItem("ticketsHistory");
    var allTickets;
    
    markup = "<ul data-role='listview'>";
    
    if (storedTickets) {
        allTickets = JSON.parse(storedTickets);
        numItems = allTickets.length;
        
        for (var i=numItems-1; i>-1; i--) {
            markup += "<li><a href='#detail?id=" + i + "'>"+allTickets[i].productName;
            markup += "</a><div class='buyinfo'>" + allTickets[i].transactionTime+"</div></li>";
        }
        
    } 
//    else {
//        numItems = ticketsData.length;
//        for ( var it in ticketsData ) {
//            markup += "<li><a href='#detail?id=" + ticketsData[it].id + "'>"+ticketsData[it].productName;
//            markup += "</a><div class='buyinfo'>" + ticketsData[it].transactionTime+"</div></li>";
//        }
//    }
    
    markup += "</ul>";
    
    if (numItems > 0) {
        markup += "<div class='clearHistory'><a href='"+ urlObj.href +"' data-role='button' data-icon='delete' data-theme='c' onclick='return clearHistory();' >Clear History</a>";
        markup += "</div>";
    }

    $content.html( markup );
    $page.page();
    
    $content.find( ":jqmData(role=listview)" ).listview();
    $content.find( ":jqmData(role=button)" ).button();
    
    if ($header.find( "#refreshBtn" ).hasClass("ui-btn-active")) {
        $header.find( "#refreshBtn" ).removeClass( $.mobile.activeBtnClass );
    }

    
    options.dataUrl = urlObj.href;
    $.mobile.changePage( $page, options );
}

function clearHistory() {
    var storedTickets = localStorage.getItem("ticketsHistory");
    var backupTickets = localStorage.getItem("ticketsHistoryBack");
    var currentTickets = [];
    var allStoredTickets = [];
    currentTickets = JSON.parse(storedTickets);
    
    if(backupTickets) {
        allStoredTickets = JSON.parse(backupTickets);
        $.merge( allStoredTickets, currentTickets);
    } else {
        allStoredTickets = currentTickets;
    }
    
    localStorage.setItem("ticketsHistoryBack",  JSON.stringify(allStoredTickets));
    localStorage.removeItem("ticketsHistory");
    return true;
}

function restoreHistory() {
    var storedTickets = localStorage.getItem("ticketsHistory");
    var backupTickets = localStorage.getItem("ticketsHistoryBack");
    var currentTickets = [];
    var allStoredTickets = [];
    
    if (storedTickets)
        currentTickets = JSON.parse(storedTickets);
    
    if(backupTickets) {
        allStoredTickets = JSON.parse(backupTickets);
        $.merge( allStoredTickets, currentTickets);
    } else {
        allStoredTickets = currentTickets;
    }
    
    localStorage.setItem("ticketsHistory",  JSON.stringify(allStoredTickets));
    localStorage.removeItem("ticketsHistoryBack");

    return true;
}

function showTicketDetails( urlObj, options ) {
    var ticketID =  decodeURIComponent(urlObj.hash.replace( /.*id=/, "" ));
    
    var storedTickets = localStorage.getItem("ticketsHistory");
    var allTickets;
    
    if (storedTickets) {
        allTickets = JSON.parse(storedTickets);
        ticket = allTickets[ ticketID ];
    } else {
        ticket = ticketsData[ ticketID ];
    }
    
    pageSelector = urlObj.hash.replace( /\?.*$/, "" );
	if ( ticket ) {
		var $page = $( pageSelector );
        var $header = $page.children( ":jqmData(role=header)" );
        var $content = $page.children( ":jqmData(role=content)" );
        
        if(ticket.directionAsString) {
        switch (ticket.directionAsString) {
        case "GTW -> VIC":
                ticket.description = "From Gatwick to Victoria";
                break;
                
            case "GTW -> VIC (RTN)":
                ticket.description = "From Gatwick to Victoria (Return)";
                break;
                
            case "VIC -> GTW":
                ticket.description = "From Victoria to Gatwick";
                break;
            case "VIC -> GTW (RTN)":
                ticket.description = "From Victoria to Gatwick (Return)";
                break;
                
            default:
                ticket.description = "N.A.";
        }
        }
        var markup = "<p><em>" + ticket.productName + "</em></p>" + ticket.description + "</p><p>Valid from: " + ticket.transactionTime + "</p>";
        markup+="<div class='details'><div class='barcode'><img src='http://m.m-gex.com/cbs/b/"+ticket.ShortCode+"' /></div></div>";

		$header.find( "h1" ).html( ticket.productName );
		$content.html( markup );

		$page.page();
		options.dataUrl = urlObj.href;
		$.mobile.changePage( $page, options );

	}
}

var ticketsData = {   
463143: {
id: "463143",
productName: "Anytime Single - Adult",
description: "From Gatwick to Victoria",
transactionTime: "14/04/2012 14:02:47",
ShortCode:"l-6LmyuAfLU"
},
    
463142: {
id: "463142",
productName: "Anytime Single - Adult",
description: "From Gatwick to Victoria",
transactionTime: "15/04/2012 08:10:44",
ShortCode:"nrSPP_UMDeY"
},
    
463109: {
id: "463109",
productName: "First Class Anytime Return - Adult",
description: "From Victoria to Gatwick",
transactionTime: "16/04/2012 12:45:58",
ShortCode:"BBWjb3KZclA"
},
    
};


$(document).bind( "pagebeforechange", function( e, data ) {
        if ( typeof data.toPage === "string" ) {
            var u = $.mobile.path.parseUrl( data.toPage );
                 
            var ticket = /^#ticketspage/;
            var detail = /^#detail/;
            var gatwick = /^#gatwickpage/;
            var victoria = /^#victoriapage/;
            var infopage = /^#infopage/;
            var portal = /^#portalpage/;
            
            // http://m.m-gex.com/gatwickexpress/home.jsf
            if ( u.hash.search(gatwick) !== -1 ) {
                 redirect = "http://10.65.3.150:8080/gatwickexpress/tickettypes.jsf?direction=true";
                 showEmbeddedPage( u, data.options, redirect );
                 e.preventDefault();
            } else if ( u.hash.search(victoria) !== -1 ) {
                 redirect = "http://10.65.3.150:8080/gatwickexpress/tickettypes.jsf?direction=false";
                 showEmbeddedPage( u, data.options, redirect );
                 e.preventDefault();
            } else if ( u.hash.search(infopage) !== -1 ) {
                 redirect = "http://www.gatwickexpress.com/mobile/live-flight-info/";
                 showEmbeddedPage( u, data.options, redirect );
                 e.preventDefault();
            } else if ( u.hash.search(portal) !== -1 ) {
                 redirect = "http://www.gatwickexpress.com/mobile/";
                 showEmbeddedPage( u, data.options, redirect );
                 e.preventDefault();
            } else if ( u.hash.search(ticket) !== -1 ) {
                 showTickets( u, data.options );
                 e.preventDefault();
            } else if ( u.hash.search(detail) !== -1 ) {                 
                 showTicketDetails( u, data.options );
                 e.preventDefault();
            }
        }
});

