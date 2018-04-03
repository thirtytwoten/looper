// dependent on peer.js

let peerServerInfo = {host: 'localhost', port: 9000, path: '/ps'};

class Node {
  constructor(nodeId){
    this.node = new Peer(nodeId, peerServerInfo);
    this.configureNode(this.node);
    this.connections = [];
  }

  configureNode(n) {
    n.on('error', (err) => {
      console.log(err);
    });
    n.on('open', (id) => {
      console.log('open - id: ' + id);
    });
    n.on('connection', (c) => {
      console.log('connection: ' + c.peer);
      if(!this.connections.includes(c.peer)){
        // make back&forth connection
        this.connect(c.peer);
      }
      c.on('data', (data) => {
        // console.log('data: ' + data);
        let d = JSON.parse(data);
        if(d.type === 'msg'){
          displayMsg(c.peer, d.data);
        } else if (d.type === 'seqChange'){
          updateSeq(d.data);
          displayMsg(c.peer, `[${d.data.column},${d.data.row}] -> ${d.data.state}`);
        } 
      });
      c.on('close', () => {
        displayMsg(c.peer, ' has left');
        let i = this.connections.indexOf(c.peer);
        if (i > -1) {
          this.connections.splice(i, 1);
        }
        
      });
    });
  }

  connect(nodeId) {
    let c = this.node.connect(nodeId);
    this.connections.push(c.peer);
    //e.g. w/ options...
      // var c = peer.connect(requestedPeer, {
      //     label: 'chat',
      //     serialization: 'none',
      //     metadata: {message: 'hi i want to chat with you!'}
      //   });
  }

  transmitMsg(nodeId, msg) {
    this.transmit(nodeId, {type: 'msg', data: msg})
  }

  transmitSeqChange(nodeId, data) {
    this.transmit(nodeId, {type: 'seqChange', data: data});
  }

  transmit(nodeId, data) {
    let str = JSON.stringify(data);
    let conns = this.node.connections[nodeId];
    for (let i = 0; i < conns.length; i++){
      conns[i].send(str);
    }
  }
}

function displayMsg(peerId, msg){
  $('ul#chat').append(`<li>${peerId}: ${msg}</li>`);
}

function generateId() {
  var str = "";
  var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for (var i = 0; i < 6; i++)
    str += possible.charAt(Math.floor(Math.random() * possible.length));

  return str;
}
