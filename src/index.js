const path = require('path')
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

//right click
require('electron-context-menu')({
    prepend: (params, browserWindow) => [{
        label: 'Rainbow',
        // Only show it when right-clicking images
        visible: params.mediaType === 'image'
    }]
});

//global.myOptions = commandLineArgs(optionDefinitions)
global.myOptions = {option1 : 'hello'}

//console.log(myOptions)


const iconPath = path.join(__dirname, 'icons/logo_30px.png');
let appIcon = null
let mainWindow

app.on('ready', () => {
  const electronScreen = electron.screen
  mainWindow = new BrowserWindow({
    width:800,
    height:600,
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

  appIcon = new Tray(iconPath)
  const contextMenu = Menu.buildFromTemplate([
      {label: 'quit',
      click: function () {
        app.quit()
        }
      },
      {label: 'reload scripts',
        click: function () {
          mainWindow.webContents.send("reload-scripts")
        }
      }
  ])
  appIcon.setToolTip('Proton watcher.')
  appIcon.setContextMenu(contextMenu)

  globalShortcut.register('Ctrl+Tab', () => {
    if(mainWindow.isVisible()) {
      mainWindow.hide()
    } else {
      const {x,y} = electronScreen.getCursorScreenPoint()
      mainWindow.setPosition(x, y)
      mainWindow.show()
      //ipcMain.send('show-dialog', { msg: 'my message' });
    }

  })
  mainWindow.on('blur', () => mainWindow.hide())
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
    //console.log(path);
  });
})

ipcMain.on('get-selected-files',function(event,arg){
   myFunction(1, function (error, result) {
    if (error){
      console.log(error)
    }
    event.returnValue = result;
  });
})

ipcMain.on('get-current-dir',function(event,arg){
  currentPath().then(path => {
    event.returnValue = path;
  });
})