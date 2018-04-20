let stationManager = require('./StationManager');


// set up express web server using handlebars view engine
let path = require('path');
let express = require('express');
let ehbs = require('express-handlebars');
let app = express();
let hbs = ehbs.create({
  extname: '.hbs',
  defaultLayout: 'main',
  helpers: {},
  partiailsDir: 'views/partials'
});
app.use(express.static(path.join(__dirname, 'public')));
app.engine('hbs', hbs.engine);
app.set('view engine', 'hbs');

// set up express-session,
// so that we can keep track of each visitor to the site
// by saving a userid as a session variable
let session = require('express-session');
app.use(session({secret:'secret-sauce', resave: false,
  saveUninitialized: true}));

/* ROUTING */
// render 'central' view when user visits base url
app.get('/', function (req, res) {
  req.session.userid = req.session.userid || generateId();
  res.render('central', {layout: false, userid: req.session.userid, stations: JSON.stringify(stationManager.stationData())});
});
// render station page identified by the station id (the userid of the owner)
// so if you went to the page looper.com/station/user123 
//    it would load user123 station if it exists
app.get('/station/:stationid', function (req, res) {
  let ownerid = req.params.stationid;
  let station = stationManager.getStation(ownerid);
  // check if visiting user is the station owner and check if station exists 
  if (req.session.userid === ownerid || station) {
    req.session.userid = req.session.userid || generateId(); // assign userid if one does not exist
    station = station || stationManager.createStation(ownerid); // make station if station does not exist (current user is owner)
    res.render('station', {layout: false, userid: req.session.userid, station: JSON.stringify(station.export())}); // render station view
  } else {
    // if no station exists and the visiting user is not the owner (render an error)
    // TODO: redirect back
    res.end(`station '${ownerid}' does not exist`);
  }
});

// set port to 9000 as default or first command line argument
// (running `node server 3000` would run the app on port 3000)
let port = process.argv[2] || 9000;
let server = app.listen(port);
console.log(`app listening on port ${port}`);

// set up express peer server which handles connections
// used by peer.js in the front end
let ExpressPeerServer = require('peer').ExpressPeerServer;
app.use('/ps', ExpressPeerServer(server, {debug: true}));


// set up socket io, creates a direct connection to the client and server
// without this the server only updates on page load
// but with socket io we can write front end code that interacts with the server
//   and can make changes on the spot without page load
let io = require('socket.io')(server);
io.on('connection', function(client) {
  console.log('client connected');

  // client.emit('sync', stationManager.stations);

  // client.on('createStation', function(ownerid){
  //   stationManager.createStation(ownerid);
  //   client.broadcast.emit('sync', stationManager.stations);
  // });

  // when a user joins a station they fire this method
  //   so that the stationManager can update with accurate info about the stations
  client.on('joinStation', function(stationownerid, userid){
    console.log(`joinStation: sid ${stationownerid}, uid {userid}`);
    stationManager.joinStation(stationownerid, userid);
    client.broadcast.emit('sync', stationManager.stations);
    console.log(stationManager.getStation(stationownerid).export());
  });

});


// generates random id for the userid
function generateId() {
  var str = "";
  var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for (var i = 0; i < 6; i++)
    str += possible.charAt(Math.floor(Math.random() * possible.length));
  return str;
}

