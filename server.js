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
    case 'bootstrap/bootstrap.min.js':
      ret = bootstrap_js;
      break;
    case 'bootstrap/custom.css':
      ret = custom_css;
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

rl.on('line', (data) => {
  var dest = data.split(':');
  var target = dest[0].toString();
  session.pingHost(target, function(error, target, sent, rcvd){
    if(error){
      console.log(target + error.toString())
    } else {
      var lat = (rcvd.getTime() - sent.getTime()) / 2;
      console.log(target + ": Alive!\nLatency: " + lat);
    }
  });
  socket.connect(dest[1], dest[0], function() {
    console.log('Port alive!');
    socket.destroy();
  });
})

http.createServer(function (req, res) {

  if(req.method == 'GET'){
    res.write(resolve_url(req.url));
    res.end();
  }

}).listen(8080);
