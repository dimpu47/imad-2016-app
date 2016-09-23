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

// SUbmit Name
var nameInput = document.getElementById('name');
var name = nameInput.value;
var submit = document.getElementById('sbmit_btn');
submit.onclick = function () {
  // Make a reuest to the server and send the name
  
  // cature a list of name and render it as the list.
  var names = ['name1', 'name3', 'name3', 'name4'];
  var list = '';
  for (var i=0; i<names.length;i++) {
      list += '<li>' + names[i]+'</li>';
  }
  var ul = document.getElementById('namelist');
  ul.innerHTML = list;
  
};