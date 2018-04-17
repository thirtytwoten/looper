let serverLink = io.connect(`${window.location.hostname}:${window.location.port}`);

serverLink.on('connect', function(){console.log(`socket connected`)});
serverLink.on('event', function(data){console.log(`event: ${data}`)});
serverLink.on('disconnect', function(){console.log(`socket disconnected`)});

serverLink.on('sync', function(data){console.log(data)});
