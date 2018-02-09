const {dialog,getGlobal} = require('electron').remote
const BrowserWindow = require('electron').remote.BrowserWindow
const myWindow = BrowserWindow.getFocusedWindow()
const ipcRenderer = require('electron').ipcRenderer
const path = require("path")
const fs = require("fs")
const url = require('url')
import swal from 'sweetalert';

const myConfig = getGlobal("myConfig")
const myScripts = getGlobal("afterScriptsLoad").myScripts



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
		if($("#proton-type select").val() == "direct"){
			buildDirectProton()
		}else{
			buildParametricProton()
		}

	})

	//when new parameter is created
	$("#parameter-creation-icon").on("click",()=>{
		const inputType = $("#parameter-type").val()
		newParameter(inputType,null)
	})

	//initialize sortable() for parameters
	$("#builder-parameteric-specific").sortable({
		handle: ".parameter-move"
	})

	//autoComplete existing protons
	$("#proton-name input").autocomplete({
		source: Object.keys(myScripts),
		select: function(event,ui){
			selectedExistingProton(ui.item.value)
		}
	})

	//preview command
	$("#interface-preview").on("click",previewInterface)
	//command params window
	$("#command-preview").on("click",previewCommand)

	//command params window
	$("#inputs-clear").on("click",inputsClear)
})

//Build direct execution proton
function buildDirectProton(){
	const protonName = $("#proton-name input").val()
	const category = $("#proton-category input").val() || "MISC"
	const getDir = $("#proton-getDir input").is(":checked")
	const getSel = $("#proton-getSel input").is(":checked")
	const command = $("#proton-command input").val()

	if (protonName != ''){
		const protonPath = path.join(protonsPath,protonName)
		const interfacePath = path.join(protonPath,interfaceName)

		let interfaceObj = {}

		//Assign name
		interfaceObj.category = category
		interfaceObj.process = 'start ""'
		interfaceObj.command = command
		interfaceObj.getDir = getDir
		interfaceObj.getSel = getSel
		interfaceObj.params = []

		if (!fs.existsSync(protonPath)){
			fs.mkdirSync(protonPath);
			protonCreateAndReload(interfacePath,interfaceObj)
		}else{
			swal({
			  title: "Are you sure?",
			  text: "You are about to override an existing proton, 'ok' to confirm.",
			  icon: "warning",
			  buttons: true,
			  dangerMode: true,
			})
			.then((willDelete) => {
			  if (willDelete) {
					protonCreateAndReload(interfacePath,interfaceObj)
			  } else {
			    swal("Proton creation was canceled");
			  }
			});

			/*
		  modal("Warning !",warningMessage, 
		  	function(){
		  		protonCreateAndReload(interfacePath,interfaceObj)
		  	}, function(){
					return
		  	}
	  	)
*/
		}
	}else{
		swal({
		  title: "Failed to create script",
		  text: "Proton name needs to be specified !",
		  icon: "error",
		});
	  //modal("Failed to create script !","Proton name needs to be specified",)
	}



}

