var http = require('http');
var fs = require('fs');
var ping = require('net-ping');
var net = require('net');
var readline = require('readline');

var rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
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

function resolve_url(url) {
  var req = url.split('?');
  var ret;
  console.log('Resolve URL: ' + url);
  switch (req[0]) {
    case '/':
    ret = main;
    break;
    case '/bootstrap/custom.css':
    ret = custom_css;
    break;
    case '/scripts/requester.js':
    ret = requester;
    break;
    case '/getnodes':
    var result = nodes.status();
    ret = JSON.stringify(result);
    break;
    default:
    ret = '404.html';
    break;
  }
  return ret;
}

var session = ping.createSession();

var Nodes_list = function() {
  this.nodes = [];
  this.interval = 3000;
  var self = this;
  setInterval(function(){
    self.nodes.forEach(function(node){
      node.test_ip();
    });
  },this.interval);
}

Nodes_list.prototype.exists = function(ip, port) {
  for (var i = 0; i < this.nodes.length; i++) {
    var node = this.nodes[i];
    if(node.ip == ip && node.port == port){
      return true;
    }
  }
}

Nodes_list.prototype.add = function(ip, port) {
  if(!this.exists(ip, port)){
    var node = new Server_tester(ip, port);
    this.nodes.push(node);
  }
}

Nodes_list.prototype.status = function() {
  var result = [];
  this.nodes.forEach(function(node){
    if(node.response_status_ready){
      result.push({
        ip: node.ip,
        port: node.port,
        ip_status: node.ip_status,
        port_status: node.port_status,
        latency: node.latency,
        refreshed: node.response_refreshed
      })
    }
  });
  return result;
}

function Server_tester(req_ip, req_port){
  this.ip = req_ip;
  this.port = req_port;
  this.latency = 0;
  this.ip_status = false;
  this.port_status = false;
  this.response_status_ready = true;
  this.response_refreshed = false;
  this.interval = 10000;
  var self = this;
  console.log('Worker created for: ' + this.ip + ':' + this.port);
}

Server_tester.prototype.test_ip = function() {
  var self = this;
  console.log('Ping sent to: ' + this.ip);
  session.pingHost(this.ip, function(error, ip, sent, rcvd){
    if(error){
      console.log('Ping error: '  + error.toString());
      self.ip_status = false;
      self.port_status = false;
      self.response_status_ready = true;
      self.response_refreshed = true;
    } else {
      self.latency = (rcvd.getTime() - sent.getTime()) / 2;
      self.ip_status = true;
      console.log('Ping response from: ' + ip);
      console.log('latency: ' + self.latency);
      self.test_port();
    }
  });
}

Server_tester.prototype.test_port = function(){
  var socket = new net.Socket();
  var self = this;

  console.log('Trying to establish connection on ' + this.ip + ':' + this.port);

  socket.connect(self.port, self.ip, function(){
    console.log('Connection established on ' + self.ip + ':' + self.port);
    self.port_status = true;
    self.response_status_ready = true;
    self.response_refreshed = true;
  });

  socket.on('error', function(err){
    console.log('Failed to establish connection.');
    self.port_status = false;
    self.response_status_ready = true;
    self.response_refreshed = true;
  });
};

var nodes = new Nodes_list();

http.createServer(function (req, res) {
  console.log('New incoming request...');

  if(req.method == 'POST') {
    var body = "";
    req.on('data', function(data){
      body += data.toString();
    });
    req.on('end',function(){
      node = JSON.parse(body);
      console.log("Received request: add node - " + node);
      nodes.add(node.ip, node.port);
      res.write("Node received");
      res.end();
    })
  }
  else if(req.method == 'GET') {
    console.log('Sending file');
    res.write(resolve_url(req.url));
    res.end();
  }

}).listen(8080);
