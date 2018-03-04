const path = require('path')
const fs = require('fs')
const url = require('url')
const remote = require('electron').remote
const myWindow = remote.BrowserWindow.getFocusedWindow();
const ipcRenderer = require('electron').ipcRenderer
const electronScreen = require('electron').screen
const BrowserWindow = remote.BrowserWindow
const { spawn } = require('child_process');
const {getGlobal} = require('electron').remote

const myConfig = getGlobal("myConfig")

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

ipcRenderer.on('clear-input',(event,date) => {
  $( "#scripts" ).val('');
})

//get config values or put default ones
const scriptSource = myConfig.scriptsPath || path.join(__dirname,"scripts")
const libsPath = myConfig.libsPath || path.join(__dirname,'libs')
const pythonExe = path.join(libsPath,'python/python.exe')


//useful functions
//get all directories from a path
function getDirectories(path) {
  return fs.readdirSync(path).filter(function (file) {
    return fs.statSync(path+'/'+file).isDirectory();
  });
}
//replace all instances of a string
String.prototype.replaceAll = function(search, replacement) {
    var target = this;
    return target.split(search).join(replacement);
};

//get all script directories
const scriptDirs = getDirectories(scriptSource);

//preparing scripts obj
let myScripts = {}

//get scripts names
let i=0;
let scriptNames = []
let categoryNames = []
let protonsData = []
for (i=0; i < scriptDirs.length; i++ ){
  console.log(`loading ${scriptDirs[i]}...`)
  //read interface json files
  try {
    myScripts[scriptDirs[i]] = JSON.parse(fs.readFileSync(path.join(__dirname,'scripts',scriptDirs[i],`interface.json`), 'utf8'))
    //autocomplete search menu options
    scriptNames.push(scriptDirs[i])
    const categoryName =  myScripts[scriptDirs[i]].category || "MISC"
    categoryNames.push(categoryName)

    console.log(`successfully loaded ${scriptDirs[i]}`)
  }
  catch(err) {
      alert(`${scriptDirs[i]} wasn't loaded because : ${err}`)
  }

}

//send message saying that all scripts are loaded
ipcRenderer.send('scripts-loaded',{myScripts : myScripts})


//hotkey execution
ipcRenderer.on('hotkey-launch',(event,protonHotkey) => {
  console.log(protonHotkey)
  const hotkeyType = protonHotkey.hotkeyType
  const protonName = protonHotkey.protonName
  //console.log(myScripts,protonName)
  const paramsNum = myScripts[protonName].params.length;

  // check if there are parameters or not
  if (paramsNum == 0 ){
    //execute directly
    myDirectExecute(protonName)
  }else if(hotkeyType == "direct") {
    //execute directly from default parameters
    myParamExecute(protonName)
  }else{
    ipcRenderer.send('menu-open',{script : protonName , myScripts : myScripts})
    //build interface for the parameters
    secondWindow(paramsNum)
  }
})


//category menu options
let uniqCategories = Array.from(new Set(categoryNames));


//constructing categories
for ( var c in uniqCategories.sort()){
  const categoryName = uniqCategories[c]
  const categoryId = categoryName.replaceAll(" ","-")
  $('#category-menu').append($("<li>").attr("id",categoryId))
  $(`#${categoryId}`).append($("<div>").addClass("proton-category").text(categoryName))
  $(`#${categoryId}`).append($("<ul>").addClass("proton-list"))
}

//filling categories
for (var p in scriptNames){

  const scriptName = scriptNames[p]
  let iconClass

  if(myScripts[scriptName].params.length == 0){
    iconClass = "ui-icon-play"
  }else{
    iconClass = "ui-icon-newwin"
  }

  const scriptId = scriptName.replaceAll(" ","-")
  const scriptCategory = myScripts[scriptName].category || "MISC"
  const scriptCategoryId = scriptCategory.replaceAll(" ","-")
  $(`#${scriptCategoryId} ul`).append($("<li>").attr('id',scriptId))
  $(`#${scriptId}`).append($("<div>").addClass("proton").text(scriptName).attr("title",myScripts[scriptName].description)
    .prepend($("<span>").addClass(`ui-icon ${iconClass}`))
    )
}


//when the html doc is ready
$(document).ready(function(){
    //autocomplete list
    $( "#scripts" ).autocomplete({
      source: scriptNames,
      autoFocus :true,
      position: { my : "right+100% top", at: "right bottom-100%"},
      delay: 10,
      select : function( event, ui ){
        selectScript(ui.item.value)
      }
    })
    //main menu list
    $( "#category-menu" ).menu({
      select : function( event, ui ){
        selectScript(ui.item.text())
      }
    });


    //make room for icons in the menu
    const menuWidth = $( "#scripts" ).width()
    const searchWidth = $( "#search-menu input" ).width()

    $( "#scripts" ).css({"width":menuWidth+40})
    $(".ui-menu").css({"width":menuWidth+40})

    //focus on the input field
    $( "#scripts" ).focus()
})


//what happens when user selects a script from the menu
function selectScript(selectedScript){

  const paramsNum = myScripts[selectedScript].params.length;

  // check if there are parameters or not
  if (paramsNum == 0 ){
    //execute directly
    myDirectExecute(selectedScript)
  }else if(event[myConfig.directKeydown]) {
    //execute directly from default parameters
    myParamExecute(selectedScript)
  }else{
    ipcRenderer.send('menu-open',{script : selectedScript , myScripts : myScripts})
    //build interface for the parameters
    secondWindow(paramsNum)
  }
  //reload scripts list after execution
  location.reload();
}

