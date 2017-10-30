var http = require('http');
var fs = require('fs');
var ping = require('net-ping');
var readline = require('readline');
var net = require('net');


var bootstrap_css = null;
fs.readFile('web_interface/bootstrap/bootstrap.min.css', function(err, data) {
  bootstrap_css = data;
});

var bootstrap_js = null;
fs.readFile('web_interface/bootstrap/bootstrap.min.js', function(err, data) {
  bootstrap_js = data;
});

var custom_css = null;
fs.readFile('web_interface/bootstrap/custom.css', function(err, data) {
  custom_css = data;
});

var requester = null;
fs.readFile('web_interface/scripts/requester.js', function(err, data) {
  requester = data;
});

var main = null;
fs.readFile('web_interface/main.html', function(err, data) {
  main = data;
});

var login = null;
fs.readFile('web_interface/login.html', function(err, data) {
  login = data;
});

var register = null;
fs.readFile('web_interface/register.html', function(err, data) {
  register = data;
});

function resolve_url(url) {
  var ret;
  console.log('Resolve URL: ' + url);
  switch (url) {
    case '/':
      ret = main;
      break;
    case '/login':
      ret = login;
      break;
    case '/register':
      ret = register;
      break
    case '/bootstrap/bootstrap.min.css':
      ret = bootstrap_css;
      break;
    case '/bootstrap/bootstrap.min.js':
      ret = bootstrap_js;
      break;
    case '/bootstrap/custom.css':
      ret = custom_css;
      break;
    case '/scripts/requester.js':
      ret = requester;
      break;
    case '/request':
      var query = url.parse(url, true).query;
      ret = checkServerStatus(query.ip, query.port)
      break;
    default:
      ret = '404.html';
    break;
  }
  return ret;
}

var session = ping.createSession();


var rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

var socket = new net.Socket();

function checkServerStatus(ip, port) {
  var status = {false, false};
  session.pingHost(target, function(error, ip, sent, rcvd){
    if(error){
      console.log(target + error.toString())
    } else {
      var lat = (rcvd.getTime() - sent.getTime()) / 2;
      status[0] = true;
    }
  });
  socket.connect(port, ip, function() {
    status[1] = true;
    socket.destroy();
  });
  setTimeout(function(){

  }, 3000);
  return status;
}

http.createServer(function (req, res) {

  if(req.method == 'GET'){
    var query = resolve_url(req.url)
    try{
      query[1]
    };
    res.write();
    res.end();
  }

}).listen(8080);
