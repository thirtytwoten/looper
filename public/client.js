let io = require('socket.io-client');
let socket = io.connect(`${window.location.hostname}:${window.location.port}`);

socket.on('connect', function(){console.log(`socket connected`)});
socket.on('event', function(data){console.log(`event: ${data}`)});
socket.on('disconnect', function(){console.log(`socket disconnected`)});

