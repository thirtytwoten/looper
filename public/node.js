// dependent on peer.js

let peerServerInfo = {host: 'localhost', port: 9000, path: '/ps'};
let MAX_CONN = 5;

class Node {
  constructor(nodeId){
    this.node = new Peer(nodeId, peerServerInfo);
    this.configureNode(this.node);
	this.host_station = nodeId;
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
          displayMsg(c.peer, d.data);
        } else if (d.type === 'seqChange'){
          updateSeq(d.data);
          displayMsg(c.peer, `set [${d.data.row},${d.data.column}] to ${d.data.state}`);
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
	  
	//let c = this.node.connect(nodeId);
	//this.connections.push(c.peer);
	
	let target_conns = this.node.connections[nodeId];
	if (target_conns) {
		let size_msg = "Number of peers connected: " + target_conns.length;
		console.log(size_msg);
	}
	if (!target_conns || (target_conns.length < MAX_CONN)) {
		let c = this.node.connect(nodeId);
		this.connections.push(c.peer);
		let msg = "Connected directly to station: " + nodeId;
		console.log(msg); 
	} else {
		// Perform BFS to find listening peer with space
		var has_found = false;
		var queue = [nodeId];
		while (queue.length > 0) {
			let temp_node = queue.shift();
			let temp_conns = this.node.connections[temp_node];
			
			if (!temp_conns || (temp_conns.length < MAX_CONN)) {
				let c = this.node.connect(temp_node);
				this.connections.push(c.peer);
				this.host_station = nodeId;
				let msg = "Connected to peer: " + temp_node + " With host station: " + nodeId;
				console.log(msg);
				has_found = true;
				break;
			}

			for (let i = 0; i < temp_conns.length; i++) {
			   queue.push(temp_conns[i].peer);
			}
			
		}
		if (!has_found) {
			console.log("Error, all peers in this station are at Capacity");
		}
		
	}
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

function generateId() {
  var str = "";
  var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for (var i = 0; i < 6; i++)
    str += possible.charAt(Math.floor(Math.random() * possible.length));

  return str;
}
