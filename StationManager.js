class StationManager {
  constructor(stations){
    this.stations = stations || [];
  }

  getStation(stationId){
    return this.stations.find((s) => s.id === stationId);
  }

  getIndex(stationId){
    return this.stations.findIndex((s) => s.id === stationId);
  }

  addStation(station) {
    if(this.getIndex(station.id) > 0){
      // station with that id already exists
      return 0;
    } else {
      this.stations.push(station);
      return 1;
    }
    
  }

  removeStation(stationId) {
    this.stations.splice(this.getIndex(stationId), )
    delete this.getStation(stationId);
  }
}

module.exports = StationManager;