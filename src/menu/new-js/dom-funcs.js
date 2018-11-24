// fill select html element with options from list
function selectFeed(element,list){
    for (option of list){
        element.options[element.options.length] = new Option(option, option);
    }
}

//get selected option from select element
function getSelectOption(element){
    return element.options[element.selectedIndex].text;
}

//function to create a new dom element and append it to an existing one
//with the option to give an id and/or a class
function addElement(element,container,idAttr = false, classAttr = false, prepend=false){
    // Create the new element
    const newElement = document.createElement(element);
    //add id if specified
    if (idAttr) newElement.setAttribute("id", idAttr);
    //add clalss if specified
    if (classAttr) newElement.classList.add(classAttr);
    
    if (!prepend){
        container.appendChild(newElement);
    }else{
        container.prepend(newElement);
    }
    //add element to the container
    
    //return newly created element
    return newElement
}

//clear children of selected element
function clearChildren(node){
    while (node.lastChild) {
        node.removeChild(node.lastChild);
      }
}

//toggle class between multiple elements
function classToggle(elements,target,targetClass,elementsClass = false){
    for (let element of elements){
        if(element != target){
            element.classList.remove(targetClass)
            if(elementsClass){
                element.classList.add(elementsClass)
            }
        }else{
            element.classList.remove(elementsClass)
            element.classList.add(targetClass)
        }
    }
}

//advanced styling
const advancedStyling = (function (style) {
    var sheet = document.head.appendChild(style).sheet;
    return function (selector, css) {
        var propText = typeof css === "string" ? css : Object.keys(css).map(function (p) {
            return p + ":" + (p === "content" ? "'" + css[p] + "'" : css[p]);
        }).join(";");
        sheet.insertRule(selector + "{" + propText + "}", sheet.cssRules.length);
    };
})(document.createElement("style"));


//Make a fetch promise
function fetchJsonPomise(url){
    return new Promise((resolve,reject)=>{
        fetch(url)
        .then(function(response) {
            if (response.ok){return response.json()}
            let msg = `could not json data projects from ${url}`
            reject (new Error(msg))
        })
        .then(function(data) {
            resolve(data)
        });
    })
}

//post request
function postData(url = ``, data = {}) {
    // Default options are marked with *
    return fetch(url, {
        method: "POST", // *GET, POST, PUT, DELETE, etc.
        mode: "cors", // no-cors, cors, *same-origin
        cache: "no-cache", // *default, no-cache, reload, force-cache, only-if-cached
        credentials: "same-origin", // include, same-origin, *omit
        headers: {
            "Content-Type": "application/json; charset=utf-8",
            // "Content-Type": "application/x-www-form-urlencoded",
        },
        redirect: "follow", // manual, *follow, error
        referrer: "no-referrer", // no-referrer, *client
        body: JSON.stringify(data), // body data type must match "Content-Type" header
    })
    .then(response => response.json()); // parses response to JSON
}

// //prepare viewer when document ready
// $(function () {
//     //setup viewer
//     globals.viewer = ImageViewer();

//     //textarea autosize
//     // $(document)
//     // .one('focus.autoExpand', 'textarea.autoExpand', function(){
//     //     console.log("working")
//     //     var savedValue = this.value;
//     //     this.value = '';
//     //     this.baseScrollHeight = this.scrollHeight;
//     //     this.value = savedValue;
//     // })
//     // .on('change.autoExpand', 'textarea.autoExpand', function(){
//     //     console.log("working")
//     //     var minRows = this.getAttribute('data-min-rows')|0, rows;
//     //     this.rows = minRows;
//     //     rows = Math.ceil((this.scrollHeight - this.baseScrollHeight) / 16);
//     //     this.rows = minRows + rows;
//     // });
// });