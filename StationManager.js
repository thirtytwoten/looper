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

function stationData() {
  let arr = [];
  stations.forEach((s)=>{
    arr.push({
      station_name: s.name,
      host_id: s.name,
      connected_peers: s.connectedPeers.length,
      beats_per_minute: 120,
      loop_cycle: 16
    });
  });
  //return arr;
  return [
    {
      station_name: 'jazz',
      host_id: 'ysdo23p',
      connected_peers: ['sdlkjf2', 'JSDDsee8', 'sdijfs8A'],
      beats_per_minute: 120,
      loop_cycle: 16
    },
    {
      station_name: 'hiphop',
      host_id: 'ysdo23p',
      connected_peers: ['sdlkjf2', 'JSDDsee8', 'sdijfs8A', 'sdfsd8s'],
      beats_per_minute: 120,
      loop_cycle: 16
    },
    {
      station_name: 'bleepblop',
      host_id: 'ysdo23p',
      connected_peers: ['sdlkjf2', 'scoobydoo', 'sdijfs8A', 'sdfsd8s', 'LSSJ383'],
      beats_per_minute: 120,
      loop_cycle: 16
    },
    {
      station_name: 'garage',
      host_id: 'ysdo23p',
      connected_peers: ['sdlkjf2', 'JSDDsee8', 'sdijfs8A', 'sdfsd8s'],
      beats_per_minute: 160,
      loop_cycle: 40
    },
    {
      station_name: 'house',
      host_id: 'ysdo23p',
      connected_peers: ['sdlkjf2', 'sdfsd8s'],
      beats_per_minute: 120,
      loop_cycle: 32
    },
    {
      station_name: 'classic',
      host_id: 'ysdo23p',
      connected_peers: ['sdlkjf2', 'asdfs8292', 'sdijfs8A', 'sdfsd8s', 'sldkfjssfis', 'SJS8303', 'sodidjs2324', '23094j'],
      beats_per_minute: 90,
      loop_cycle: 24
    },
    {
      station_name: 'r&b',
      host_id: 'ysdo23p',
      connected_peers: ['sdlkjf2', 'SJS8303'],
      beats_per_minute: 90,
      loop_cycle: 16
    },
    {
      station_name: 'country',
      host_id: 'ysdo23p',
      connected_peers: ['SJS8303'],
      beats_per_minute: 84,
      loop_cycle: 16
    },
    {
      station_name: 'purple',
      host_id: 'ysdo23p',
      connected_peers: ['hdid92RRwq'],
      beats_per_minute: 84,
      loop_cycle: 16
    }
  ];
}

module.exports = {
  stations, getStation, createStation, joinStation, leaveStation, removeStation, networkData, stationData
}
