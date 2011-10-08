(function($) {
	
	// hardcoded variables
	var IMAGES = "wp-content/plugins/threebeats-js/inject/";
	// variables used to auto fadeout popup
    var hideDelay = 2000; // 2000 two seconds delay before hiding popup
	var closeFadeOut = 2000;
    var hideDelayTimer = null;
    var beingShown = false;
    var shown = false;
    var vote = "";
    var rank = "";
    var celebrites = new Array();
    var currentCelebrityName = "";
    var popup_id = "threeBeatsExtPopup";

    
    /*Request parameters*/
    var strUID = '111'; // TODO: REPLACE WITH REAL USER ID: "1" is for Admin, "111" is Anonymous
    var userIP = '';
    
    $.fn.createPopup = function() 
    {
        //Get user ip address
        $.getJSON("http://jsonip.appspot.com?callback=?", function(data)
        {
            userIP =  data.ip;
        });
        
        // creating popup on page and add event listener
        try
        {
            $("#" + popup_id).css("display", "none");
            var divText = $("#" + popup_id).html();
            $("#" + popup_id).html("<div id='trbcom'>" + divText + "</div>");
            
            
            // Auto fadout when mouse is on the popup
            $("#" + popup_id).mouseover(function () 
            {
                if (hideDelayTimer) 
                {
                    clearTimeout(hideDelayTimer);
                }
                if (beingShown || shown) 
                {
                    // don't trigger the  animation again
                    return;
                }
                // avoiding fadeout when mouse is in popup borders
                beingShown = true;
                $("#" + popup_id).fadeIn(500);
                beingShown = false;
                shown = true;
                return false;
            }).mouseout(function() {
                hidePopup(popup_id);
            });

            // "X" (close) button functionality
            $(".threebeats_close_button").click(function() 
            {
                $("#" + popup_id).fadeOut(500, function () 
                {
                		hideDelayTimer = null;
                		shown = false;
               			rank = "";
                        return_to_default();
                });
                return false;
            });

            // show/hide "see what my friends say" section
			$("#threebeats_fb_collapse").click(function () {
				fbExpand();
				return false;
			});
			
            //selecting vote rank
            $(".threebeats_button_m2").click(function () {
                vote = "-2";
                rank = "m2";
            });
            $(".threebeats_button_m1").click(function () {
                vote = "-1";
                rank = "m1";
            });
            $(".threebeats_button_p2").click(function () {
                vote = "+2";
                rank = "p2";
            });
            $(".threebeats_button_p1").click(function () {
                vote = "+1";
                rank = "p1";
            });

           // on submit
            $("#threebeats_rksubmit").click(function () 
            {
                if (rank != "") 
                {
                    var commentText = $('#threebeats_comment_textbox').val();
                    var currentCelebrity = celebrites[currentCelebrityName];
                    if (currentCelebrity.aid == null) 
                    {
                        submitpostnewarticle(commentText, strUID , currentCelebrity.cid, document.location.href, document.title, 'meta meta');
                    }
                    else 
                    {
                    	submitpostoldarticle(commentText, strUID, currentCelebrity.cid, currentCelebrity.aid);
                    }
                }
                else 
                {
                    // this alert checks if user choosed vote rank to avoid votes whithout ranking
                    alert("select rank!");
                }
            });
        }
        catch(e)
        {
            alert(e);
        }
        
    }
    
    $.fn.mymodal = function(options) {
        try 
        {          
            // special variables which are used in plugin
            var h = self.innerHeight || document.body.clientHeight;
            var w = self.innerWidth || document.body.clientWidth;
            var scrollY = 0;
            var linkwidth = this.width();
            var left_offset_position = parseInt(this.offset().left);
            var top_offset_position = this.offset().top;
            var right_offset_position = w - left_offset_position - linkwidth;
            var bottom_offset_position = h - this.offset().top + this.height();

            //default popup position
            var topns = top_offset_position + 20;
            var left = left_offset_position + 80;

            // setting popup position
            if (bottom_offset_position < 400) {
                topns = top_offset_position - 270;
            }
            if (bottom_offset_position < top_offset_position) {
                topns = top_offset_position - 270;
            } else {
                topns = top_offset_position;
            }
            if (right_offset_position < 400) {
                left = w - 490;
            }
            if (bottom_offset_position < 250 && top_offset_position < 250) {
                topns = top_offset_position - 90;
            }

            // setting popup position if window scroll
            $(window).scroll(function () {
                if (typeof window.pageYOffset == "number") {
                    scrollY = window.pageYOffset;
                } else if (document.documentElement && document.documentElement.scrollTop) {
                    scrollY = document.documentElement.scrollTop;
                } else if (document.body && document.body.scrollTop) {
                    scrollY = document.body.scrollTop;
                } else if (window.scrollY) {
                    scrollY = window.scrollY;
                }

                h = self.innerHeight || document.body.clientHeight;
                w = self.innerWidth || document.body.clientWidth;
                h = h + scrollY;
            });

            var parts = $(this).html().split(" ");
            getPopupData(parts[0], parts[1]);
			
            // Auto fadeout when mouse is on the link
            this.mouseover(function (e) {
                if (hideDelayTimer) {
                    clearTimeout(hideDelayTimer);
                }
                if (beingShown || shown) {
                    // don't trigger the  animation again
                    return;
                }
                currentCelebrityName = $(this).html();
                updatePopupData(currentCelebrityName);
               
                topns = e.pageY;
                left = e.pageX;
                if (h - topns < 250) {
                    topns = topns - 250;
                }
                if (w - left < 380) {
                    left = left - 380;
                }

                // showing popup on mouse over the link
                beingShown = true;

                var popup = $("#" + popup_id);
                popup.css({"top":topns,"left":left});
                popup.fadeIn(500);
                beingShown = false;
                shown = true;
                return false;
            }).mouseout(function() 
            {
                hidePopup(popup_id);
            });
        } catch(ex) {
            alert("Injected code exception[jpopup]: " + ex + "\n\n" + ex.stack);
        }
    }

    function hidePopup(popup_id) 
    {
        if (hideDelayTimer) 
        {
            clearTimeout(hideDelayTimer);
        }
        hideDelayTimer = setTimeout(function () 
        {
            //auto fadeout when mose lefts popup borders
            hideDelayTimer = null;
            rank = "";
            shown = false;
            $("#" + popup_id).fadeOut(500, function () {
            	return_to_default();
            });
          }, hideDelay);
        return false;
    }

    //reseting to default view after click "X" or vote or update popup data
    function return_to_default() {
                
        $("#threebeats_mycomment").hide();
        $("#threebeats_middle_area").show();
        $("#threebeats_rank_buttons").show();
        $("#threebeats_submit_buttons").show();
        $("#threebeats_tagline").show();
        $("#threebeats_tagline_thx").hide();

        if (vote != "") {
            $("#threebeats_fb_display_comments").css({"float":"left","padding-right":"0px","position":"relative","top":"0px"});
            $(".threebeats_submitbtn").css("margin-top", "0px");
            vote = "";
        }

        $('#threebeats_comment_textbox').text("");
        $('.threebeats_button_m2').removeAttr("id");
        $('.threebeats_button_m1').removeAttr("id");
        $('.threebeats_button_p2').removeAttr("id");
        $('.threebeats_button_p1').removeAttr("id");

        $('#threebeats_comment_state').hide();
        $('#threebeats_middle_area').show();
        $('#threebeats_comment_textbox').val("Leave your Comment here...");
       
        
        //collapsing "see what my friends say" section
        $("#threebeats_facebook_bg").css('display','none');
        $("#threebeats_fb_collapse").html("See what others are saying <div class='threebeats_sprite'><img class='threebeats_sprites threebeats_expand' src='wp-content/plugins/threebeats-js/inject/images/sprite.png'/>");
    }

    /*This function update popup display data for curent celebrity*/
    function updatePopupData(strCelebrityName)
    {
        return_to_default();
        
        /*Clear freands comment*/
        $('#threebeats_fb_display_comments').empty();
        $('#threebeats_facebook_bg').empty();
        
        var celebrityData = celebrites[strCelebrityName];
        if (!celebrityData) {
            return;
        }

        $('#threebeats_celebURL').attr('href', celebrityData.celebURL);
        $("#threebeats_celebpic").removeAttr('src').attr('src', celebrityData.celebpic);
        
        $(".threebeats_graph_img").attr('src', celebrityData.celebrity_chart);
         
        var strHTML = '';
         
        if (celebrityData.friends != null && celebrityData.friends != "" ) 
        {
           var strFB = '' +
                       '<a id="threebeats_fb_collapse" href="javascript:fbExpand();">' +
                       '   See what others are saying' +
                       '   <div class="threebeats_sprite"><img class="threebeats_sprites threebeats_expand" src="' + IMAGES + 'images/sprite.png"/></div>' +
                       '</a>';
           $('#threebeats_fb_display_comments').empty();    
           $('#threebeats_fb_display_comments').append(strFB);
           //alert('vote1: |' + celebrityData.friends.friend1.vote + '|');
           var strSprite = '';
           switch (celebrityData.friends.friend1.vote) 
           {
               case 0:
                   strSprite = 'threebeats_thumb_m2';
                   break;
               case '+1':
                   strSprite = 'threebeats_thumb_m1';
                   break;
               case '+3':
                   strSprite = 'threebeats_thumb_p1';
                   break;
               case '+4':
                   strSprite = 'threebeats_thumb_p2';
                   break;
           }
           var imagePic;
           if(celebrityData.friends.friend1.pic == null || celebrityData.friends.friend1.pic == "")
                imagePic = IMAGES + "images/defaults_img.png";
           else
                imagePic = celebrityData.friends.friend1.pic;
           
           strHTML += '' +
               '<div class="threebeats_fb_comment_bg">' +
               '       <img id="threebeats_fbpic1" class="threebeats_fb_friend_img" width="50" height="50" src="' + imagePic + '" />';
               if(strSprite != '')
               {
                   strHTML += '' +
                   '       <div class="threebeats_sprite">' +
                   '           <img id="threebeats_fbvote1" class="threebeats_sprites ' + strSprite + '" src="' + IMAGES + 'images/sprite.png" alt="" />' +
                   '       </div>';
               }
                strHTML += '' +
               '       <p class="threebeats_fb_comment_text">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;' +
               '           <span class="threebeats_fb_name" id="threebeats_fbname1">' +
               '               ' + celebrityData.friends.friend1.name +
               '           </span>' +
               '           <span class="threebeats_fb_comment" id="threebeats_fbcomment1">&nbsp;&nbsp;' + celebrityData.friends.friend1.comment + '</span>' +
               '       </p>' +
               '   </div>';
           strSprite = '';
		   //alert('vote2: |' + celebrityData.friends.friend2.vote + '|');
           if (celebrityData.friends.friend2 != null) 
           {
                  
                   switch (celebrityData.friends.friend2.vote) 
                   {
                   case 0:
                       strSprite = 'threebeats_thumb_m2';
                      break;
                   case '+1':
                       strSprite = 'threebeats_thumb_m1';
                       break;
                   case '+3':
                       strSprite = 'threebeats_thumb_p1';
                       break;
                   case '+4':
                       strSprite = 'threebeats_thumb_p2';
                       break;
                   }
                   var imagePic;
                   if(celebrityData.friends.friend2.pic == null || celebrityData.friends.friend2.pic == "")
                        imagePic = IMAGES + "images/defaults_img.png";
                   else
                        imagePic = celebrityData.friends.friend2.pic;
                    strHTML += '' +
                   '   <div class="threebeats_fb_comment_bg">' +
                   '       <img id="threebeats_fbpic1" class="threebeats_fb_friend_img" width="50" height="50" src="' + imagePic + '" />';
                   if(strSprite != '')
                   {
                        strHTML += '' +
                       '       <div class="threebeats_sprite">' +
                       '           <img id="threebeats_fbvote1" class="threebeats_sprites ' + strSprite + '" src="' + IMAGES + 'images/sprite.png" alt="" />' +
                       '       </div>';
                   }
                   strHTML +=  '' +
                   '       <p class="threebeats_fb_comment_text">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;' +
                   '           <span class="threebeats_fb_name" id="threebeats_fbname2">' +
                   '               ' + celebrityData.friends.friend2.name + 
                   '           </span>' +
                   '           <span class="threebeats_fb_comment" id="threebeats_fbcomment1">&nbsp;&nbsp;' + celebrityData.friends.friend2.comment + '</span>' +
                   '       </p>' +
                   '   </div>';
           }
            
           $('#threebeats_facebook_bg').empty();
           $('#threebeats_facebook_bg').append(strHTML);            
        } 
        else 
        {
            //$('.threebeats_submitbtn').css('margin-left', '0px');
        }
        
        $('#threebeats_celebName1').empty();
        $('#threebeats_celebName1').append(strCelebrityName);
        $('#threebeats_celebName2').empty();
        $('#threebeats_celebName2').append(strCelebrityName);
        
    }
    
    /*********************************************
     * This script for cross domain
     ********************************/
    function getPopupData(strCelebFirst, strCelebLast) {
		// Anonymous GET should still retrieve proper images
        var strUserName = ""; // TODO: REPLACE WITH REAL USERNAME
        var strCelebName=strCelebFirst + " " + strCelebLast;
        var strArticleURL = document.location.href;
        var strTags = "cat";
        var strTagmode = "any";
        var strFormat = "json";
        var strJsonCallBack = "?";


        var strGetURL = "http://api.3beats.com/json/get";
        strGetURL += "?uid=" + strUID;
        strGetURL += "&source=st";
        strGetURL += "&ip=" + userIP;
        strGetURL += "&articleURL=" + strArticleURL;
        strGetURL += "&celebfirstName=" + strCelebFirst;
        strGetURL += "&celeblastName=" + strCelebLast;
        strGetURL += "&popup=1";
        strGetURL += "&tags=" + strTags;
        strGetURL += "&tagmode=" + strTagmode;
        strGetURL += "&format=" + strFormat;
        strGetURL += "&jsoncallback=" + strJsonCallBack;

        try {
            $.getJSON(strGetURL,function(objJSON) {
                celebrites[strCelebName] = objJSON; 
                $('#threebeats_myname').text(strUserName + ": ");
            });
        } 
        catch (e) 
        {
            alert(e);        
        }
    }

    /**
     * Submits form for article that does not exist
     */
    function submitpostnewarticle(comment, sUID, sCID, sURL, sTitle, sMeta) {
        var strPostURL = "http://api.3beats.com/json/post";
        strPostURL += "?vote=" + vote;
		strPostURL += "&uid=" + sUID;
		strPostURL += "&ip=" + userIP;
		strPostURL += "&source=" + "st";	// TODO: ADD "FB" FOR NON-ANONYMOUS
        strPostURL += "&cid=" + sCID;
        strPostURL += "&comment=" + comment;
        strPostURL += "&articleURL=" + sURL;
        strPostURL += "&atitle=" + sTitle;
        strPostURL += "&ameta=" + sMeta;
        strPostURL += "&format=json&jsoncallback=?";        
        ShowVote(strPostURL, comment);
    }

    /**
     * Submits form for article that exists
     */

    function submitpostoldarticle(comment, sUID, sCID, sAID) {
        strPostURL = "http://api.3beats.com/json/post";
        strPostURL += "?vote=" + vote; 
		strPostURL += "&uid=" + sUID;
		strPostURL += "&ip=" + userIP;
        strPostURL += "&source=" + "st";	// TODO: ADD "FB" FOR NON-ANONYMOUS
        strPostURL += "&comment=" + comment;
        strPostURL += "&cid=" + sCID;
        strPostURL += "&aid=" + sAID;
        strPostURL += "&format=json&jsoncallback=?";
        ShowVote(strPostURL, comment);
    }

    function ShowVote(strPostURL, comment) 
    {
 		try 
 		{
 			$.getJSON(strPostURL, function(data) {
            	if (data==true)
            	{
            		ShowNoError(comment);
            	}
            	else
            	{
            		ShowError(data.description);
            	}
                setTimeout(function () 
                        {
                            $("#" + popup_id).fadeOut(closeFadeOut, return_to_default);
                            shown = false;
                            rank = "";

                        }, closeFadeOut);
			});
        } 
        catch (e) 
        {
            alert(e);
        }
    }
    
    function ShowNoError(commentText) {
        $("#threebeats_myvote1").attr('class', 'threebeats_mycomm_thumb_' + rank);
        $("#threebeats_comment_state").hide();
        $("#threebeats_middle_area").hide();
        $("#threebeats_rank_buttons").hide();
        $("#threebeats_submit_buttons").hide();
        $("#threebeats_tagline").hide();
        $("#threebeats_tagline_thx").show();
        $("#threebeats_tagline_thx").html("<br /><span style='padding-left:60px'>Thank you for voting!</span>");
        $("#threebeats_tagline_thx").css("font-size", "18px");
        $("#threebeats_fb_display_comments").css({"float":"left","padding-right":"60px","position":"relative","top":"-35px"});
        $("#threebeats_mycomment").show();
        $("#threebeats_mycomment").css("padding-top", "20px");
        $("#threebeats_mycomm_text").css("margin-left", "0px");
        $("#threebeats_myname").css("display", "");
        $("#threebeats_myvote1").css("display", "");
        if (commentText == "Leave your Comment here..." || commentText == "") 
        {
            // this "if" will show "No Comments" if user chooses vote rank and presses "submit" button without typing any comment in the text area
            $("#threebeats_mycomm_text").html("No comment<br /><a id=threebeats_site_title href='" + document.location.href + "'>" + document.title + "</a>");
        }
        else 
        {
            // this "else" will show vote results with vote rank and comment left by user
            $("#threebeats_mycomm_text").html(commentText + "<br /><a id=threebeats_site_title href='" + document.location.href + "'>" + document.title + "</a>");

        }
    }
    
    function ShowError(msg) {
        $("#threebeats_myvote1").attr('class', '');
        $("#threebeats_comment_state").hide();
        $("#threebeats_middle_area").hide();
        $("#threebeats_rank_buttons").hide();
        $("#threebeats_submit_buttons").hide();
        $("#threebeats_tagline").hide();
        $("#threebeats_fb_display_comments").css({"display":"none"}); // "float":"left","padding-right":"60px","position":"relative","top":"-25px"});
        $("#threebeats_mycomment").show();
        $("#threebeats_mycomment").css("padding-top", "45px");                    	
        $("#threebeats_mycomm_text").html(msg + "<br /><a id=threebeats_site_title href='" + document.location.href + "'>" + document.title + "</a>");
        $("#threebeats_myname").css("display", "none");
        $("#threebeats_myvote1").css("display", "none");
        $("#threebeats_mycomm_text").css("margin-left", "-10px");
    }
    
})(jQuery);

