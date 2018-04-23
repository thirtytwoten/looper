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
    
    // These will be dictionaries holding relevant statistical data for peers.
    // "key" : Node ID of peers connected to this node.
    // "value" : list of measurements for all communications between "key" and this node.
    this.latencies = {};
    this.throughput = {};
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
        d.receivedAt = Date.now();
        d.latency = d.receivedAt - d.sentAt;
        let sender = d.sentBy;
        this.latencies[sender].push(d.latency);
        this.throughput[sender].push(d.payload);
        if(d.type === 'msg'){
          console.log('data: ' + data);
          displayMsg(c.peer, d.data); // function in station.hbs
        } else if (d.type === 'seqChange'){
          updateSeq(d.data);
          displayLog(c.peer, `set [${d.data.row},${d.data.column}] to ${d.data.state}`);
        }
        this.showLatency();
        this.showThroughput();
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
    
    // Add new peers to dictionary of statistical data.
    this.latencies[c.peer] = [];
    this.throughput[c.peer] = [];
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
    data["sentAt"] = Date.now();
    data["sentBy"] = this.node.id;
    
    // This is questionable...size of data calculated before assigning it to data.
    let datSize = this.dataSize(data);
    data["payload"] = datSize;
    
    // Send data to connected peers.
    let str = JSON.stringify(data);
    let conns = this.node.connections[nodeId];
    for (let i = 0; i < conns.length; i++){
      conns[i].send(str);
    }
  }

  getId() {
    return this.node.id;
  }
  
  // Need to check logic of these two...returns bits or bytes ???
  // Want bits(?) for Bandwidth
  bytes(s){
	return ~-encodeURI(s).split(/%..|./).length;
  }

  dataSize(s){
    return this.bytes(JSON.stringify(s));
  }
  
  showLatency() {
	console.log("Observed Latencies: " + JSON.stringify(this.latencies));
  }
  
  showThroughput() {
	console.log("Observed Throughput: " + JSON.stringify(this.throughput));
  }
}
