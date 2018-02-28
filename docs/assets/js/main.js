$(function(){
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
	

})