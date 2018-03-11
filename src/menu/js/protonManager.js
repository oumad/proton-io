const {dialog,getGlobal} = require('electron').remote
const BrowserWindow = require('electron').remote.BrowserWindow
const ipcRenderer = require('electron').ipcRenderer
const path = require("path")
const fs = require("fs")
const url = require('url')
const rimraf = require('rimraf');
import swal from 'sweetalert';

const myConfig = getGlobal("myConfig")
const myScripts = getGlobal("afterScriptsLoad").myScripts

//initial config.json values
const protonsPath = myConfig.scriptsPath || path.join(__dirname,"menu","scripts")
const libsPath = myConfig.libsPath || path.join(__dirname,"menu","libs")
const interfaceName = "interface.json"



//on documents ready
$(function(){

	//fill Presets
	loadPresets()

	//when preset is selected
	$("#manager-presets select").on("change",()=>{
		const selectedPresets = $("#manager-presets select").val()
		if(selectedPresets == 'load'){
			//bring up dialog to choose the preset
			dialog.showOpenDialog({
				properties: ['openFile'],
				filters : [{name: ' Manager Presets', extensions: ['json']}],
			},(selected)=>{
				if(selected){
					//get the name of the preset
					const presetName = path.parse(selected[0]).name
					//read the preset file as an object
					const presetObj = JSON.parse(fs.readFileSync(selected[0], 'utf8'))
					//change interface values based on the preset
					setTableValues(presetObj.protonHotkeys,presetObj.disabledProtons)
					//add preset option name
					$("#manager-presets select").append(
						$("<option>").attr("value",presetName).text(presetName)
						)
					//set preset option as selected
					$("#manager-presets select").val(presetName)
				}
	        })
		}else if(selectedPresets == 'user_defined'){
			setTableValues(myConfig.protonHotkeys,presetObj.disabledProtons)
		}else{
			const presetFileName = selectedPresets.replaceAll(" ","_") + ".json"
			const presetObj = JSON.parse(fs.readFileSync(path.join(__dirname,"presets",presetFileName), 'utf8'))
			//change interface values based on the preset
			setTableValues(presetObj.protonHotkeys,presetObj.disabledProtons)
		}
	})



	//fill the category list and table with the existing categories
	tableSetupCategories()

	//filling the table based on the existing scripts
	tableProtonsFill()

	//fill hotkeys
	setTableValues(myConfig.protonHotkeys,myConfig.disabledProtons)

	//search and filter
	$("#proton-search input").on("keyup", function() {
	    let value = $(this).val().toLowerCase();
	    $("#manager-table .proton-prop").filter(function() {
	      $(this).toggle($(this).attr("proton").toLowerCase().indexOf(value) > -1)
    	});
    });

	//hide and show protons when category name is clicked
	$(".table-category.proton-name").on("click",(event)=>{
		const selectedCategory = $(event.target).attr('category')
		if($(`.${selectedCategory}-proton`).css('display') == "block"){
			$(`.${selectedCategory}-proton`).hide()
			$(`#proton-name .${selectedCategory} span`).toggleClass("ui-icon-caret-1-s ui-icon-caret-1-e")
		}else{
			$(`.${selectedCategory}-proton`).show()
			$(`#proton-name .${selectedCategory} span`).toggleClass("ui-icon-caret-1-e ui-icon-caret-1-s")
		}
	})

	//remove proton when X is clicked
	$(".proton-remove.proton-prop").on("click",(event)=>{
		//get proton class name
		const selectedProton = $(event.target).attr('proton')

		//switch state
		if($(`.proton-name.proton-prop.${selectedProton}`).hasClass('removed-proton')){
			$(`.${selectedProton}`).css("background","none")
			$(`.proton-name.proton-prop.${selectedProton}`).removeClass('removed-proton')
		}else{
			$(`.${selectedProton}`).css("background","#671212")
			$(`.proton-name.proton-prop.${selectedProton}`).addClass('removed-proton')
		}
	})

	//on save click
	$("#save").on("click",save)
	//on cancel click
	$("#cancel").on("click",()=>{myWindow.close()})

	//on save preset
	$("#preset-save").on("click",managerPresetSave)
	//on Clear all
	$("#clear-table").on("click",clearTableValues)



	//when the keyboard icon is clicked
	$(".keyboard-hotkeys-icon").on('click',(event) =>{
		//show the dom highlights
		startRecording(event)
		//start capturing the input keys
		recordSequence(event)
	})
	$(".recording").on("click",(event)=>{
		stopRecording(event)
	})


})




