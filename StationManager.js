let stations = [];
let n = 0;

class Station {
  constructor(name, connectedPeers){
    this.id = n++;
    this.name = name;
    this.connectedPeers = connectedPeers;
    this.createdAt = Date.now();
  }

  host(){
    return this.connectedPeers[0];
  }

  age(){
    return Date.now() - this.createdAt;
  }

  join(nodeId) {
    this.connectedPeers.push(nodeId);
  }

  leave(nodeId) {
    let i = this.connectedPeers.indexOf(nodeId);
    this.connectedPeers.splice(i,1);
    return this.connectedPeers.length;
  }
}

function createStation(name, connectedPeers) {
  stations.push(new Station(name, connectedPeers));
}

function getStation(stationId){
  return stations.find((s) => s.id === stationId);
}

function getIndex(stationId){
  return stations.findIndex((s) => s.id === stationId);
}

function removeStation(stationId) {
  stations.splice(this.getIndex(stationId), )
  delete getStation(stationId);
}

function joinStation(nodeId, stationId) {
  getStation(stationId).join(nodeId);
}

function leaveStation(nodeId, stationId) {
  let station = getStation(stationId);
  if (station.leave(nodeId) < 1) {
    removeStation(stationId);
  }
}

function networkData() {
  let json = {nodes: [], links: []};
  stations.forEach((s)=>{
    let hostName = s.host();
    s.connectedPeers.forEach((p)=>{
      if(p === hostName){
        json.nodes.push({id: p, group: s.id, host: true });
      } else {
        json.nodes.push({id: p, group: s.id, host: false });
        json.links.push({source: p, target: hostName, value: 1});
      }
    });
  });
  return JSON.stringify(json);
}

module.exports = {
  stations, getStation, createStation, joinStation, leaveStation, removeStation, networkData
}
