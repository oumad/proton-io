const path = require('path')
const fs = require('fs')
const url = require('url')
const remote = require('electron').remote
const ipcRenderer = require('electron').ipcRenderer
const electronScreen = require('electron').screen
const BrowserWindow = remote.BrowserWindow



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

var myScripts = {}

//get scripts names
var i=0;
for (i=0; i < scriptDirs.length; i++ ){
  $('#combobox').append($('<option>').attr('value',scriptDirs[i]).html(scriptDirs[i]))
  myScripts[scriptDirs[i]] = JSON.parse(fs.readFileSync(path.join(__dirname,'scripts',scriptDirs[i],`interface.json`), 'utf8'))
}

//script builder option TO DO
$('#combobox').append($('<option>').attr('value',"new").html("new"))

//handle scripts menu
$(document).ready(function(){
  $( "#combobox" ).combobox({
    select: function( event, ui ) {
      const selectedScript = ui.item.value;
      const paramsNum = myScripts[selectedScript].params.length;
      secondWindow(paramsNum)
      ipcRenderer.send('menu-open',{script : selectedScript , myScripts : myScripts})

      location.reload();
    }
  });
  $( ".custom-combobox-toggle" ).trigger( "click" );
})

const iconPath = path.join(__dirname, 'icons','logo_30px.png')

//creating the parameters window
function secondWindow(paramsNum){
    const secondWindowWidth = 560;
    const secondWindowHeight = (30*paramsNum) + 110;
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
      slashes : true,
      icon: iconPath
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



//RIGHT click
