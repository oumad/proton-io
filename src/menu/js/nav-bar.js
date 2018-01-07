$('.nav-buttons').on('click',function(event){
  const clickedId = $(this)[0].id;
  const window = require('electron').remote.BrowserWindow.getFocusedWindow();

  if(clickedId =='nav-buttons-min'){
    window.minimize();
  }else if(clickedId =='nav-buttons-max'){
    if(!window.isMaximized()){
      window.maximize();
    }else{
      window.unmaximize();
    }
  }else if(clickedId =='nav-buttons-close'){
    window.close();
  }
})
