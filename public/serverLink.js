// serverLink.js - socket.io connection links from the front-end client to the server
//
// see https://socket.io/
//
// example used in join method of Station class...
//   public/station.js:    serverLink.emit('joinStation', this.ownerid, user.getId());
// and picked up by server
//   server.js:            client.on('joinStation', function(stationownerid, userid){...});


let serverLink = io.connect(`${window.location.hostname}:${window.location.port}`);

serverLink.on('connect', function(){console.log(`socket connected`)});
serverLink.on('event', function(data){console.log(`event: ${data}`)});
serverLink.on('disconnect', function(){console.log(`socket disconnected`)});

serverLink.on('sync', function(data){
  console.log('sync: ' + JSON.stringify(data));
  updatePeerList(data[0].connectedPeers);
});
