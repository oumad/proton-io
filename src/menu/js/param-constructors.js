import swal from 'sweetalert';

const path = require('path');
const fs = require('fs');
const kill = require('tree-kill');
const electron = require('electron');

const { dialog, getGlobal } = electron.remote;
const ipcRenderer = electron.ipcRenderer;


// get selected Files in explorer
const selectedFiles = getGlobal('selectedFiles') || 'None';
// get current directory in explorer
const currentDir = getGlobal('currentDir').stdout || 'None';
// get returned script name from the menu
const selectedScript = getGlobal('menuReturns').script;
// get returned script name from the menu
const myScripts = getGlobal('menuReturns').myScripts;
// get the config.json
const myConfig = getGlobal('myConfig');

// directory of the scripts folder to get from config.json or hardcoded
const scriptsDir = myConfig.scriptsPath || path.join(__dirname,'scripts')
const selectedScriptDir = path.join(scriptsDir,selectedScript)
const scriptFileName = path.join(scriptsDir,selectedScript,myScripts[selectedScript].script)
const scriptJson = path.join(scriptsDir,selectedScript,myConfig.interfaceFile) || path.join(scriptsDir,selectedScript,`interface.json`)
const libsPath = myConfig.libsPath || path.join(__dirname,'libs')
const pythonExe = path.join(libsPath,'python/python.exe')
const parallelDirs = myConfig.parallelDirs || false

String.prototype.replaceAll = function(search, replacement) {
    var target = this;
    return target.split(search).join(replacement);
};


//Baisc value input field
function inputField(inputName,inputContent,tooltip){
  const inputNameNoSpace = inputName.replaceAll(' ','-')
  $('#parameters-container').append(
    $('<div>').addClass(`input-group`).attr('id',inputNameNoSpace)
  );
    $(`#${inputNameNoSpace}`).append(
      $('<label>')
      .attr('for',inputNameNoSpace)
      .attr('title',tooltip)
      .text(inputName));
    $(`#${inputNameNoSpace}`).append(
      $('<input>')
      .attr('name',inputNameNoSpace)
      .attr('type','text')
      .attr('value',inputContent))
}

//checkbox
function inputCheckbox(inputName,inputContent,tooltip){
  const inputNameNoSpace = inputName.replaceAll(' ','-')
  $('#parameters-container').append(
    $('<div>').addClass(`checkbox-group`).attr('id',inputNameNoSpace)
  );
    $(`#${inputNameNoSpace}`).append(
      $('<label>')
      .attr('for',inputNameNoSpace)
      .attr('title',tooltip)
      .text(inputName));

    $(`#${inputNameNoSpace}`).append(
      $('<input>')
      .attr('name',inputNameNoSpace)
      .attr('type','checkbox')
      .attr('value', inputContent)
      .prop('checked', inputContent)
      .change(function() {
        // this will contain a reference to the checkbox
        if (this.checked) {
            $(this).attr('value', 'true')
        } else {
            $(this).attr('value', 'false')
        }
      })
    )
}

// input with possibility to choose a file path
function inputFilePath(inputName,defaultVal,tooltip){
  const inputNameNoSpace = inputName.replaceAll(' ','-')
  $('#parameters-container').append(
    $('<div>').addClass(`input-group`).attr('id',inputNameNoSpace)
  );
    $(`#${inputNameNoSpace}`).append(
      $('<label>')
      .attr('for',inputNameNoSpace)
      .attr('title',tooltip)
      .text(inputName));
    $(`#${inputNameNoSpace}`).append(
      $('<input>')
      .attr('name',inputNameNoSpace)
      .attr('type','text')
      .attr('value',defaultVal))

    $(`#${inputNameNoSpace}`).append(
      $('<div>')
      .addClass('file-input')
      .append($('<span>').addClass('ui-icon ui-icon-document'))
      .on('click',()=>{
        dialog.showOpenDialog({properties: ['openFile']},(selected)=>{
          $(`#${inputNameNoSpace} input`).attr('value',selected[0])
        })
      })
    )
}


// input with possibility to choose a file path
function inputDirectory(inputName,defaultVal,tooltip){
  const inputNameNoSpace = inputName.replaceAll(' ','-')
  $('#parameters-container').append(
    $('<div>').addClass(`input-group`).attr('id',inputNameNoSpace)
  );
    $(`#${inputNameNoSpace}`).append(
      $('<label>')
      .attr('for',inputNameNoSpace)
      .attr('title',tooltip)
      .text(inputName));
    $(`#${inputNameNoSpace}`).append(
      $('<input>')
      .attr('name',inputNameNoSpace)
      .attr('type','text')
      .attr('value',defaultVal))

    $(`#${inputNameNoSpace}`).append(
      $('<div>')
      .addClass('file-input')
      .append($('<span>').addClass('ui-icon ui-icon-folder-open').css('color','white'))
      .on('click',()=>{
        dialog.showOpenDialog({properties: ['openDirectory']},(selected)=>{
          $(`#${inputNameNoSpace} input`).attr('value',selected[0])
        })
      })
    )
}

