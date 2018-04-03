let express = require('express');
let app = express();
let ExpressPeerServer = require('peer').ExpressPeerServer;

app.get('/', function(req, res, next) { res.send('Hello world!'); });

let server = app.listen(9000);

let options = {
    debug: true
}

app.use('/ps', ExpressPeerServer(server, options));