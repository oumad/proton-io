const path = require('path')
const fs = require('fs')
const kill = require('tree-kill')
const {dialog,getGlobal} = require('electron').remote
const ipcRenderer = require('electron').ipcRenderer

//get selected Files in explorer
const selectedFiles = getGlobal('selectedFiles') || 'None'
//get current directory in explorer
const currentDir = getGlobal('currentDir').stdout || 'None'
//get returned script name from the menu
const selectedScript = getGlobal('menuReturns').script
//get returned script name from the menu
const myScripts = getGlobal('menuReturns').myScripts
// get the config.json 
const myConfig = getGlobal('myConfig')





//directory of the scripts folder to get from config.json or hardcoded
const scriptsDir = myConfig.scriptsPath || path.join(__dirname,'scripts')
const selectedScriptDir = path.join(scriptsDir,selectedScript)
const scriptFileName = path.join(scriptsDir,selectedScript,myScripts[selectedScript].script)
const scriptJson = path.join(scriptsDir,selectedScript,myConfig.interfaceFile) || path.join(scriptsDir,selectedScript,`interface.json`)

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
function inputSlider(inputName,defaultVal,min,max,tooltip){
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

        //getting script name to execute
        //const scriptFileName =`${__dirname}\\scripts\\sequenceToMp4.py`
        //declaring flags array
        var flags = [];
        if (obj.command != ''){
          flags.push(obj.command)
        }
        if (obj.script != ''){
          flags.push(scriptFileName)
        }


        console.log(scriptFileName)
        let selectedFilesEscaped = []

        for (var f=0;f<selectedFiles.length; f++){
          const selectedFile = selectedFiles[f]
          selectedFilesEscaped.push(selectedFile)
        }
        console.log(selectedFilesEscaped)

        const storedFilePath = path.join(selectedScriptDir,'selectedFiles.txt')
        fs.writeFileSync(storedFilePath, selectedFilesEscaped)
        flags.push(`"${currentDir}"`,storedFilePath)
        console.log(currentDir)
        console.log(selectedFiles)
        $('input,select').not("#debugger-mode input").each(function( index ) {
            const inputValue = $( this ).val()
            if ($( this ).val() != ''){
              flags.push(`"${inputValue}"`)
            }else{
              flags.push('None')
            }
            console.log( index + ": " + `"${inputValue}"`);
        });
        console.log(flags)

        //execute command
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

      $('input,select').not("#debugger-mode input").each(function( index ) {
        //console.log($( this ).val());
        scriptFile.params[index].default = $( this ).val();
      });

      fs.writeFile(scriptJson, JSON.stringify(scriptFile, null, 2), function (err) {
        if (err) return console.log(err);
        console.log(JSON.stringify(scriptFile, null, 2));
        console.log('writing to ' + scriptJson);
        ipcRenderer.send('reload-scripts')
      });
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
}

//defining a global variable for child process
var child;

//Execution function
function myExecute(myProcess,flags){
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