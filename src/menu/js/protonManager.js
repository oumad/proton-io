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

//replace all instances of a string
String.prototype.replaceAll = function(search, replacement) {
    var target = this;
    return target.split(search).join(replacement);
};

$.fn.toggleAttr = function(attr, attr1, attr2) {
  return this.each(function() {
    var self = $(this);
    if (self.attr(attr) == attr1)
      self.attr(attr, attr2);
    else
      self.attr(attr, attr1);
  });
};

//on documents ready
$(function(){
	//when preset is selected
	$("#presets select").on("change",()=>{
		const selectedPresets = $("#presets select").val()
		console.log(selectedPresets)
	})



	//fill the category list and table with the existing categories
	tableSetupCategories()

	//filling the table based on the existing scripts
	tableProtonsFill()

	//fill hotkeys
	setInitialValues()

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
		const selectedProton = $(event.target).attr('proton')
		$(`.${selectedProton}`).hide("drop",{},1000)
		$(`.proton-name.proton-prop.${selectedProton}`).addClass('removed-proton')
	})

	//on save click
	$("#save").on("click",()=>{
		save()
	})
	//on cancel click
	$("#cancel").on("click",()=>{myWindow.close()})


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
	Mousetrap.stopRecord()
	$(event.target).siblings(".hotkey-input").show()
	$(".keyboard-hotkeys-icon").css({"display":"block"})
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
			getTableHotkeys()
		  } else {
		    swal("No proton was deleted")
		    /*
		    .then((ok)=>{
		    	getTableHotkeys()
		    });
		    */
		  }
		});
	}else{
		getTableHotkeys()
	}

	//get all the hotkeys to save in the config
	//getTableHotkeys()
}


function getTableHotkeys(){
	const protonHotkeys = []
	$(".hotkey-input").each(function(){
		if ($(this).text()){
			let hotkeyOptions = {}
			hotkeyOptions.type = $(this).closest(".proton-prop").attr("hotkey")
			hotkeyOptions.protonName = $(this).closest(".proton-prop").attr("protonName")
			hotkeyOptions.hotkey = $(this).text()
			protonHotkeys.push(hotkeyOptions)
		}
		//console.log($(this).text())
	})
	let newConfig = myConfig
	newConfig.protonHotkeys = protonHotkeys
	
	ipcRenderer.send('myConfig-edit',{myConfig : newConfig})


	//console.log(newConfig)
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



//Set config.json values to the DOM
function setInitialValues(){
	for (let i in myConfig.protonHotkeys){
		const protonClass = myConfig.protonHotkeys[i].protonName.replaceAll(" ","_")
		const hotkey = myConfig.protonHotkeys[i].hotkey
		const hotkeyType = myConfig.protonHotkeys[i].type
		console.log(hotkey)
		$(`.proton-${hotkeyType}-hotkey.${protonClass} .hotkey-input`).text(hotkey)
		//console.log(myConfig.protonHotkeys[i])
	}
}
