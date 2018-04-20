// user.js - creates a peer.js node for each user on the site
// loaded on station.hbs   <script type="text/javascript" src="../user.js"></script>
// dependent on peer.js, e.g.
//   this.node = new Peer(userid, peerServerInfo);
//                   ^ Peer defined in peer.js
//   which means in station.hbs this file must be included after the peer.js file for it to work


let peerServerInfo = {host: window.location.hostname , port: window.location.port, path: '/ps'};

class User {
  constructor(userid){
    this.node = new Peer(userid, peerServerInfo);
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
        let d = JSON.parse(data);
        if(d.type === 'msg'){
          console.log('data: ' + data);
          displayMsg(c.peer, d.data); // function in station.hbs
        } else if (d.type === 'seqChange'){
          updateSeq(d.data); // function in station.hbs
          displayMsg(c.peer, `set [${d.data.row},${d.data.column}] to ${d.data.state}`); // function in station.hbs
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

  getId() {
    return this.node.id;
  }
}