// function that removes default text "Leave your comment here ..." when user starts typing
function clear_comment_default() 
{
    var comment_box = document.getElementById('comment_textbox');
    if ($("#threebeats_comment_textbox").val() == "Leave your Comment here...") {
        $("#threebeats_comment_textbox").val("");
    }
}

// opening and collapsing "see what my friends say" section
function fbExpand() 
{
    if (!$("#threebeats_facebook_bg").is(":hidden")) {
       $("#threebeats_facebook_bg").hide();
       $("#threebeats_fb_collapse").html("See what others are saying <div class='threebeats_sprite'><img class='threebeats_sprites threebeats_expand' src='wp-content/plugins/threebeats-js/inject/images/sprite.png'/>");
    } else {
         $("#threebeats_facebook_bg").show();
         $("#threebeats_fb_collapse").html("See what others are saying <div class='threebeats_sprite'><img class='threebeats_sprites threebeats_collapse' src='wp-content/plugins/threebeats-js/inject/images/sprite.png'/>");
    }
}

// voting functional
function tog(btn) 
{
    $('.threebeats_button_m2').removeAttr("id");
    $('.threebeats_button_m1').removeAttr("id");
    $('.threebeats_button_p2').removeAttr("id");
    $('.threebeats_button_p1').removeAttr("id");
    if (!$("#threebeats_middle_area").is(":hidden")) {
        $('#threebeats_comment_state').show();
        $('#threebeats_middle_area').hide();
        $('#threebeats_comment_textbox').text("");
        $('#threebeats_comment_textbox').text("Leave your Comment here...");
        $('#threebeats_comment_textbox').focus();

    }
	//add id for button vote
    $('.threebeats_button_' + btn).attr('id', 'threebeats_current_rank_' + btn);
}
