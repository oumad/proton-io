const {dialog,getGlobal} = require('electron').remote
const myWindow = require('electron').remote.BrowserWindow.getFocusedWindow()
const ipcRenderer = require('electron').ipcRenderer
const path = require("path")
const fs = require("fs")

const myConfig = getGlobal("myConfig")



//initial config.json values 
const protonsPath = myConfig.scriptsPath || path.join(__dirname,"menu","scripts")
const libsPath = myConfig.libsPath || path.join(__dirname,"menu","libs")
const interfaceName = "interface.json"


//on documents ready
$(function(){
	//when proton type is selected
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

	//when save is clicked
	$("#save").on("click",()=>{
		const protonName = $("#proton-name input").val()
		const category = $("#proton-category input").val() || "MISC"
		const getDir = $("#proton-getDir input").is(":checked")
		const getSel = $("#proton-getSel input").is(":checked")
		const command = $("#proton-command input").val()


		buildDirectProton(protonName,category, getDir, getSel, command)
	})

	//when new parameter is created
	$("#parameter-creation-icon").on("click",()=>{
		const inputType = $("#parameter-type").val()
		newParameter(inputType)
	})
})

function buildDirectProton(protonName,category, getDir, getSel, command){

	const protonPath = path.join(protonsPath,protonName)
	const interfacePath = path.join(protonPath,interfaceName)

	let interfaceObj = {}

	//Assign name
	interfaceObj.category = category
	interfaceObj.process = "start"
	interfaceObj.command = command
	interfaceObj.getDir = getDir
	interfaceObj.getSel = getSel
	interfaceObj.params = []

	if (!fs.existsSync(protonPath)){
		fs.mkdirSync(protonPath);
		protonCreateAndReload(interfacePath,interfaceObj)
	}else{
		protonCreateAndReload(interfacePath,interfaceObj)
	}

}


function protonCreateAndReload(interfacePath,interfaceObj){
	fs.writeFile(interfacePath, JSON.stringify(interfaceObj, null, 2), function(err) {
	    if(err) {
	        alert(err);
	    } else {
	        alert(`The new proton was saved here : ${interfacePath}`);
			ipcRenderer.send('reload-scripts')
	    }
	})
}


/*
//attempt to do OOP
 class Input{
 	constructor (name,default,description,type){
 		this.name = name;
 		this.default = default;
 		this.description = description;
 		this.type = type;
 	}

 	field(){

 	}
 }
 */


function newParameter(inputType){
 	const containerId = $("#builder-parameteric-specific");
 	const inputContainer = $("<div>").addClass(`${inputType} parameter`)
 	const navContainer = $("<div>").addClass(`parameter-nav`)
 	containerId.append(inputContainer)
 	inputContainer.append(navContainer)
 	navContainer.append($("<div>").addClass(`parameter-title`).text(inputType))
 	navContainer.append($("<span>").addClass(`parameter-remove ui-icon ui-icon-trash`))
 	navContainer.append($("<span>").addClass(`parameter-move ui-icon ui-icon-arrow-4-diag`))
 	navContainer.append($("<span>").addClass(`parameter-revert ui-icon ui-icon-arrowreturnthick-1-w`))

 	let inputs = [
			{type:'text',name:"name"}
			]

	if(inputType == "inputColor"){
		inputs.push({type:'color',name:"default"})
	}else if (inputType == "inputList"){
		inputs.push({type:'text',name:"list"},{type:'text',name:"default"})
	}else if (inputType == "inputSlider"){
		inputs.push({type:'text',name:"min"},{type:'text',name:"max"},{type:'text',name:"default"})
	}
	else{
		inputs.push({type:'text',name:"default"})
	}

	inputs.push({type:'text',name:"tooltip"})

	for (var i in inputs){
		//console.log(inputs[i])
		const inputItem = $("<div>").addClass("input-item").addClass(`${inputs[i].name}-input`)
		inputContainer.append(inputItem)
		inputItem.append($("<div>").addClass("label").text(inputs[i].name))
		inputItem.append($("<input>").attr("type",inputs[i].type))
	}
}