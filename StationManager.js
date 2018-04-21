// StationManager - custom node.js module keep track of stations and their configurations
//
// imported in server.js: (let stationManager = require('./StationManager');)
// e.g. called in when stations are created (station = station || stationManager.createStation(ownerid);)
// e.g. called when users join a station (stationManager.joinStation(stationownerid, userid);)

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

  // time that the station has been active
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

  // condenses the data of the station into a JSON object
  export() {
    return {
      name: this.name,
      ownerid: this.ownerid,
      connectedPeers: this.connectedPeers,
      createdAt: this.createdAt,
      beats_per_minute: 120,
      loop_cycle: 16
    }
  }
}

function createStation(ownerid) {
  let station = new Station(ownerid);
  stations.push(station);
  return station;
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
  let station = getStation(ownerid)
  if(station){
    station.join(userid);
  } else {
    console.log(`cannot find station-#{ownerid}`);
  }
}

function leaveStation(ownerid, userid) {
  getStation(ownerid).leave(userid);
}

// this was used for the network layout of the homepage, work in progress
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

// export all of data of all of the stations as a json array
function stationData() {
  let arr = [];
  stations.forEach((s)=>{
    arr.push(s.export());
  });
  return arr;
}

// when modules are imported (like this one is imported in server.js)
// the importer can only call what is explicitly defined below
// for example server.js cannot call stationManager.n unless we added n to the list below
//   but it can call stationManager.createStation because that method was exported in the module
module.exports = {
  stations, getStation, createStation, joinStation, leaveStation, removeStation, networkData, stationData
}
