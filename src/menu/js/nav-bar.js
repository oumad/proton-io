const {remote} = require('electron');     
const myWindow = remote.BrowserWindow.getFocusedWindow();

$('.nav-buttons').on('click',function(event){
  const clickedId = $(this)[0].id;

  if(clickedId =='nav-buttons-min'){
    myWindow.minimize();
  }else if(clickedId =='nav-buttons-max'){
    if(!myWindow.isMaximized()){
      myWindow.maximize();
    }else{
      myWindow.unmaximize();
    }
  }else if(clickedId =='nav-buttons-close'){
    myWindow.close();
  }
})


document.addEventListener("keydown", function (e) {  
  if (e.keyCode === 123) { // F12
    myWindow.toggleDevTools();         
  }
});