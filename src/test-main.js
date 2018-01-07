
var edge = require('edge');

var myFunction = edge.func(function () {/*
  using System;
  using System.Threading.Tasks;
  using System.Collections;
  using System.IO;
  using System.Collections.Generic;
  #r "Interop.Shell32.dll"
  #r "Interop.SHDocVw.dll"

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
              Console.WriteLine(window.FullName);
              filename = Path.GetFileNameWithoutExtension(window.FullName).ToLower();
              if (filename.ToLowerInvariant() == "explorer")
              {
                  Shell32.FolderItems items = ((Shell32.IShellFolderViewDual2)window.Document).SelectedItems();
                  foreach (Shell32.FolderItem item in items)
                  {
                      selected.Add(item.Path);
                      Console.WriteLine(selected);
                  }
              }
          }
          return selected;
      }
  }


*/});

myFunction(1, function (error, result) {
  console.log(result)
});



/*
const path = require('path')
const url = require('url')
const electron = require('electron')
const BrowserWindow = electron.BrowserWindow
const ipc = electron.ipcMain
const app = electron.app
const Menu = electron.Menu
const Tray = electron.Tray
const commandLineArgs = require('command-line-args')

const optionDefinitions = [

  { name: 'selected', type: String, multiple: true, defaultOption: true },
  { name: 'timeout', alias: 't', type: Number }
]


let appIcon = null

app.on('ready', function (event) {
  const electronScreen = electron.screen
  const myMousePos = electronScreen.getCursorScreenPoint()
  console.log(myMousePos);
  mainWindowRender(myMousePos)
  const iconName = 'logo_30px.png'
  const iconPath = path.join(__dirname, iconName)
  appIcon = new Tray(iconPath)
  const contextMenu = Menu.buildFromTemplate([{
    label: 'quit',
    click: function () {
      app.quit()
    }
  }])
  appIcon.setToolTip('Proton watcher.')
  appIcon.setContextMenu(contextMenu)
})


function mainWindowRender(mousePos){
  let mainWindow = new BrowserWindow({
    width:200,
    height:400,
    frame:false,
    x:mousePos.x,
    y:mousePos.y,
    transparent:true,
    //icon: __dirname+'/menu/icons/gear_24px.png'
  });
  mainWindow.loadURL(url.format({
    pathname : path.join(__dirname,'menu/menu.html'),
    protocol : 'file',
    slashes : true
  }));
}
*/
