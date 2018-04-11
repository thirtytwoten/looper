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

function getStation(stationName){
  return stations.find((s) => s.name === stationName);
}

function getIndex(stationName){
  return stations.findIndex((s) => s.name === stationName);
}

function removeStation(stationName) {
  stations.splice(this.getIndex(stationName), 1);
}

function joinStation(stationName, userName) {
  getStation(stationName).join(userName);
}

function leaveStation(stationName, userName) {
  let station = getStation(stationName);
  if (station.leave(userName) < 1) {
    removeStation(stationName);
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
