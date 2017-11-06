var post_button = document.getElementById('post_button');
var get_button = document.getElementById('get_button');
var servers_table = document.getElementById('servers_table');
var servers_table_body = document.getElementById('servers_table_body');


var poster = new XMLHttpRequest();
var post_url = "postnode";
poster.onreadystatechange = function() {
  if(poster.readyState == 4 && poster.status == 200){
    console.log(poster.responseText);
  }
}

post_button.onclick = function(){
  var ip = document.getElementById('ip').value;
  var port = document.getElementById('port').value;

  if(ip == "" || port == ""){
    alert("El IP y el puerto son requeridos");
    return;
  }

  poster.open("POST", post_url, true);
  poster.send(JSON.stringify({
    ip: ip,
    port: port
  }));

  var row = servers_table_body.insertRow(servers_table_body.rows.length);
  var address = row.insertCell(0);
  var port_cell = row.insertCell(1);
  var ip_status = row.insertCell(2);
  var port_status = row.insertCell(3);
  var latency = row.insertCell(4);
  var trash = row.insertCell(5);

  address.innerHTML = ip;
  port_cell.innerHTML = port;
  ip_status.innerHTML = '<i class="fa fa-refresh fa-spin fa-fw" style="color: blue;"></i>';
  port_status.innerHTML = '<i class="fa fa-refresh fa-spin fa-fw" style="color: blue;"></i>';
  latency.innerHTML = '<i class="fa fa-refresh fa-spin fa-fw" style="color: blue;"></i>';
  trash.innerHTML = '<i class="fa fa-trash" aria-hidden="true"></i>';
};

var getter = new XMLHttpRequest();
var get_url = 'getnodes';
getter.onreadystatechange = function() {
  if(getter.readyState == 4 && getter.status == 200){
    servers_table_body.innerHTML = "";
    var response = JSON.parse(getter.responseText);
    response.forEach(function(node, index){
      var row = servers_table_body.insertRow(index);
      var address = row.insertCell(0);
      var port = row.insertCell(1);
      var ip_status = row.insertCell(2);
      var port_status = row.insertCell(3);
      var latency = row.insertCell(4);
      var trash = row.insertCell(5);

      address.innerHTML = node.ip;
      port.innerHTML = node.port;
      if(node.refreshed) {
        ip_status.innerHTML = (node.ip_status) ? '<i class="fa fa-circle" aria-hidden="true" style="color: green;"></i>' : '<i class="fa fa-circle" aria-hidden="true" style="color: red"></i>';
        port_status.innerHTML = (node.port_status) ? '<i class="fa fa-circle" aria-hidden="true" style="color: green;"></i>' : '<i class="fa fa-circle" aria-hidden="true" style="color: red"></i>';
        latency.innerHTML = node.latency;
      } else {
        ip_status.innerHTML = '<i class="fa fa-refresh fa-spin fa-fw" style="color: blue;"></i>';
        port_status.innerHTML = '<i class="fa fa-refresh fa-spin fa-fw" style="color: blue;"></i>';
        latency.innerHTML = '<i class="fa fa-refresh fa-spin fa-fw" style="color: blue;"></i>';
      }
      trash.innerHTML = '<i class="fa fa-trash" aria-hidden="true"></i>';

    });
  }
}

setInterval(function(){
  getter.open("GET", get_url, true);
  getter.send();
}, 3000);
