const path = require('path')
const fs = require('fs')
const url = require('url')
const electron = require('electron')
const BrowserWindow = electron.BrowserWindow
const ipc = electron.ipcMain
const app = electron.app
const Menu = electron.Menu
const Tray = electron.Tray
const globalShortcut = electron.globalShortcut
const ipcMain  = electron.ipcMain
const edge = require('electron-edge-js');
const currentPath = require('current-path');
const AutoLaunch = require('auto-launch');




//right click
require('electron-context-menu')({
    prepend: (params, browserWindow) => [{
        label: 'Rainbow',
        // Only show it when right-clicking images
        visible: params.mediaType === 'image'
    }]
});




//myConfig path
const myConfigPath = path.join(__dirname,'config.json')
//define a global variable for the config object
global.myConfig = JSON.parse(fs.readFileSync(path.join(__dirname,'config.json'), 'utf8'))



//handling autolaunch
let protonioAutoLauncher = new AutoLaunch({
    name: 'Proton-io',
});

if (global.myConfig.autoLaunch){
    protonioAutoLauncher.isEnabled()
    .then(function(isEnabled){
        if(isEnabled){
            return;
        }
        protonioAutoLauncher.enable();
    })
}else{
  protonioAutoLauncher.isEnabled()
  .then(function(isEnabled){
      if(isEnabled){
          protonioAutoLauncher.disable();
      }
  })
}


const iconPath = path.join(__dirname, 'icons','logo_30px.png');
let appTray = null
let mainWindow
let prefWindow
let builderWindow
let managerWindow


//function for the preferences window
function preferencesWindow(){
  prefWindow = new BrowserWindow({
    width:600,
    height:400,
    //frame:false,
    autoHideMenuBar: true,
    backgroundColor:"#333333",
    icon: iconPath,
  })
  prefWindow.loadURL(url.format({
    pathname : path.join(__dirname,'prefs.html'),
    protocol : 'file',
    slashes : true
  }));
}

//function for the Script Builder window
function scriptBuilder(){
  builderWindow = new BrowserWindow({
    width:860,
    height:400,
    frame:false,
    backgroundColor:"#333333",
    //frame:false,
    autoHideMenuBar: true,
    icon: iconPath,
  })
  builderWindow.loadURL(url.format({
    pathname : path.join(__dirname,'protonBuilder.html'),
    protocol : 'file',
    slashes : true
  }));
}


//function for the Script Builder window
function protonManager(){
  managerWindow = new BrowserWindow({
    width:800,
    height:1000,
    frame:false,
    //frame:false,
    autoHideMenuBar: true,
    backgroundColor:"#333333",
    icon: iconPath,
  })
  managerWindow.loadURL(url.format({
    pathname : path.join(__dirname,'protonManager.html'),
    protocol : 'file',
    slashes : true
  }));
}


//function to create the window of the main scripts menu with tray icon
app.on('ready', () => {
  const electronScreen = electron.screen
  mainWindow = new BrowserWindow({
    width:1000,
    height:800,
    frame:false,
    show: false,
    alwaysOnTop: true,
    //minimizable: false,
    //maximizable: false,
    resizable: false,
    moveable: false,
    skipTaskbar: true,
    fullScreenable: false,
    titleBarStyle: 'hidden',
    autoHideMenuBar: true,
    icon: iconPath,
    transparent:true,
  })
  mainWindow.loadURL(url.format({
    pathname : path.join(__dirname,'menu/menu.html'),
    protocol : 'file',
    slashes : true
  }));

  appTray = new Tray(iconPath)
  const contextMenu = Menu.buildFromTemplate([

      {label: 'Reload scripts',
        click: function () {
          //send the event to reload the renderer js
          mainWindow.webContents.send("reload-scripts")
        }
      },
      {label: 'Builder',
        click: function () {
          //show the preferences window
          scriptBuilder()
        }
      },
      {label: 'Manager',
        click: function () {
          //show the preferences window
          protonManager()
        }
      },
      {label: 'Preferences',
        click: function () {
          //show the preferences window
          preferencesWindow()
        }
      },
      {
      type: 'separator'
      },
      {label: 'Check for updates',
        click: function () {
            require("openurl").open("https://github.com/oumad/proton-io")
        }
      },
      {
      type: 'separator'
      },
      {label : 'Restart',
        click: function () {
          //restart the whole app
          app.relaunch()
          app.quit()
        }
      },
      {label: 'Quit',
      click: function () {
        app.quit()
        }
      }
  ])
  appTray.setToolTip('Proton watcher.')
  appTray.setContextMenu(contextMenu)

  globalShortcut.register(global.myConfig.mainHotkey, () => {
    if(mainWindow.isVisible()) {
      mainWindow.hide()
    } else {
      const {x,y} = electronScreen.getCursorScreenPoint()
      mainWindow.setPosition(x, y)
      mainWindow.show()
      //ipcMain.send('show-dialog', { msg: 'my message' });
    }

  })
  mainWindow.on('blur', () => {
    mainWindow.hide()
    mainWindow.webContents.send("clear-input")
  })

  mainWindow.on('show', () => {
    mainWindow.webContents.send("focus-input")
  })

  setupProtonHotkeys()
})

