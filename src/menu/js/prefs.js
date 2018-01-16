const {getGlobal} = require('electron').remote
const path = require("path")
const myConfig = getGlobal("myConfig")

//initial myConfig velues 

const scriptsPath = myConfig.scriptsPath || path.join(__dirname,"menu","scripts")
const libsPath = myConfig.libsPath || path.join(__dirname,"menu","libs")
const mainHotkey = myConfig.mainHotkey || "ctrl+tab"
const directKeydown = myConfig.directKeydown || "ctrlKey"

function setInitialValues(){
	//set initial values from config.json
	$("#scripts-path input").val(scriptsPath)
	$("#libraries-path input").val(libsPath)
	$(".hotkey-input").text(mainHotkey)
	$("#directKeydown").val(directKeydown)
}

$(function(){
	setInitialValues()
	//when the keyboard icon is clicked
	$(".keyboard-hotkeys-icon").on('click',(event) =>{
		//console.log($(event.target).siblings(".hotkey-input").text("yayy"))
		//const hotkeyField = $(event.target).siblings(".hotkey-input")
		recordSequence()
		$(".menu-hotkey-recorder").css({"box-shadow":"0px 0px 10px 2px #c18325"})
	})

	//record user keyboard input for the hotkey
	function recordSequence() {
	    Mousetrap.record(function(sequence) {
	        // sequence is an array like ['ctrl+k', 'c']
	        //alert('You pressed: ' + sequence.join(' '));
	        console.log(sequence)
	        $(".menu-hotkey-recorder .hotkey-input").text(sequence.join(' '))
	        $(".menu-hotkey-recorder").css({"box-shadow":"0px 0px 0px 0px #c18325"})
	    });
	}
})

