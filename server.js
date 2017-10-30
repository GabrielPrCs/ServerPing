var http = require('http');
var fs = require('fs');
var ping = require('net-ping');
var readline = require('readline');
var net = require('net');
var url_pk = require('url');

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
  var req = url.split('?');
  var ret;
  console.log('Resolve URL: ' + url);
  switch (req[0]) {
    case '/':
    ret = main;
    break;
    case '/login.html':
    ret = login;
    break;
    case '/register.html':
    ret = register;
    break;
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
    ret = 'REQUEST';
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



http.createServer(function (req, res) {
  if(resolve_url(req.url) == 'REQUEST'){
    var query = url_pk.parse(req.url, true).query;
    var ip_status = false;
    var port_status = false;
    session.pingHost(query.ip, function(error, ip, sent, rcvd){
      if(error){
        console.log(ip + error.toString());
      } else {
        var lat = (rcvd.getTime() - sent.getTime()) / 2;
        ip_status = true;
        console.log('Ping response from: ' + ip);
        socket.connect(query.port, ip, function() {
          console.log('Ping connected to port: ' + query.port);
          port_status = true;
          socket.destroy();
        });
      }
      res.write(ip_status + " " + port_status);
      res.end();
    });
  }


}).listen(8080);
