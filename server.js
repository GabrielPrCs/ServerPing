var http = require('http');
var fs = require('fs');

var bootstrap_css = null;
fs.readFile('web_interface/bootstrap/bootstrap.min.css', function(err, data) {
  main = data;
});

var bootstrap_js = null;
fs.readFile('web_interface/bootstrap/bootstrap.min.js', function(err, data) {
  main = data;
});

var custom_css = null;
fs.readFile('web_interface/bootstrap/custom.css', function(err, data) {
  main = data;
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
    default:
    ret = '404.html';
    break;
  }
  return ret;
}

http.createServer(function (req, res) {

  if(req.method == 'GET'){
    res.writeHead(200, {'Content-Type': 'text/html'});
    res.write(resolve_url(req.url));
    res.end();
  }

}).listen(8080);