//what happens when key recording starts
function startRecording(event){
	$(event.target).closest(".hotkey-recorder").css({"box-shadow":"0px 0px 10px 2px #c18325"})
	$(event.target).css({"display":"none"})
	$(event.target).siblings(".recording").css({"display":"block"})
	$(event.target).siblings(".hotkey-input").hide()
}

//what happens when key recording stops
function stopRecording(event){
	console.log(event.target)
	Mousetrap.stopRecord()

	if($(event.target).hasClass("recording")){
		$(event.target).siblings(".keyboard-hotkeys-icon").css({"display":"block"})
	}else{
		$(event.target).css({"display":"block"})
	}
	$(event.target).siblings(".hotkey-input").show()
	$(event.target).siblings(".keyboard-hotkeys-icon").css({"display":"block"})

	$(".recording").css({"display":"none"})
	$(".hotkey-recorder").css({"box-shadow":"0px 0px 0px 0px #c18325"})
}


//record user keyboard input for the hotkey
function recordSequence(event) {
    Mousetrap.record(function(sequence) {
        // sequence is an array like ['ctrl+k', 'c']
        //alert('You pressed: ' + sequence.join(' '));
        console.log(sequence)
        $(event.target).siblings(".hotkey-input").text(sequence.join(' '))
		stopRecording(event)
    });
}


//get sortable categories
function getSorted(obj,prop){
	let array = []

	$.each( obj , function( key, value ) {
		array.push(value[prop])
	})

	return array.sort()
}

//remove dusplicates
function uniq(a) {
   return Array.from(new Set(a));
}


function filterArray(array) {
    var index = -1,
        arr_length = array ? array.length : 0,
        resIndex = -1,
        result = [];

    while (++index < arr_length) {
        var value = array[index];

        if (value) {
            result[++resIndex] = value;
        }
    }

    return result;
}



function save(){
	let deletedListContainer = $("<div>").addClass("removed-list").append(
			$("<div>").addClass("removed-list-info").text("You can uncheck the ones you don't want to delete")
			)
	let deleteProtons = []
	//get hotkeys
	let tableHotkeys = getTableHotkeys()
	let disabledProtons = getDisabledProtons()
	$(".removed-proton").each(function(){
		deleteProtons.push($(this).text())
		const removedProton = $(this).text()

		deletedListContainer.append(
			$("<div>").addClass(`removed-proton-check`).attr("id",removedProton).append(
				$("<input>").attr({type:"checkbox",value:removedProton}).prop("checked",true),
				$("<div>").addClass("checkbox-label").text(removedProton)
				)
			)
	})


	if (deleteProtons != ''){
		swal({
		title:"You're about to delete these protons permanently",
		content: deletedListContainer[0],
		icon: "warning",
		buttons: true,
		dangerMode: true
		})
		.then((willDelete) => {
		  if (willDelete) {
			console.log("protons deleted")
			//This will also save the hotkeys
			deleteConfirmedProtons(tableHotkeys,disabledProtons)
		  } else {
		    swal("No proton was deleted")
		  }
		});
	}else{
		updateConfig(tableHotkeys,disabledProtons)
	}
}


