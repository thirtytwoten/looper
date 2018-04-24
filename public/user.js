// user.js - creates a peer.js node for each user on the site
// loaded on station.hbs   <script type="text/javascript" src="../user.js"></script>
// dependent on peer.js, e.g.
//   this.node = new Peer(userid, peerServerInfo);
//                   ^ Peer defined in peer.js
//   which means in station.hbs this file must be included after the peer.js file for it to work


let peerServerInfo = {host: window.location.hostname , port: window.location.port, path: '/ps'};

class User {
  constructor(userid, stationid){
    this.userid = userid;
    this.stationid = stationid;
    this.stationOwner = userid === stationid;
    this.node = new Peer(userid, peerServerInfo);
    this.configureNode(this.node);
    this.connections = [];
	//this.hostStation = stationid;
	//this.isStation = false;
	// This will be a dictionary, and each node will have one.
	// key : userID of a node connected to this one
	// value : List of latencies (ms), for all communications between "key" and this node.
	this.latencies = {};
	
	// Similarly above, but tracks throughput (size of packets) from connected peers.
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
        // Handle latency measurements
        d["receivedAt"] = Date.now();
        d["latency"] = d.receivedAt - d.sentAt;
        let sender = d.sentBy;
        this.latencies[sender].push(d.latency);
        this.throughput[sender].push(d.payload);
      
        if(d.type === 'msg'){
          displayMsg(d.author, d.data); // function in station.hbs
          if(this.stationOwner) { // propegate to other nodes if station owner
            this.connections.forEach( (nodeid) => {
              this.transmit(nodeid, d);
            });
          }
        } else if (d.type === 'seqChange'){
          updateSeq(d.data);
        } else if(d.type === 'PianoClick'){
          console.log('Pianodata: ' + data);
          pianoClick(d.data); // function in station.hbs
        } else if(d.type === 'PianoPress'){
          pianoKeyPress(d.author, d.keyCode, false); // function in station.hbs
        } else if(d.type === 'PianoRelease'){
          pianoKeyRelease(d.author, d.keyCode, false); // function in station.hbs
        } else if (d.type === 'seqInit'){
          console.log('seqInit event');
          initSeq(d.data); // function in station.hbs
        }
        // Handle Latency measurements
        /* Commented out since we have not implemented "station nodes"
        if (this.node.isStation) {
          this.node.latencies[sender].push(data.latency);
        }*/
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
    this.latencies[c.peer] = [];
    this.throughput[c.peer] = [];
    if (this.stationOwner) {
      // hack to make init happen after connection is formed -- TODO fix this
      setTimeout(()=>{this.transmitInitData(c.peer, matrix.getPattern()), 2000});
    }
  }

  chat(msg) {
    if(this.stationOwner){
      // if station owner, log and propegate to all users
      displayMsg(this.userid, msg);
      this.connections.forEach( (nodeid) => {
        this.transmit(nodeid, {type: 'msg', data: msg, author: this.userid});
      });
    } else {
      // only send to station owner (who will propegate out and back [log msg when it comes back])
      this.transmit(this.stationid, {type: 'msg', data: msg, author: this.userid});
    }
  }

  transmitSeqChange(nodeId, data) {
    this.transmit(nodeId, {type: 'seqChange', data: data});
  }

  transmitSeqChangeLog(nodeId, data) {
    this.transmit(nodeId, {type: 'LogData', data: data});
  }

  transmitInitData(nodeId, pattern) {
    this.transmit(nodeId, {type: 'seqInit', data: pattern})
  }

  transmitPianoClick(nodeId, Id) {
    this.transmit(nodeId, {type: 'PianoClick', data: Id})
  }

  transmitPianoPress(nodeId, keyCode) {
    this.transmit(nodeId, {type: 'PianoPress', keyCode: keyCode, author: this.userid});
  }

  transmitPianoRelease(nodeId, keyCode) {
    this.transmit(nodeId, {type: 'PianoRelease', keyCode: keyCode, author: this.userid});
  }

  transmit(nodeId, data) {
    data["sentAt"] = Date.now();
    data["sentBy"] = this.userid;
	
    // This is questionable...size of data calculated before assigning it.
    let datSize = this.dataSize(data);
    data["payload"] = datSize;
	
    // Send the data to connected peers.
    let str = JSON.stringify(data);
    let conns = this.node.connections[nodeId];
    for (let i = 0; i < conns.length; i++){
      conns[i].send(str);
    }
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
