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
  req.session.userid = req.session.userid || generateId();
  res.render('central', {layout: false, userid: req.session.userid, stations: JSON.stringify(stationManager.stationData())});
});
app.get('/station/:stationid', function (req, res) {
  let ownerid = req.params.stationid;
  let station = stationManager.getStation(ownerid);
  if (req.session.userid === ownerid || station) {
    req.session.userid = req.session.userid || generateId();
    station = station || stationManager.createStation(ownerid);
    res.render('station', {layout: false, userid: req.session.userid, station: JSON.stringify(station.export())});
  } else {
    res.end(`station '${ownerid}' does not exist`);
  }
});

let server = app.listen(port);
console.log(`app listening on port ${port}`);

app.use('/ps', ExpressPeerServer(server, {debug: true}));

let io = require('socket.io')(server);
io.on('connection', function(client) {
  console.log('client connected');

  // client.emit('sync', stationManager.stations);

  // client.on('createStation', function(ownerid){
  //   stationManager.createStation(ownerid);
  //   client.broadcast.emit('sync', stationManager.stations);
  // });

  client.on('joinStation', function(stationownerid, userid){
    console.log(`joinStation: sid ${stationownerid}, uid {userid}`);
    stationManager.joinStation(stationownerid, userid);
    client.broadcast.emit('sync', stationManager.stations);
    console.log(stationManager.getStation(stationownerid).export());
  });

});

function generateId() {
  var str = "";
  var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for (var i = 0; i < 6; i++)
    str += possible.charAt(Math.floor(Math.random() * possible.length));

  return str;
}

