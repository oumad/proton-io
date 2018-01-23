const {dialog,getGlobal} = require('electron').remote
const myWindow = require('electron').remote.BrowserWindow.getFocusedWindow();
const ipcRenderer = require('electron').ipcRenderer
const path = require("path")

const myConfig = getGlobal("myConfig")



//initial config.json values 
//const mainHotkey = myConfig.mainHotkey || "ctrl+tab"
//const directKeydown = myConfig.directKeydown || "ctrlKey"
const protonsPath = myConfig.scriptsPath || path.join(__dirname,"menu","scripts")
const libsPath = myConfig.libsPath || path.join(__dirname,"menu","libs")
const interfaceName = "interface.json"


//on documents ready
$(function(){

	$("#proton-type select").on("change",()=>{
		const selectedType = $("#proton-type select").val()
		if(selectedType == "direct"){
			$("#builder-parameteric").css("display","none")
			$("#builder-direct").css("display","block")
		}else{
			$("#builder-parameteric").css("display","block")
			$("#builder-direct").css("display","none")
		}
	})

})

function buildDirectProton(protonName, getDir, getSel, command){

	const protonPath = path.join(protonsPath,protonName)
	const interfacePath = path.join(protonPath,interfaceName)
}

