// dependent on peer.js

let peerServerInfo = {host: 'localhost', port: 9000, path: '/'};

class Node {
  constructor(nodeId){
    this.node = new Peer(nodeId, peerServerInfo);
    this.configureNode(this.node);
  }

  configureNode(n) {
    n.on('error', function(err){
      console.log('error: ' + err);
    });
    n.on('open', function(id){
      console.log('open - id: ' + id);
    });
    n.on('connection', function(c){
      console.log('connection: ' + c);
      c.on('data', function(data){
        console.log('data: ' + data);
      });
      c.on('close', function(){
        alert(c.peer + ' has left');
      });
    });
  }

  connect(nodeId) {
    this.node.connect(nodeId);
    //e.g. w/ options...
      // var c = peer.connect(requestedPeer, {
      //     label: 'chat',
      //     serialization: 'none',
      //     metadata: {message: 'hi i want to chat with you!'}
      //   });
  }

  transmitMsg(nodeId, msg) {
    let conns = this.node.connections[nodeId];
    for (let i = 0; i < conns.length; i++){
      conns[i].send(msg);
    }
  }
}