//creating the parameters window
function secondWindow(paramsNum){
    const secondWindowWidth = 560;
    const secondWindowHeight = (30*paramsNum) + 110;
    let secondWindow = new BrowserWindow({
      width:secondWindowWidth,
      height:secondWindowHeight,
      frame:false,
      icon : path.join(__dirname,"icons",'logo_full_grey_inverted.png')
    })

    adjustWindowPosition(secondWindow,secondWindowWidth,secondWindowHeight)

    secondWindow.loadURL(url.format({
      pathname : path.join(__dirname,'parameters.html'),
      protocol : 'file',
      slashes : true
    }));
}


//Avoid having the window cut off by screen edge
function adjustWindowPosition(myWindow,width,height){
    const  {x,y} = electronScreen.getCursorScreenPoint();
    const xCentered = x-(width/2)
    const yCentered = y-(height/2)
    const xCenteredEnd = xCentered+width
    const yCenteredEnd = yCentered+height
    var xWindow,yWindow

    const allDisplays = electronScreen.getAllDisplays()
    var totalX = 0;
    for (var display in allDisplays){
      totalX += allDisplays[display].workAreaSize.width
    }
    //get size of the current display
    const currentScreen = electronScreen.getDisplayNearestPoint(electronScreen.getCursorScreenPoint()).workAreaSize
    //console.log(xCentered,yCentered,xCenteredEnd,yCenteredEnd,totalX,currentScreen.height)
    if (xCentered < 0){
      xWindow = 0
    }else if (xCenteredEnd > totalX){
      xWindow = totalX - width
    }else {
      xWindow = xCentered
    }
    if (yCentered < 0){
      yWindow = 0
    }else if (yCenteredEnd > currentScreen.height){
      yWindow = currentScreen.height - height
    }else {
      yWindow = yCentered
    }

    myWindow.setPosition(xWindow, yWindow);
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
  const rawScript = myScripts[selectedScript].script
  const script = rawScript.replace("./","")
  //append command if exist
  if (rawScript != ''){
    if(rawScript.includes('./')){
      //using an external execution
      myArgs.push(path.join(scriptSource,selectedScript,script))
    }else{
      //using internal script
      myArgs.push(script)
    }
  }

  //check if interface requests Directory
  if (myScripts[selectedScript].getDir){
    const selectedDir = ipcRenderer.sendSync('get-current-dir')
    myArgs.push(selectedDir.stdout)
  }

  //check if interface requests selection
  if (myScripts[selectedScript].getSel){
    const selectedFiles = ipcRenderer.sendSync('get-selected-files')
    //make selectedFiles list file
    const storedFilePath = storeSelectedFilePaths(selectedFiles,scriptDir)
    myArgs.push(storedFilePath)
  }

  console.log(myScripts[selectedScript].process, myArgs)
  const child = spawn(myScripts[selectedScript].process, myArgs,{shell: true, detached: true,windowsVerbatimArguments: true});
}


function myParamExecute(selectedScript){
  let myArgs = []

  const scriptDir = path.join(scriptSource,selectedScript)

  const rawScript = myScripts[selectedScript].script
  const script = rawScript.replace("./","")
  //append command if exist
  if (rawScript != ''){
    if(rawScript.includes('./')){
      //using an external execution
      myArgs.push(path.join(scriptSource,selectedScript,script))
    }else{
      //using internal script
      myArgs.push(script)
    }
  }

  if (myScripts[selectedScript].getDir){
    const selectedDir = ipcRenderer.sendSync('get-current-dir')
    myArgs.push(`"${selectedDir.stdout }"`)
  }

  if (myScripts[selectedScript].getSel){
    const selectedFiles = ipcRenderer.sendSync('get-selected-files')
    //make selectedFiles list file
    const storedFilePath = storeSelectedFilePaths(selectedFiles,scriptDir)
    myArgs.push(storedFilePath)
    //flags.push(`"${storedFilePath}"`)
  }

  if (myScripts[selectedScript].params.length>0){
    for (i=0; i < myScripts[selectedScript].params.length; i++ ){
      const myParam = myScripts[selectedScript].params[i].default || "None"
      myArgs.push(`"${myParam}"`)
    }
  }

  console.log(myScripts[selectedScript].process,myArgs)


  const child = spawn(myScripts[selectedScript].process, myArgs,{shell: true, detached: true,windowsVerbatimArguments: true});

}


//execution function
function executeDetached(myProcess,args){
  if(myProcess == 'python'){
    myProcess = pythonExe
  }
  const child = spawn(myProcess, args,{shell: true, detached: true,windowsVerbatimArguments: true});
}



//store selected file paths in a file
function storeSelectedFilePaths(selectedFiles,scriptDir){
  var selectedFilesEscaped = []

  for (var f=0;f<selectedFiles.length; f++){
    const selectedFile = selectedFiles[f]
    selectedFilesEscaped.push(selectedFile)
  }

  const storedFilePath = path.join(scriptDir,'selectedFiles.txt')
  fs.writeFileSync(storedFilePath, selectedFilesEscaped)
  return storedFilePath
}


//possibility to go dev mode
document.addEventListener("keydown", function (e) {
  if (e.keyCode === 123) { // F12
    myWindow.toggleDevTools();
  }
});
