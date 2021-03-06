const Hapi = require('hapi');
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


const server = new Hapi.Server();
server.connection({
    port: 8080
});

server.route({
    method: 'GET',
    path:'/',
    handler: function (request, reply) {
      console.log('GET request...');
      var response = reply(main);
      response.header('Content-type', 'text/html');
    }
});

server.route({
    method: 'GET',
    path:'/bootstrap/custom.css',
    handler: function (request, reply) {
      console.log('GET request...');
      var response = reply(custom_css);
      response.header('Content-type', 'text/css');
    }
});

server.route({
    method: 'GET',
    path:'/scripts/requester.js',
    handler: function (request, reply) {
      console.log('GET request...');
      var response = reply(requester);
      response.header('Content-type', 'text/javascript');
    }
});

server.route({
    method: 'GET',
    path:'/getnodes',
    handler: function (request, reply) {
      console.log('GET request...');
      var result = nodes.status();
      var response =  reply(JSON.stringify(result));
      response.header('Content-type', 'application/json');
    }
});

server.route({
    method: '*',
    path:'/{p*}',
    handler: function (request, reply) {
      console.log('GET request...');
      var response = reply('404.html');
      response.header('Content-type', 'text/html');
    }
});

server.route({
    method: 'POST',
    path:'/postnode',
    handler: function (request, reply) {
      console.log('POST request...')
      var body = request.payload
      node = JSON.parse(body);
      console.log("Received request: add node - " + node);
      nodes.add(node.ip, node.port);
      var response  = reply('Node recived.');
      response.header('Content-type', 'text/plain');
    }
});


server.route({
    method: 'DELETE',
    path:'/deletenode',
    handler: function (request, reply) {
      console.log('DELETE request...');
      var body = request.payload;
      node = JSON.parse(body);
      console.log("Received request: delete node - " + node.ip + ':' + node.port);
      nodes.remove(node.ip, node.port);
      var response = reply("Node removed");
      response.header('Content-type', 'text/plain');
    }
});

server.start((err) => {

    if (err) {
        throw err;
    }
    console.log('Server running at:', server.info.uri);
});


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
      return i;
    }
  }
  return -1;
}

Nodes_list.prototype.add = function(ip, port) {
  if(this.exists(ip, port) == -1){
    var node = new Server_tester(ip, port);
    this.nodes.push(node);
  }
}

Nodes_list.prototype.remove = function(ip, port) {
  var i = this.exists(ip, port);
  console.log('Removing: ' + i);
  if(i >= 0){
    this.nodes.splice(i, 1);
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
