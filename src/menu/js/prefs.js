const {dialog,getGlobal} = require('electron').remote
const myWindow = require('electron').remote.BrowserWindow.getFocusedWindow();
const ipcRenderer = require('electron').ipcRenderer
const path = require("path")

const myConfig = getGlobal("myConfig")



//initial config.json values
const mainHotkey = myConfig.mainHotkey || "ctrl+tab"
const directKeydown = myConfig.directKeydown || "ctrlKey"
const scriptsPath = myConfig.scriptsPath || path.join(__dirname,"menu","scripts")
const libsPath = myConfig.libsPath || path.join(__dirname,"menu","libs")
const autoLaunch = myConfig.autoLaunch

//Set config.json values to the DOM
function setInitialValues(){
	//set initial values from config.json
	$("#scripts-path input").val(scriptsPath)
	$("#libraries-path input").val(libsPath)
	$(".hotkey-input").text(mainHotkey)
	$("#directKeydown").val(directKeydown)
	$("#startup-launch input").prop("checked",autoLaunch)
}

//what happens when key recording starts
function startRecording(){
	$(".menu-hotkey-recorder").css({"box-shadow":"0px 0px 10px 2px #c18325"})
	$(".keyboard-hotkeys-icon").css({"display":"none"})
	$(".recording").css({"display":"block"})
}

//what happens when key recording stops
function stopRecording(){
	Mousetrap.stopRecord()
	$(".keyboard-hotkeys-icon").css({"display":"block"})
	$(".recording").css({"display":"none"})
	$(".menu-hotkey-recorder").css({"box-shadow":"0px 0px 0px 0px #c18325"})
}



//on documents ready
$(function(){
	setInitialValues()
	//when the keyboard icon is clicked
	$(".keyboard-hotkeys-icon").on('click',(event) =>{
		//show the dom highlights
		startRecording()
		//start capturing the input keys
		recordSequence()
	})

	//when recording icon or text is clicked
	$(".recording").on("click",()=>{
		stopRecording()
	})

	//record user keyboard input for the hotkey
	function recordSequence() {
	    Mousetrap.record(function(sequence) {
	        // sequence is an array like ['ctrl+k', 'c']
	        //alert('You pressed: ' + sequence.join(' '));
	        console.log(sequence)
	        $(".menu-hotkey-recorder .hotkey-input").text(sequence.join(' '))
			stopRecording()
	    });
	}

	//set initial values when revert is clicked
	$("#revert").on("click",()=>{setInitialValues()})
	//close the window when cancel is clicked
	$("#cancel").on("click",()=>{myWindow.close()})

	//Directory user selection
  	$(".directory-input").on('click',(event)=>{
        dialog.showOpenDialog({properties: ['openDirectory']},(selected)=>{
          $(event.target).siblings(".directory-input-field").val(selected[0])//.attr('value',selected[0])
        })
      })

	//send current values to the main process to write them to config.json and restart the app
	$("#save").on("click",()=>{
		//get the values from the DOM objects
		myConfig.mainHotkey = $(".hotkey-input").text()
		myConfig.directKeydown = $("#directKeydown").val()
		myConfig.scriptsPath = $("#scripts-path input").val()
		myConfig.libsPath = $("#libraries-path input").val()
		myConfig.autoLaunch = $("#startup-launch input").prop("checked")

		//send the new myConfig object to the main process
		ipcRenderer.send('myConfig-edit',{myConfig : myConfig})
	})
})
