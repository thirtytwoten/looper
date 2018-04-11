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

app.engine('hbs', hbs.engine);
app.set('view engine', 'hbs');

app.use(express.static(path.join(__dirname, 'public')));
app.get('/', function (req, res) {
  res.render('central', {layout: 'main2', stations: JSON.stringify(stationManager.stationData())});
});
app.get('/station', function (req, res) {
  res.render('station2', {
  });
});

let server = app.listen(port);
console.log(`app listening on port ${port}`);

app.use('/ps', ExpressPeerServer(server, {debug: true}));

let stationManager = require('./StationManager');
// stationManager.createStation('test', []);
// console.log(stationManager.stations);

let io = require('socket.io')(server);
io.on('connection', function(client) {
  console.log('client connected');

  // client.emit('sync', StationManager.stations);

  // client.on('createStation', function(station){
  //   StationManager.addStation(station);
  //   client.boradcast.emit('sync', StationManager.stations);
  // });

});

