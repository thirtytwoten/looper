let stations = [];
let n = 0;

class Station {
  constructor(ownerid){
    this.ownerid = ownerid;
    this.connectedPeers = [];
    this.group = n++; //for network layout
    this.name = `station-${ownerid}`;
    this.createdAt = Date.now();
  }

  owner(){
    return this.ownerid;
  }

  age(){
    return Date.now() - this.createdAt;
  }

  join(nodeId) {
    this.connectedPeers.push(nodeId);
  }

  leave(nodeId) {
    let i = this.connectedPeers.indexOf(nodeId);
    if(i > -1){
      this.connectedPeers.splice(i,1);
    }
  }
}

function createStation(ownerid) {
  stations.push(new Station(ownerid));
}

function getStation(ownerid){
  return stations.find((s) => s.ownerid === ownerid);
}

function getIndex(ownerid){
  return stations.findIndex((s) => s.ownerid === ownerid);
}

function removeStation(ownerid) {
  stations.splice(this.getIndex(ownerid), 1);
}

function joinStation(ownerid, userid) {
  getStation(ownerid).join(userid);
}

function leaveStation(ownerid, userid) {
  getStation(ownerid).leave(userid);
}

function networkData() {
  // let json = {nodes: [], links: []};
  // stations.forEach((s)=>{
  //   let hostName = s.host();
  //   s.connectedPeers.forEach((p)=>{
  //     if(p === hostName){
  //       json.nodes.push({id: p, group: s.group, host: true });
  //     } else {
  //       json.nodes.push({id: p, group: s.group, host: false });
  //       json.links.push({source: p, target: hostName, value: 1});
  //     }
  //   });
  // });
  // return JSON.stringify(json);
}

function stationData() {
  let arr = [];
  stations.forEach((s)=>{
    arr.push({
      name: s.name,
      ownerid: s.ownerid,
      connectedPeers: s.connectedPeers,
      beats_per_minute: 120,
      loop_cycle: 16
    });
  });
  return arr;
}

module.exports = {
  stations, getStation, createStation, joinStation, leaveStation, removeStation, networkData, stationData
}
