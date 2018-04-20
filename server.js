// server.js: node.js server using express, handlebars
//   see https://nodejs.org/en/docs/guides/getting-started-guide/
// start server by running 'node server [port#]' from root directory
// this is the heart of backend code
// sets up the server, listens for requests, responds with html  

// import custom module StationManager.js
let stationManager = require('./StationManager');

// set up express web server using handlebars view engine
// handlebar allows us to make views with {{javascript}} embedded in the html
//   on each page request the server generates the html file by
//   stitching together the handlebar views/layouts/partials and executing the embedded javascript.
//   The server responds with a html file that the client's browser renders to their screen
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
// by saving a userid as a session variable (req.session.userid)
let session = require('express-session');
app.use(session({secret:'secret-sauce', resave: false,
  saveUninitialized: true}));



/*** ROUTING ***/
// handles http requests using express
// see http://expressjs.com/en/guide/routing.html
// e.g. app.get([path], [function that handles a request (req) and returns a response (res)])

// homepage, when user visits base url (e.g. localhost:9000)
app.get('/', function (req, res) {
  // sets userid session variable if one doesn't exist
  req.session.userid = req.session.userid || generateId();
  // render the central view (views/central.hbs) passing in the userid and the data for all of the stations
  res.render('central', {layout: false, userid: req.session.userid, stations: JSON.stringify(stationManager.stationData())});
});

// render station page identified by the :stationid (the userid of the owner)
// so if you went to the page localhost:9000/station/user123 
//    it would load station owned by user123 if it exists
app.get('/station/:stationid', function (req, res) {
  // assign userid if one does not exist
  req.session.userid = req.session.userid || generateId();
  // set the owner id from the :stationid param
  let ownerid = req.params.stationid;
  // find the station if it exists
  let station = stationManager.getStation(ownerid);
  if (!station && req.session.userid === ownerid) {
    // if station does not exist but is supposed to be current user's station, create the station
    station = stationManager.createStation(ownerid);
  }
  if (station) {
    // render the station view (views/station.hbs), passing in the station and user info
    res.render('station', {layout: false, userid: req.session.userid, station: JSON.stringify(station.export())});
  } else {
    // station does not exist, bad url, respond with error code
    res.end(`station '${ownerid}' does not exist`);
    // TODO: redirect to homepage
  }
});



/*** tell server to start listening to incoming requests on a given port ***/
// set port to 9000 as default or first command line argument
// (e.g. running `node server 3000` would run the app on port 3000)
let port = process.argv[2] || 9000;
let server = app.listen(port);
console.log(`app listening on port ${port}`);


/*** EXPRESS PEER SERVER ***/
// set up express peer server which handles connections
//   used by peer.js in the front end
let ExpressPeerServer = require('peer').ExpressPeerServer;
app.use('/ps', ExpressPeerServer(server, {debug: true}));


/*** SOCKET IO ***/
// Set up socket io - creates a direct connection to the client and server.
// Without this the server only sends information when the page is first loaded,
// but with socket io we can write front end code that interacts with the server on the fly
//   and can get updates without refreshing the page
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


/*** HELPERS ***/
// generates random id for the userid
function generateId() {
  var str = "";
  var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for (var i = 0; i < 6; i++)
    str += possible.charAt(Math.floor(Math.random() * possible.length));
  return str;
}

