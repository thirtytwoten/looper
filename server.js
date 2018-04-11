let path = require('path');
let express = require('express');
let ExpressPeerServer = require('peer').ExpressPeerServer;
let ehbs = require('express-handlebars');

let port = process.argv[2] || 9000;
let stationManager = require('./StationManager');
//stubb
stationManager.createStation('bleepbloop', ['a', 'b', 'c', 'd']);
stationManager.createStation('bloppBLEEP', ['a2', 'b2', 'c2', 'd2']);

let app = express();
let hbs = ehbs.create({
  extname: '.hbs',
  defaultLayout: 'main',
  helpers: {},
  partiailsDir: 'views/partials'
});
app.engine('hbs', hbs.engine);
app.set('view engine', 'hbs');

let session = require('express-session');
app.use(session({secret:'secret-sauce',resave: false,
  saveUninitialized: true}));

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', function (req, res) {
  res.render('landing', { layout: 'min' });
});
app.get('/sess/:username', function (req, res) {
  req.session.username = req.params.username;
  console.log(req.session);
  res.redirect('/central');
});
app.get('/central', function (req, res) {
  res.render('central', { username: req.session.username, layout: 'min' });
});
app.get('/station/:name', function (req, res) {
  let name = req.params.name;
  station = stationManager.getStation(name);
  res.render('station', { station: JSON.stringify(station), username: req.session.username });
});
app.get('/matrix', function (req, res) {
  res.render('sound_matrix', { layout: 'min' });
});

let server = app.listen(port);

app.use('/ps', ExpressPeerServer(server, {debug: true}));

console.log(`app listening on port ${port}`);

let io = require('socket.io')(server);
io.on('connection', function(client) {
  console.log('client connected');
  client.emit('updateNetwork', `${stationManager.networkData()}`);

  client.on('createStation', function(stationName, userName){
    stationManager.createStation(stationName, [userName]);
    //client.emit('updateNetwork', `${stationManager.networkData()}`);
  });

  client.on('joinStation', function(stationName, userName){
    let status = stationManager.joinStation(stationName, userName);
    //client.emit('updateNetwork', `${stationManager.networkData()}`);
  });

});

