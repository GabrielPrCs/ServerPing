var post_button = document.getElementById('post_button');
var get_button = document.getElementById('get_button');


var poster = new XMLHttpRequest();
var post_url = "postnode";
poster.onreadystatechange = function() {
  if(poster.readyState == 4 && poster.status == 200){
    alert(poster.responseText);
  }
}

post_button.onclick = function(){
  var ip = document.getElementById('ip').value;
  var port = document.getElementById('port').value;
  poster.open("POST", post_url, true);
  poster.send(JSON.stringify({
    ip: ip,
    port: port
  }));
};

var getter = new XMLHttpRequest();
var get_url = 'getnodes';
getter.onreadystatechange = function() {
  if(poster.readyState == 4 && poster.status == 200){
    var response = JSON.parse(getter.responseText)
    console.log(response);
  }
}

get_button.onclick = function(){
  getter.open("GET", get_url, true);
  getter.send();
}