//Create or modify the interface json
function protonCreateAndReload(interfacePath,interfaceObj){
	fs.writeFile(interfacePath, JSON.stringify(interfaceObj, null, 2), function(err) {
	    if(err) {
  			swal({
				  title: "Something went wrong :(",
				  text: err,
				  icon: "error",
				});
	    } else {
	    	swal({
				  title: "The new proton was saved here :",
				  text: interfacePath,
				  icon: "success",
				  button: "Okay!",
				});
	    	//send message to reload scripts
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



//when new parameter is added
function newParameter(inputType,param){
	//parameters container
 	const containerId = $("#builder-parameteric-specific");

 	//Common dom elements
 	const inputContainer = $("<div>").addClass(`${inputType} parameter`).attr('input-type',inputType)
 	const navContainer = $("<div>").addClass(`parameter-nav`)
 	containerId.append(inputContainer)
 	inputContainer.append(navContainer)
 	navContainer.append($("<div>").addClass(`parameter-title`).text(inputType))
 	navContainer.append($("<span>").addClass(`parameter-remove ui-icon ui-icon-trash`)
 			.attr('title','Remove the paramter')
	 		.on("click",()=>{
	 			inputContainer.remove()
	 		})
 		)
 	navContainer.append($("<span>").addClass(`parameter-move ui-icon ui-icon-arrowthick-2-n-s`)
 			.attr('title','Click and drag to move the parameter and change its order')
 		)
 	navContainer.append($("<span>").addClass(`parameter-revert ui-icon ui-icon-arrowreturnthick-1-w`)
 			.attr('title','Revert back to the old values')
 			.on("click", ()=>{
 				if(!null){
 					fillParametricProtonInputs(param,inputContainer)
 				}
 			})
 		)

 	//Constructing the object list based on the parameter type
 	let inputs = [
			{type:'text',name:"name",description:"The label of this parameter"}
			]
	if(inputType == "inputColor"){
		inputs.push({type:'color',name:"default",description:"The default color for this parameter"})
	}else if (inputType == "inputList"){
		inputs.push({type:'text',name:"list",description:"add list values separated by a comma ','"},
			{type:'text',name:"default",description:"The default value for this parameter"})
	}else if (inputType == "inputSlider"){
		inputs.push({type:'text',name:"min",description:"minimum slider value"},
			{type:'text',name:"max",description:"maximum slider value"},
			{type:'text',name:"step",description:"the step in which the slider value will increment, default is 1"},
			{type:'text',name:"default",description:"The default slider value for this parameter"})
	}else if (inputType == "inputCheckbox"){
		inputs.push({type:'checkbox',name:"default",description:"The default checkbox state for this parameter"})
	}
	else{
		inputs.push({type:'text',name:"default",description:"The default value for this parameter"})
	}
	inputs.push({type:'text',name:"tooltip",description:"The description of the parameter that appears when the cursor is on the label"})

	//create the inputs based on the given object list
	for (var i in inputs){
		const inputItem = $("<div>").addClass("input-item").addClass(`${inputs[i].name}-input`)
		inputContainer.append(inputItem)
		inputItem.append($("<div>").addClass("label").text(inputs[i].name).attr('title',inputs[i].description))
		inputItem.append($("<input>").attr("type",inputs[i].type))
	}

	//refresh the sortable function to accept the new elements
	$("#builder-parameteric-specific").sortable( "refresh" );

	//return the inpurContainer variable
	return inputContainer
}


//function to build the parametric proton
function buildParametricProton(){
	//making interface json obj
	let interfaceObj = getParametricValuesAsObj()
	//get proton name
	const protonName = $("#proton-name input").val()
	//check if user has given a proton name
	if (protonName != ''){
		//get proton path and name
		const protonPath = path.join(protonsPath,protonName)
		const interfacePath = path.join(protonPath,interfaceName)

		if (!fs.existsSync(protonPath)){
			fs.mkdirSync(protonPath);
			protonCreateAndReload(interfacePath,interfaceObj)
		}else{
			swal({
			  title: "Are you sure?",
			  text: "You are about to override an existing proton, 'ok' to confirm.",
			  icon: "warning",
			  buttons: true,
			  dangerMode: true,
			})
			.then((willDelete) => {
			  if (willDelete) {
					protonCreateAndReload(interfacePath,interfaceObj)
			  } else {
			    swal("Proton creation was canceled");
			  }
			});

		}
	}else{
		swal({
		  title: "Failed to create script",
		  text: "Proton name needs to be specified !",
		  icon: "error",
		});
	}

}

//when selecting an existing proton with proton name input autocomplete
function selectedExistingProton(selectedProton){
	//fill values
	$("#proton-category input").val(myScripts[selectedProton].category)
	$("#proton-getDir input").prop('checked',myScripts[selectedProton].getDir)
	$("#proton-getSel input").prop('checked',myScripts[selectedProton].getSel)
	$("#proton-command input").val(myScripts[selectedProton].command)
	$("#proton-script input").val(myScripts[selectedProton].script)
	$("#proton-process input").val(myScripts[selectedProton].process)
	$("#proton-author input").val(myScripts[selectedProton].author)
	$("#proton-description textarea").val(myScripts[selectedProton].description)

	if(myScripts[selectedProton].params == ''){
		console.log(`${selectedProton} is direct`)
		$('#proton-type select option[value=direct]').prop('selected', true)
		$("#proton-type select").trigger("change")
	}else{
		console.log(`${selectedProton} is parametric`)
		$('#proton-type select option[value=parametric]').prop('selected', true)
		$("#proton-type select").trigger("change")
		retrieveParametricProtonInputs(myScripts[selectedProton])
	}
}

//retrieve existing proton parameters
function retrieveParametricProtonInputs(interfaceObj){

	$("#builder-parameteric-specific").empty()
	for (var i in interfaceObj.params){
		const paramContainer = newParameter(interfaceObj.params[i].type,interfaceObj.params[i])
		fillParametricProtonInputs(interfaceObj.params[i],paramContainer)
		if(interfaceObj.params[i].type == "inputCheckbox"){
			paramContainer.find(`.default-input input`).prop('checked', interfaceObj.params[i].default)
		}
	}
}

//fill existing values for the retrieved proton parameters
function fillParametricProtonInputs(param,paramContainer){
	$.each( param , function( key, value ) {
	  	paramContainer.find(`.${key}-input input`).val(value)
	})
}

//get all values as an obj
function getDirectValuesAsObj(){
	let interfaceObj = {}

	interfaceObj.category = $("#proton-category input").val() || "MISC"
	interfaceObj.process = 'start ""'
	interfaceObj.command = $("#proton-command input").val() 
	interfaceObj.getDir = $("#proton-getDir input").is(":checked")
	interfaceObj.getSel = $("#proton-getSel input").is(":checked")
	interfaceObj.params = []

	return interfaceObj
}

//get all values as an obj
function getParametricValuesAsObj(){
	let interfaceObj = {}

	interfaceObj.author = $("#proton-author input").val()
	interfaceObj.description = $("#proton-description textarea").val()
	interfaceObj.version = "0.0.1"
	interfaceObj.category = $("#proton-category input").val() || "MISC"
	interfaceObj.process = $("#proton-process input").val() 
	interfaceObj.script = $("#proton-script input").val() 
	interfaceObj.getDir = $("#proton-getDir input").is(":checked")
	interfaceObj.getSel = $("#proton-getSel input").is(":checked")
	interfaceObj.params = []

	//getting values from each parameter
	$(".parameter").each((index, value)=>{
		let paramObj = {}

		paramObj.type = $(value).attr('input-type')
		paramObj.name = $(value).find(".name-input input").val()

		if (paramObj.type == "inputList"){
			paramObj.list = $(value).find(".list-input input").val().split(",")
			paramObj.default = $(value).find(".default-input input").val()
		}else if (paramObj.type == "inputSlider"){
			paramObj.min = parseFloat($(value).find(".min-input input").val())
			paramObj.max = parseFloat($(value).find(".max-input input").val())
			paramObj.default = parseFloat($(value).find(".default-input input").val())
			paramObj.step = parseFloat($(value).find(".step-input input").val()) || 1
		}else if (paramObj.type == "inputCheckbox"){
			paramObj.default = $(value).find(".default-input input").is(":checked")
		}else{
			paramObj.default = $(value).find(".default-input input").val()
		}
		paramObj.tooltip = $(value).find(".tooltip-input input").val()

		//console.log(paramObj)
		interfaceObj.params.push(paramObj)
	})

	return interfaceObj
}

//forming the command line for the direct proton
function myDirectCommand(interfaceObj){
  // execute the script directly using the command in the interface.json without building a window
  let myArgs = []
  //append command if exist
  if (interfaceObj.command != ''){
    myArgs.push(interfaceObj.command)
  }
  //check if interface requests Directory
  if (interfaceObj.getDir){
    myArgs.push("<current-dir>")
  }
  //check if interface requests selection
  if (interfaceObj.getSel){
    myArgs.push("<selectedFiles.txt>")
  }

  //make arges a continious string separated by space
  const commandLine = myArgs.join(" ")
  //prepare all the command line content
  const modalContent = `start "" ${commandLine}`
  //show modal dialog
  swal("Command preview", modalContent);
}


//forming the command line for parametric proton
function myParametricCommand(interfaceObj){
  // execute the script directly using the command in the interface.json without building a window
  let myArgs = []
  //append command if exist
  if (interfaceObj.script != ''){
    myArgs.push(interfaceObj.script)
  }
  //check if interface requests Directory
  if (interfaceObj.getDir){
    myArgs.push("<current-dir>")
  }
  //check if interface requests selection
  if (interfaceObj.getSel){
    myArgs.push("<selectedFiles.txt>")
  }
  for (var param in interfaceObj.params){
  	myArgs.push(interfaceObj.params[param].default)
  }
  //make arges a continious string separated by space
  const commandLine = myArgs.join(" ")
  //get process
  const myProcess = interfaceObj.process || 'start ""'
  //prepare all the command line content
	const modalContent = `${myProcess} ${commandLine}`
	//show the dialog
  swal("Command preview", modalContent);
}

//command preview
function previewCommand(){
	//detect which proton type
	const selectedType = $("#proton-type select").val()
	if(selectedType == "direct"){
		const interfaceObj = getDirectValuesAsObj()
		myDirectCommand(interfaceObj)
	}else{
		const interfaceObj = getParametricValuesAsObj()
		myParametricCommand(interfaceObj)
	}
}


//parameter preview window
function paramsWindowPreview(paramsNum){
    const secondWindowWidth = 560;
    const secondWindowHeight = (30*paramsNum) + 110;
    let secondWindow = new BrowserWindow({
      width:secondWindowWidth,
      height:secondWindowHeight,
      frame:false,
      icon : path.join(__dirname,"menu","icons",'logo_30px.png')
    })

    secondWindow.loadURL(url.format({
      pathname : path.join(__dirname,"menu",'parameters.html'),
      protocol : 'file',
      slashes : true
    }));
}

//interface preview
function previewInterface(){
	const selectedScript = $("#proton-name input").val()
	var newScripts = myScripts
	newScripts[selectedScript] = getParametricValuesAsObj()

	ipcRenderer.send('menu-open',{script : selectedScript , myScripts : newScripts})
	const paramsNum = newScripts[selectedScript].params.length

	paramsWindowPreview(paramsNum)
}

//clear all inputs
function inputsClear(){
	//clear parametric inputs
	$("#builder-parameteric-specific").empty()
	//clear all text fields fields
	$("input,textarea").val("")
}