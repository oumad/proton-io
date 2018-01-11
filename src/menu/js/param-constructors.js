const {dialog,getGlobal} = require('electron').remote
//get selected Files in explorer
const selectedFiles = getGlobal('selectedFiles') || 'None'
//get current directory in explorer
const currentDir = getGlobal('currentDir').stdout || 'None'
//get returned script name from the menu
const selectedScript = getGlobal('menuReturns').script
//get returned script name from the menu
const myScripts = getGlobal('menuReturns').myScripts
const path = require('path')
const fs = require('fs')

//directory of the scripts folder
const scriptsDir = path.join(__dirname,'scripts')
const selectedScriptDir = path.join(scriptsDir,selectedScript)
const scriptFileName = path.join(scriptsDir,selectedScript,myScripts[selectedScript].script)
const scriptJson = path.join(scriptsDir,selectedScript,`interface.json`)

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

      var i=0;
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

//
function apply(obj){
  $('#parameters-container').append(
    $('<div>').attr('id','end-buttons').append(
      $('<div>').attr('id','apply').text('apply').button()
      .on('click',()=>{

        //getting script name to execute
        //const scriptFileName =`${__dirname}\\scripts\\sequenceToMp4.py`
        //declaring flags array
        var flags = [];
        if (obj.script != ''){
          flags.push(scriptFileName)
        }
        if (obj.command != ''){
          flags.push(obj.command)
        }

        console.log(scriptFileName)
        var selectedFilesEscaped = []

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
        if (!$('#debugger-mode input').prop("checked")){
          window.close();
        }else{
          $("#debugger-wrap").css("display","block")
        }
      })
    )
  )
}

function save(){
  $('#end-buttons').append(
    $('<div>').attr('id','save').text('save').button()
    .on('click',()=>{
      //const currentValue = $(`#${inputNameNoSpace} input`).attr('value')
      //const scriptFileName = `${scriptsDir}\\${selectedScript}`
      var scriptFile = require(scriptJson);

      $('input,select').each(function( index ) {
        //console.log($( this ).val());
        scriptFile.params[index].default = $( this ).val();
      });

      fs.writeFile(scriptJson, JSON.stringify(scriptFile, null, 2), function (err) {
        if (err) return console.log(err);
        console.log(JSON.stringify(scriptFile, null, 2));
        console.log('writing to ' + scriptJson);
      });
    })
  )
}

function cancel(){
  $('#end-buttons').append(
    $('<div>').attr('id','cancel').text('cancel').button()
    .on('click',()=>{
      window.close();
      }
    )
  )
}


function scriptDebugger() {
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
    $("#debugger-close").on('click',()=>{$("#debugger-wrap").css("display","none")})
}

function myExecute(myProcess,flags){
  var scrollValue = 100;
  const scrollInc = 1000;
  const child = require('child_process').spawn(myProcess, flags,{shell: true, detached: true,windowsVerbatimArguments: true});
        child.stdout.on('data', function (data) {
          $("#debugger-output").append(`<span>${data}<span/><br>`)
          .scrollTop(scrollValue);
          scrollValue+=scrollInc;
          console.log(data)
        });
        child.stderr.on('data', function (data) {
          console.log(`err : ${data}`)
          $("#debugger-output").append(`<span>${data}<span/><br>`)
          .scrollTop(scrollValue);
          scrollValue+=scrollInc;
        });
        child.on('close', function (code) {
          console.log('server was stopped with code : ' + code);
          $("#debugger-output").append('server was stopped with code : ' + code)
          .scrollTop(scrollValue);
          scrollValue+=scrollInc;
        });
}