// list of choices element
function inputList(listName,defaultVal,list,tooltip){
  const inputNameNoSpace = listName.replaceAll(' ','-')
  $('#parameters-container').append(
    $('<div>').addClass(`list-group`).attr('id',inputNameNoSpace)
  );
    $(`#${inputNameNoSpace}`).append(
      $('<label>')
      .attr('for',inputNameNoSpace)
      .attr('title',tooltip)
      .text(listName));
      $(`#${inputNameNoSpace}`).append(
        $('<select>')
        .attr('name',inputNameNoSpace))

      let i=0;
      for (i=0; i < list.length; i++ ){
          $(`#${inputNameNoSpace} select`).append(
            $('<option>')
            .text(list[i])
            .val(list[i].split(' ')[0]))
      }
      $(`#${inputNameNoSpace} select`).val(defaultVal);

}

//Slider with value input
function inputSlider(inputName,defaultVal,min,max,step,tooltip){
  const inputNameNoSpace = inputName.replaceAll(' ','-')
  $('#parameters-container').append(
    $('<div>').addClass(`slider-group`).attr('id',inputNameNoSpace)
  );
  $(`#${inputNameNoSpace}`).append(
    $('<label>')
    .attr('for',inputNameNoSpace)
    .attr('title',tooltip)
    .text(inputName));
  $(`#${inputNameNoSpace}`).append(
      $('<input>')
      .attr('name',inputNameNoSpace)
      .attr('value',defaultVal))
  $(`#${inputNameNoSpace}`).append(
      $('<div>')
      .addClass('slider').slider({
        min: min,
        max: max,
        range: "min",
        value: defaultVal,
        step: step || 1,
        slide:function( event, ui ) {
          $(`#${inputNameNoSpace} input`).val(ui.value);
        }
      })
    )
  $(`#${inputNameNoSpace} input`).on('change',()=>{
    $(`#${inputNameNoSpace} .slider`).slider('value',$(`#${inputNameNoSpace} input`).val())
  });

}

//color input
function InputColor(inputName,defaultVal,tooltip){
  const inputNameNoSpace = inputName.replaceAll(' ','-')
  $('#parameters-container').append(
    $('<div>').addClass(`color-group`).attr('id',inputNameNoSpace)
  );
    $(`#${inputNameNoSpace}`).append(
      $('<label>')
      .attr('for',inputNameNoSpace)
      .attr('title',tooltip)
      .text(inputName));
    $(`#${inputNameNoSpace}`).append(
      $('<input>')
      .attr('name',inputNameNoSpace)
      .attr('type','color')
      .attr('value',defaultVal))
}

//apply button construction and click event
function apply(obj){
  $('#parameters-container').append(
    $('<div>').attr('id','end-buttons').append(
      $('<div>').attr('id','apply').text('apply').button()
      .on('click',()=>{

        //declaring flags array
        const flags = buildCommandFromInput(obj)

        myExecute(obj.process,flags)

        //window.close();
        if ($('#debugger-mode input').prop("checked")){
          $("#debugger-wrap").css("display","block")
          //window.close();
        }
      })
    )
  )
}

//save button construction and click event
function save(){
  $('#end-buttons').append(
    $('<div>').attr('id','save').text('save').button()
    .on('click',()=>{
      //const currentValue = $(`#${inputNameNoSpace} input`).attr('value')
      //const scriptFileName = `${scriptsDir}\\${selectedScript}`
      var scriptFile = require(scriptJson);
      var defaultVals = []
      $('input,select').not("#debugger-mode input").each(function( index ) {
        //console.log($( this ).val());
        scriptFile.params[index].default = $( this ).val();
        defaultVals.push($( this ).val())
      });
      //modal to input preset name
      swal({
        text: 'Preset name:',
        content: "input",
        button: {
          text: "Save preset",
          //closeModal: false,
        },
      })
      .then(name => {
        if (!name) throw null;
        //update presets in object
        scriptFile.presets.push({
          name : name,
          values : defaultVals
        })
        //update script file
        fs.writeFile(scriptJson, JSON.stringify(scriptFile, null, 2), function (err) {
          if (err) return console.log(err);

          console.log(JSON.stringify(scriptFile, null, 2));
          swal("Updated script presets",scriptJson, "success", {
            button: "Ok!",
          });
          //console.log('writing to ' + scriptJson);
          ipcRenderer.send('reload-scripts')

        });
      })

    })
  )
}

