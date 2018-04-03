var express = require('express');
var app = express();
var ExpressPeerServer = require('peer').ExpressPeerServer;

app.get('/', function(req, res, next) { res.send('Hello world!'); });

var server = app.listen(9000);

var options = {
    debug: true
}

app.use('/ps', ExpressPeerServer(server, options));