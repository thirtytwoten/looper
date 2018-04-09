let stations = [];

function getStation(stationId){
  return stations.find((s) => s.id === stationId);
}

function getIndex(stationId){
  return stations.findIndex((s) => s.id === stationId);
}

function addStation(station) {
  if(getIndex(station.id) > 0){
    // station with that id already exists
    return 0;
  } else {
    stations.push(station);
    return 1;
  }
  
}

function removeStation(stationId) {
  stations.splice(this.getIndex(stationId), )
  delete getStation(stationId);
}

module.exports = {
  stations, getStation, addStation, removeStation
}
