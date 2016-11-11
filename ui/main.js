console.log('Loaded!');
/*
// changing html-value
var element = document.getElementById('main-text');
element.innerHTML = 'New Value';

//madi's movement
var img = document.getElementById('madi');
var marginLeft = 0;
function moveRight() { 
    marginLeft = marginLeft+1; 
    img.style.marginLeft = marginLeft + 'px';
}
img.onclick = function () { 
    var interval = setInterval(moveRight, 50);
};
*/



// counter code

var button = document.getElementById('counter');

button.onclick = function () {
   // create request to counter endpoint
    var request = new XMLHttpRequest();
    // Capture the response and store it in a variable
    request.onreadystatechange = function () {
        if (request.readyState === XMLHttpRequest.DONE){
            if (request.status===200) {
                var counter = request.responseText;
                var span = document.getElementById('count');
                span.innerHTML = counter.toString();
            }
        }
    };
    
    // make request 
    request.open('GET', 'http://dimpu47.imad.hasura-app.io/counter', true);
    request.send(null);
};




// Submit Name
var submit = document.getElementById('submit_btn');
submit.onclick = function () {
    // create request to counter endpoint
    var request = new XMLHttpRequest();
    // Capture the response and store it in a variable
    request.onreadystatechange = function () {
        if (request.readyState === XMLHttpRequest.DONE){
            if (request.status===200) {
                
                // cature a list of name and render it as the list.
                var names = request.responseText;
                names = JSON.parse(names);
                var list = '';
                for (var i=0; i<names.length;i++) {
                  list += '<li class="list-unstyled">'+names[i]+'</li>';
                }
                var ul = document.getElementById('namelist');
                ul.innerHTML = list;
            }
        }
    };
    
    // make request
    var nameInput = document.getElementById('name');
    var name = nameInput.value;
    request.open('GET', 'http://dimpu47.imad.hasura-app.io/submit-name?name='+name, true);
    request.send(null);
    
    
};