function updateConfig(protonHotkeys,disabledProtons){
	let newConfig = myConfig
	newConfig["protonHotkeys"] = protonHotkeys
	newConfig["managerPreset"] = $("#manager-presets select").val()
	newConfig["disabledProtons"] = disabledProtons
	ipcRenderer.send('myConfig-edit',{myConfig : newConfig})
}

function getTableHotkeys(){
	const tableHotkeys = []
	$(".hotkey-input").each(function(){
		if ($(this).text() && $(this).text() != "n/a"){
			let hotkeyOptions = {}
			hotkeyOptions.type = $(this).closest(".proton-prop").attr("hotkey")
			hotkeyOptions.protonName = $(this).closest(".proton-prop").attr("protonName")
			hotkeyOptions.hotkey = $(this).text()
			tableHotkeys.push(hotkeyOptions)
		}
		//console.log($(this).text())
	})
	return tableHotkeys
}

function getDisabledProtons(){
	const disabledProtons = []

	$(".proton-enable").each(function(){
		if($(this).find("input").prop("checked") == false){
			disabledProtons.push($(this).attr("proton"))
		}
	})
	//console.log(tableSettings)
	return disabledProtons
}


function tableSetupCategories(){
	//fill the category list and table with the existing categories
	const sortedUniqueCategories = filterArray(uniq(getSorted(myScripts,"category")))

	for (let i in sortedUniqueCategories){
		const categoryValue = sortedUniqueCategories[i].replaceAll(" ","_")

		//category list
		$("#proton-categories select").append(
			$("<option>").attr("value",categoryValue).text(sortedUniqueCategories[i])
			)

		//table
		$("#proton-name .table-content").append(
			$("<div>").addClass(`proton-name table-row table-category ${categoryValue} ${categoryValue}-cat`)
			.text(sortedUniqueCategories[i])
			.attr("category",categoryValue)
			.prepend(
				$("<span>").addClass("ui-icon ui-icon-caret-1-s")
				)
			)
		$("#proton-enable .table-content").append(
			$("<div>").addClass(`proton-enable table-row table-category ${categoryValue} ${categoryValue}-cat`)
			)
		$("#proton-param-hotkey .table-content").append(
			$("<div>").addClass(`proton-param-hotkey table-row table-category ${categoryValue} ${categoryValue}-cat`)
			)
		$("#proton-direct-hotkey .table-content").append(
			$("<div>").addClass(`proton-direct-hotkey table-row table-category ${categoryValue} ${categoryValue}-cat`)
			)
		$("#proton-remove .table-content").append(
			$("<div>").addClass(`proton-remove table-row table-category ${categoryValue} ${categoryValue}-cat`)
			)
	}

	//when preset is selected
	$("#proton-categories select").on("change",()=>{
		const selectedCategory = $("#proton-categories select").val()
		const selectedCategoryValue = selectedCategory.replaceAll(" ","_")
		//console.log(selectedCategoryValue,sortedUniqueCategories)
		for(let cat in sortedUniqueCategories){
			const categoryValue = sortedUniqueCategories[cat].replaceAll(" ","_")

			if (categoryValue != selectedCategoryValue && selectedCategoryValue != "All"){
				console.log(`to be hidden : ${categoryValue}`)
				$(`.${categoryValue}`).hide()
				$(`.${categoryValue}-proton`).hide()
			}else{
				console.log(`to reveal : ${categoryValue}`)
				$(`.${categoryValue}`).show()
				$(`.${categoryValue}-proton`).show()
			}
		}
	})
}

