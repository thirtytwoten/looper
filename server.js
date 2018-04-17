let path = require('path');
let express = require('express');
let ExpressPeerServer = require('peer').ExpressPeerServer;
let ehbs = require('express-handlebars');

let port = process.argv[2] || 9000;
let app = express();
let hbs = ehbs.create({
  extname: '.hbs',
  defaultLayout: 'main',
  helpers: {},
  partiailsDir: 'views/partials'
});

let stationManager = require('./StationManager');
// stationManager.createStation('test', []);
// console.log(stationManager.stations);

let session = require('express-session');
app.use(session({secret:'secret-sauce', resave: false,
  saveUninitialized: true}));

app.use(express.static(path.join(__dirname, 'public')));
app.engine('hbs', hbs.engine);
app.set('view engine', 'hbs');

app.get('/', function (req, res) {
  req.session.userid = generateId();
  console.log(req.session.userid);
  res.render('central', {layout: false, session: JSON.stringify(req.session), stations: JSON.stringify(stationManager.stationData())});
});
app.get('/station/:stationid', function (req, res) {
  if(req.session.userid === req.params.stationid){
    // station owner -- create station
  } else {
    // station listener -- needs to connect
  }
  res.render('station', {layout: false, userid: req.session.userid, stationid: req.params.stationid});
});

let server = app.listen(port);
console.log(`app listening on port ${port}`);

app.use('/ps', ExpressPeerServer(server, {debug: true}));

let io = require('socket.io')(server);
io.on('connection', function(client) {
  console.log('client connected');

  // client.emit('sync', StationManager.stations);

  // client.on('createStation', function(station){
  //   StationManager.addStation(station);
  //   client.boradcast.emit('sync', StationManager.stations);
  // });

});

function generateId() {
  var str = "";
  var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for (var i = 0; i < 6; i++)
    str += possible.charAt(Math.floor(Math.random() * possible.length));

  return str;
}