// C# function
var myFunction = edge.func({
  source: function () {/*
    using System;
    using System.Threading.Tasks;
    using System.Collections;
    using System.IO;
    using System.Collections.Generic;

    public class Startup
    {
        public async Task<object> Invoke(object input)
        {
            return Helper.getFileNames();
        }
    }

    static class Helper
    {
        public static ArrayList getFileNames()
        {
            string filename;
            ArrayList selected = new ArrayList();
            foreach (SHDocVw.InternetExplorer window in new SHDocVw.ShellWindows())
            {
                //Console.WriteLine(window.FullName);
                filename = Path.GetFileNameWithoutExtension(window.FullName).ToLower();
                if (filename.ToLowerInvariant() == "explorer")
                {
                    Shell32.FolderItems items = ((Shell32.IShellFolderViewDual2)window.Document).SelectedItems();
                    foreach (Shell32.FolderItem item in items)
                    {
                        selected.Add(item.Path);
                        //Console.WriteLine(selected);
                    }
                }
            }
            return selected;
        }
    }
  */},
  references : [`${__dirname}\\Interop.Shell32.dll`,`${__dirname}\\Interop.SHDocVw.dll`]
});


//ipc events

ipcMain.on('menu-open',function(event, arg){
  global.menuReturns = arg
  myFunction(1, function (error, result) {
    if (error){
      console.log(error)
    }
    event.sender.send('selected-files', result);
    global.selectedFiles = result;
  });
  currentPath().then(path => {
    event.sender.send('current-path', path);
    global.currentDir = path;
  }).catch(function(){
    console.log("couldn't get the current dir!")
  });
})

ipcMain.on('get-selected-files',function(event,arg){
   myFunction(1, function (error, result) {
    if (error){
      console.log(error)
    }
    event.returnValue = result;
  })
})

ipcMain.on('get-current-dir',function(event,arg){
  currentPath().then(path => {
    event.returnValue = path;
  }).catch(function(){
    console.log("couldn't get the current dir!")
  });
})


//Editing myconfig.json on request
ipcMain.on('myConfig-edit',function(event,arg){

  fs.writeFile(myConfigPath, JSON.stringify(arg.myConfig, null, 2), function (err) {
    if (err) {
      event.sender.send('myCoinfig-edit-error', err);
    }else{
      event.sender.send('myCoinfig-edit-success', "restarting");
      app.relaunch()
      app.quit()
    }
  });

})

ipcMain.on('reload-scripts',function(event,arg){
  mainWindow.webContents.send("reload-scripts")
})


ipcMain.on('scripts-loaded',function(event,arg){
  global.afterScriptsLoad = arg
})


function setupProtonHotkeys(){
  for (let i in myConfig.protonHotkeys){
    //preparing object with hotkey values
    let protonHotkey = {}

    protonHotkey.protonName = myConfig.protonHotkeys[i].protonName
    protonHotkey.hotkey = myConfig.protonHotkeys[i].hotkey
    protonHotkey.hotkeyType = myConfig.protonHotkeys[i].type

    //preparing the global shortcut
    globalShortcut.register(protonHotkey.hotkey,()=>{
      mainWindow.webContents.send("hotkey-launch",protonHotkey)
    })
  }

}