//filling the table based on the existing scripts
function tableProtonsFill(){
	$.each( myScripts , function( key, value ) {
		let categoryClass
		if(value.category !== undefined && value.category){
			categoryClass = value.category.replaceAll(' ',"_")
		}else{
			categoryClass = "MISC"
		}

		const protonClass = key.replaceAll(" ","_")


		$(`#proton-name .table-content .${categoryClass}`).after(
			$("<div>").addClass(`proton-name table-row proton-prop ${protonClass} ${categoryClass}-proton`)
			.attr("title",value.description)
			.text(key)
			.attr("proton",protonClass)
			//.attr('state','available')
			)
		$(`#proton-enable .table-content .${categoryClass}`).after(
			$("<div>").addClass(`proton-enable table-row proton-prop ${protonClass} ${categoryClass}-proton`)
			.attr("proton",protonClass)
			.append($("<input>").attr("type","checkbox").prop("checked",true))
			)
		$(`#proton-param-hotkey .table-content .${categoryClass}`).after(
			$("<div>").addClass(`proton-param-hotkey table-row proton-prop ${protonClass} ${categoryClass}-proton`)
			.attr({"proton":protonClass,"hotkey":"param","protonName":key})
			.append(
				//$("<input>").attr("type","text")
				$("<div>").addClass("menu-hotkey-recorder hotkey-recorder")
				.append(
					$("<div>").attr("contenteditable","true").addClass("hotkey-input"),
					$("<div>").addClass("keyboard-hotkeys-icon"),
					$("<div>").addClass("keyboard-recording-icon recording"),
					$("<div>").addClass("keyboard-recording-text recording").html("Stop key<br>Recording")
					)
				)
			)
		$(`#proton-direct-hotkey .table-content .${categoryClass}`).after(
			$("<div>").addClass(`proton-direct-hotkey table-row proton-prop ${protonClass} ${categoryClass}-proton`)
			.attr({"proton":protonClass,"hotkey":"direct","protonName":key})
			.append(
				//$("<input>").attr("type","text")
				$("<div>").addClass("menu-hotkey-recorder hotkey-recorder")
				.append(
					$("<div>").attr("contenteditable","true").addClass("hotkey-input"),
					$("<div>").addClass("keyboard-hotkeys-icon"),
					$("<div>").addClass("keyboard-recording-icon recording"),
					$("<div>").addClass("keyboard-recording-text recording").html("Stop key<br>Recording")
					)
				)
			)
		$(`#proton-remove .table-content .${categoryClass}`).after(
			$("<div>").addClass(`proton-remove table-row proton-prop ${protonClass} ${categoryClass}-proton`)
			.text("X")
			.attr("proton",protonClass)
			)

		if(value.params.length == 0){
			$(`.proton-param-hotkey.${protonClass} .hotkey-input`)
				.attr("contenteditable","false")
				.text("n/a")
			$(`.proton-param-hotkey.${protonClass} .keyboard-hotkeys-icon`).hide()
		}
	})
}

//sortable function
function sortTableElements(){
	$('#proton-name .table-content').sortable({
	    placeholder: "ui-state-highlight",
	    cancel: ".table-category",
	    revert: true,
	    update: function( event, ui ){
			//var index = ui.item.attr('id').replace('key', '');
			const regExp1 = /(\S+)(-proton|-cat)(?=\s|$)/g
			const regExp2 = /(\S+)(-proton|-cat)(?=\s|$)/g

			const currentMatch = regExp1.exec(ui.item.attr("class"))[1]
			const prevMatch = regExp2.exec(ui.item.prev().attr("class"))[1]

			console.log(`current : ${currentMatch} \n above : ${prevMatch}`)

			const protonClass = ui.item.attr("proton")
			const previousProtonClass = ui.item.prev().attr("proton")

			const replacedClasses = ["proton-enable","proton-param-hotkey","proton-direct-hotkey","proton-remove "]

			if(currentMatch == prevMatch){
				$(this).sortable("cancel")
			}else{
				ui.item.toggleClass(`${currentMatch}-proton ${prevMatch}-proton`)
				for (let c in replacedClasses){
					console.log(replacedClasses[c],previousProtonClass,protonClass)
					$(`.${replacedClasses[c]}.${previousProtonClass}`).after($(`.${replacedClasses[c]}.${protonClass}`))
					$(`.${replacedClasses[c]}.${protonClass}`).toggleClass(`${currentMatch}-proton ${prevMatch}-proton`)
				}
			}
	    }
  	});
}



