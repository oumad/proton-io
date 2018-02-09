function modal(title,content, yesCallback, noCallback) {
    //fill the modal
    $('#modal-title').html(title)
    $('#modal-content').html(content)

    //display the modal
    $('#modal').show()

    //what to do on ok
    $('#modal-button-ok').click(function() {
        if(typeof yesCallback === 'function' && yesCallback()){
            yesCallback()
        }
        $('#modal').hide()
    })

    //what to do on close
    $('#modal-button-close').click(function() {
        $('#modal').hide()
        if(typeof noCallback === 'function' && noCallback()){
            noCallback()
        }
    })
}

/*
class Modal{
    constructor (title,content,ok,close){
        this.title = title;
        this.content = content;
        this.ok = ok;
        this.close = close;
    }

    field(){

    }
 }
*/