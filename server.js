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
  res.render('central', {
    // template vars
  });
});
app.get('/station', function (req, res) {
  res.render('station', {
    // template vars
  });
});

let server = app.listen(port);
console.log(`app listening on port ${port}`);

let options = {
    debug: true
}

app.use('/ps', ExpressPeerServer(server, options));

let StationServer = {
  stations: []
}

// const io = require('socket.io')(server, {
//   path: '/ss',
//   // serveClient: false,
//   // // below are engine.IO options
//   // pingInterval: 10000,
//   // pingTimeout: 5000,
//   // cookie: false
// });


let io = require('socket.io')(server);
io.on('connection', function(client) {
  console.log('client connected');

  // let syncRate = 100;
  // setInterval(function(){
  //   let gameData = game.getData()
  //   client.emit('sync', gameData);
  //   client.broadcast.emit('sync', gameData);
  // }, syncRate);

  // //send existing information out to client
  // client.emit('sync', game.getData());

  // client.on('joinGame', function(finger){
  //   console.log(finger.playerName + ' joined the game');
  //   client.emit('addPlayer', { playerName: finger.playerName, isLocal: true } ); //// client can just call this?
  //   //client.broadcast.emit('addPlayer', { playerName: finger.playerName, isLocal: false } );
  //   //^should be picked up in sync calls
  // });

  // client.on('sync', function(data){
  //   if(data.finger){
  //     game.syncFinger(data.finger);
  //     //Broadcast data to clients
  //     // client.emit('sync', game.getData());
  //     // client.broadcast.emit('sync', game.getData());
  //   }
  // });

  // client.on('leaveGame', function(fingerName){
  //   console.log(fingerName + ' has left the game');
  //   game.removeFinger(fingerName);
  //   //client.broadcast.emit('removeFinger', fingerName); // should automatically be removed when it is not in the sync data
  // });

});