//cancel button construction and click event
function cancel(){
  $('#end-buttons').append(
    $('<div>').attr('id','cancel').text('cancel').button()
    .on('click',()=>{
      window.close();
      }
    )
  )
}

//debugger builder
function scriptDebugger() {
  //debugger dom construction
  $('#parameters-container').append($('<div>').attr('id','end-options'))

    $('#end-options').append(
      $('<div>').addClass("end-options").attr('id','debugger-mode').append(
      $('<label>')
      .attr('for',"debugger-box")
      .attr('title',"check this if you want to display the debug window")
      .text("Debugger")
    )
  )

  $('#debugger-mode').append(
    $('<input>')
    .attr('name',"debugger-box")
    .attr('type','checkbox')
    .prop('checked', false)
    )

  //debugger events
  $("#debugger-close").on('click',()=>{$("#debugger-wrap").css("display","none")})
  $("#debugger-clear").on('click',()=>{$("#debugger-output").empty()})
  $("#debugger-mode label").on('click',()=>{$("#debugger-wrap").css("display","block")})
  $("#debugger-preview").on('click',()=>{
    const flags = buildCommandFromInput(myScripts[selectedScript]).join(" ")
    const command = `${myScripts[selectedScript].process} ${flags}`
    $("#debugger-output").append(`<span class="internal-stdout">${command}<span/><br>`)
  })
}

//defining a global variable for child process
var child;

//Execution function
function myExecute(myProcess,flags){
  if(myProcess == 'python'){
    myProcess = pythonExe
  }

  //execute with debugger output
  outputExecution(myProcess,flags)
  // kill the child process when the button stop is pressed
  $("#debugger-stop").on('click',()=>{
    $("#debugger-output").append(`<span class="internal-stdout">Attempting to kill the process..<span/><br>`)
      kill(child.pid);
  })

  $("#debugger-start-detached").on('click',()=>{
    //detached execution
    const childDetached = require('child_process').spawn(myProcess, flags,{shell:true,detached:true,windowsVerbatimArguments: true});
  })
  $("#debugger-restart").on('click',()=>{
    //execution with output
    outputExecution(myProcess,flags)
  })
}


//function to execute the command and receive outputs for the debugger
function outputExecution(myProcess,flags){
  //display loader
  $(".loader").css({"display":"block"})
  //execute the command
  child = require('child_process').spawn(myProcess, flags,{shell:true,windowsVerbatimArguments: true});
  //Get output
  child.stdout.on('data', function (data) {
    $("#debugger-output").append(`<span class="stdout">${data}<span/><br>`)
  });
  child.stderr.on('data', function (data) {
    $("#debugger-output").append(`<span class="stderr">${data}<span/><br>`)
  });
  //when command is closed (Finished or crashed or stopped)
  child.on('close', function (code) {
    $("#debugger-output").append('Process was ended with code : ' + code)
    //hide loader
    $(".loader").css({"display":"none"})
    //check if code is successful
    if(code == 0 && !$('#debugger-mode input').prop("checked")){
      window.close();
    }else{
      $("#debugger-wrap").css("display","block")
    }
  });
}

//Get the command from user input
function buildCommandFromInput(obj){

  //declaring flags array
  let flags = [];

  if (obj.command != ''){
    flags.push(obj.command)
  }

  if (obj.script != ''){
    //check if it's a path
    if(obj.script.indexOf('\\') > -1 || obj.script.indexOf('/') > -1 ){
      //using an external execution
      flags.push(`"${scriptFileName}"`)
    }else{
      //using internal script
      flags.push(`"${scriptFileName}"`)
    }
  }

  if (obj.getDir){
    flags.push(`"${currentDir}"`)
  }

  //add selected files list if enabled in the interface
  if (obj.getSel){
    let selectedFilesEscaped = []

    for (var f=0;f<selectedFiles.length; f++){
      const selectedFile = selectedFiles[f]
      if (selectedFile.includes(currentDir) || parallelDirs) {
        selectedFilesEscaped.push(selectedFile)
      }
    }
    console.log(selectedFilesEscaped)

    const storedFilePath = path.join(selectedScriptDir,'selectedFiles.txt')
    fs.writeFileSync(storedFilePath, selectedFilesEscaped)
    flags.push(storedFilePath)
  }


  //getting user inputs
  $('input,select').not("#debugger-mode input").each(function( index ) {
      const inputValue = $( this ).val()
      if ($( this ).val() != ''){
        flags.push(`"${inputValue}"`)
      }else{
        flags.push('None')
      }
      console.log( index + ": " + `"${inputValue}"`);
  });
  return flags
}
