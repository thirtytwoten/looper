let stations = [];

class Station {
  constructor(name, connectedPeers){
    this.id = name;
    this.name = name;
    this.connectedPeers = connectedPeers;
    this.createdAt = Date.now();
  }

  host(){
    return connectedPeers[0];
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

module.exports = {
  stations, getStation, addStation, removeStation
}
