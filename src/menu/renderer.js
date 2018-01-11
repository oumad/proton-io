const path = require('path')
const fs = require('fs')
const url = require('url')
const remote = require('electron').remote
const ipcRenderer = require('electron').ipcRenderer
const electronScreen = require('electron').screen
const BrowserWindow = remote.BrowserWindow
const { spawn } = require('child_process');



//promises
ipcRenderer.on('selected-files',(event,result) => {
  console.log(result)
})
ipcRenderer.on('current-path',(event,path) => {
  console.log(path.stdout)
})

ipcRenderer.on('reload-scripts',(event,date) => {
  location.reload();
})

const scriptSource = path.join(__dirname,"scripts")

function getDirectories(path) {
  return fs.readdirSync(path).filter(function (file) {
    return fs.statSync(path+'/'+file).isDirectory();
  });
}
const scriptDirs = getDirectories(scriptSource);

let myScripts = {}

//get scripts names
let i=0;
for (i=0; i < scriptDirs.length; i++ ){
  $('#combobox').append($('<option>').attr('value',scriptDirs[i]).html(scriptDirs[i]))
  myScripts[scriptDirs[i]] = JSON.parse(fs.readFileSync(path.join(__dirname,'scripts',scriptDirs[i],`interface.json`), 'utf8'))
}

//script builder option TO DO
$('#combobox').append($('<option>').attr('value',"new").html("new"))


$(document).ready(function(){
  var obj;
  $( "#combobox" ).combobox({
    select: function( event, ui ) {

      const selectedScript = ui.item.value;
      const paramsNum = myScripts[selectedScript].params.length;

      // check if there are parameters or not
      if (paramsNum == 0 ){
        myDirectExecute(selectedScript)
      }else if(event.ctrlKey) {
        myParamExecute(selectedScript)
      }else{
        ipcRenderer.send('menu-open',{script : selectedScript , myScripts : myScripts})
        //build interface for the parameters
        secondWindow(paramsNum)
      }
      //reload scripts list after execution
      location.reload();
    }
  });
  $( ".custom-combobox-toggle" ).trigger( "click" );
})

function secondWindow(paramsNum){
    const secondWindowWidth = 560;
    const secondWindowHeight = (30*paramsNum) + 90;
    let secondWindow = new BrowserWindow({
      width:secondWindowWidth,
      height:secondWindowHeight,
      frame:false,
    })
    const {x,y} = electronScreen.getCursorScreenPoint();
    secondWindow.setPosition(x-(secondWindowWidth/2), y-(secondWindowHeight/2));
    secondWindow.loadURL(url.format({
      pathname : path.join(__dirname,'parameters.html'),
      protocol : 'file',
      slashes : true
    }));
}

//script builder window TO DO
function scriptBuilder(){
  let scriptBuilderWindow = new BrowserWindow({
    width:560,
    height:500,
    frame:false,
  })
}

//direct execution without parameters
function myDirectExecute(selectedScript){

  // execute the script directly using the command in the interface.json without building a window
  let myArgs = []

  //append command
  myArgs.push(myScripts[selectedScript].command)

  //check if interface requests Directory
  if (myScripts[selectedScript].getDir){
    const selectedDir = ipcRenderer.sendSync('get-current-dir')
    myArgs.push(selectedDir)
  }

  //check if interface requests Directory
  if (myScripts[selectedScript].getDir){
    const selectedDir = ipcRenderer.sendSync('get-current-dir')
    myArgs.push(selectedDir)
  }


  const child = spawn(myScripts[selectedScript].process, myArgs,{shell: true, detached: true,windowsVerbatimArguments: true});
}


function myParamExecute(selectedScript){

  let flags = []
  let execPath
  const scriptName = myScripts[selectedScript].script
  const scriptDir = path.join(scriptSource,selectedScript)

  if(scriptName.indexOf('\\') > -1 || scriptName.indexOf('/') > -1 ){
    //using an external execution
    execPath = scriptName
  }else{
    //using internal script
    execPath = path.join(scriptSource,selectedScript,scriptName)
  }

  flags.push(execPath)

  if (myScripts[selectedScript].getDir){
    const selectedDir = ipcRenderer.sendSync('get-current-dir')
    flags.push(`"${selectedDir.stdout }"`)
  }else{
    flags.push("None")
  }

  if (myScripts[selectedScript].getSel){
    const selectedFiles = ipcRenderer.sendSync('get-selected-files')
    //make selectedFiles list file
    const storedFilePath = storeSelectedFilePaths(selectedFiles,scriptDir)
    flags.push(storedFilePath)
    //flags.push(`"${storedFilePath}"`)
  }else{
    flags.push("None")
  }


  for (i=0; i < myScripts[selectedScript].params.length; i++ ){
    const myParam = myScripts[selectedScript].params[i].default || "None"
    flags.push(`"${myParam}"`)
  }
  console.log(flags)
  const child = spawn(myScripts[selectedScript].process, flags,{shell: true, detached: true,windowsVerbatimArguments: true});
}

//store selected file paths in a file
function storeSelectedFilePaths(selectedFiles,scriptDir){
  var selectedFilesEscaped = []

  for (var f=0;f<selectedFiles.length; f++){
    const selectedFile = selectedFiles[f]
    selectedFilesEscaped.push(selectedFile)
  }
  console.log(selectedFilesEscaped)

  const storedFilePath = path.join(scriptDir,'selectedFiles.txt')
  fs.writeFileSync(storedFilePath, selectedFilesEscaped)
  return storedFilePath
}



//RIGHT click