function clearTableValues(){
	$(".hotkey-input").each(function(){
		if ($(this).text() && $(this).text() != "n/a"){
			$(this).text("")
		}
		//console.log($(this).text())
	})
}

//Set config.json values to the DOM
function setTableValues(protonHotkeys,disabledProtons){
	clearTableValues()

	for (let i in disabledProtons){
		const protonClass = disabledProtons[i].replaceAll(" ","_")
		$(`.proton-enable.${protonClass} input`).prop("checked",false)
	}


	for (let i in protonHotkeys){
		const protonClass = protonHotkeys[i].protonName.replaceAll(" ","_")
		const hotkey = protonHotkeys[i].hotkey
		const hotkeyType = protonHotkeys[i].type
		$(`.proton-${hotkeyType}-hotkey.${protonClass} .hotkey-input`).text(hotkey)
	}
}


//delete the checked scripts after confirmation
function deleteConfirmedProtons(tableHotkeys){
	const deletedPaths = []

	$(".removed-proton-check input").each(function(){
			if($(this).prop("checked")){
				deletedPaths.push(path.join(protonsPath,$(this).val()))
				const protonClass = $(this).val().replaceAll(" ","_")
				$(`.${protonClass}`).remove()
			}
		})
	deleteDirs(deletedPaths, function(err){
		  if (err) {
		    console.log(err);
		  } else {
		  	updateConfig(tableHotkeys)
		    console.log('all dirs removed');
		  }
	})
}



//Save preset
function managerPresetSave(){
	swal({
		text: 'Give a name to your preset',
		content: "input",
		button: {
			text: "Save Preset",
		},
	}).then(name => {
		if (name){
			console.log(name)
			const presetFullName = `${name}.json`
			let tableHotkeys = getTableHotkeys()
			let presetObj = {"protonHotkeys":tableHotkeys}
			const presetPath = path.join(__dirname,"presets",presetFullName)


			fs.writeFile(presetPath, JSON.stringify(presetObj, null, 2), function (err) {
				if (err) {
					console.log(err);
				}else{
					loadPresets()
					swal("Preset was successfully saved here!", presetPath, "success");
				}

			});
		}else{
			swal("No preset was saved","You need to give the preset a name to be saved", "info");
		}

	})
}


function loadPresets(){
	fs.readdir(path.join(__dirname,"presets"), (err, files) => {
		if (err) {
			alert(`could not load presets because : \n ${err}`)
		}else{
			$("#manager-presets .custom-option").remove()
			files.forEach(file => {
				const presetName = path.parse(file).name.replaceAll(" ","_")

				$("#manager-presets .default-option")
					.after($("<option>").addClass("custom-option").attr("value",presetName).text(presetName))
			});
			$("#manager-presets select").val(myConfig.managerPreset)
		}
	})
}



//directory delete function
function deleteDirs(dirs, callback){
  var i = dirs.length;
  dirs.forEach(function(dirPath){
	const path = ""
  	rimraf(dirPath, function (err) {
		i--;
		if (err) {
			callback(err);
			return;
		} else if (i <= 0) {
			callback(null);
		}
  	});
  });
}

//replace all instances of a string
String.prototype.replaceAll = function(search, replacement) {
    var target = this;
    return target.split(search).join(replacement);
};

//get all directories from a path
function getDirectories(path) {
  return fs.readdirSync(path).filter(function (file) {
    return fs.statSync(path+'/'+file).isDirectory();
  });
}

$.fn.toggleAttr = function(attr, attr1, attr2) {
  return this.each(function() {
    var self = $(this);
    if (self.attr(attr) == attr1)
      self.attr(attr, attr2);
    else
      self.attr(attr, attr1);
  });
};
