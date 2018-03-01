$(function(){
	//on documentation click
	$("#documentation").on("click",function(){
		$(".page-two").css({
			"display": "block"
		})
		$(".page-two").velocity({
			left:["0%","100%"]
		},{
			//display the page befor moving it in
			begin:function(){
				$(".page-two").css({
					"display": "block"
				})
			}
		});
		$(".page-one").velocity({
			left:["-100%","0"]
		});
		$("footer ul").css({
			"justify-content": "left"
		})
	})

	//on logo click
	$(".top-logo").on("click",function(){
		$(".page-one").velocity({
			left:["0%","-100"]
		})

		$(".page-two").velocity({
			left:["100%","0"]
		},{
			//hide the page after moving it in
			complete:function(){
				$(".page-two").css({
					"display": "none"
				})
			}
		})
		$("footer ul").css({
			"justify-content": "center"
		})
	})

	const currentUrl = window.location.href
	const anchor = currentUrl.substring(currentUrl.indexOf("#")+1)
	//Go to documentation directly
	if(anchor == "documentation"){
		$("#documentation").trigger("click")
	}

	//on about click
	$("#about").on("click",function(){
		$(".overlay").css({display:"block"})
		$(".about").velocity({
			top:["0%","100%"]
		})
		$(".overlay").velocity({
			opacity:["1","0"]
		})
	})

	//on about click
	$("#about").on("click",function(){
		$(".overlay").css({display:"block"})
		$(".about").velocity({
			top:["0%","100%"]
		})
		$(".overlay").velocity({
			opacity:["1","0"]
		})
	})
	
	//on overlay click
	$(".overlay").on("click",function(){
		$(".overlay").velocity({
			opacity:["0","1"]
		},{
    /* Log all the animated divs. */
    	complete: function(elements) { $(".overlay").css({display:"none"})}
		})
		$(".about").velocity({
			top:["100%","0%"]
		})
	})

})



function openInNewTab(url) {
  var win = window.open(url, '_blank');
  win.focus();
}
