// station.js - data structure to keep track of station info on the front end
// (similar to the Station class in StationManager.js, but that is in the back end)

// loaded on station.hbs   <script type="text/javascript" src="../station.js"></script>
//   let station = new Station(stationData, null);
//                                            ^
// (right now this doesn't have soundBoard functionality, but would be cool to integrate SoundMatrix functionality

class Station {
  constructor(station, soundBoard){
    this.ownerid = station.ownerid;
    this.connectedPeers = station.connectedPeers;
    this.soundBoard = soundBoard;
    this.name = station.name;
    this.createdAt = station.createdAt;
  }

  age(){
    return Date.now() - this.createdAt;
  }

  join(user) {
    user.connect(this.ownerid);
    if(!this.connectedPeers.find((p) => p === user.userid)){
      this.connectedPeers.push(user.userid);
    }
    serverLink.emit('joinStation', this.ownerid, user.userid);
  }

  leave(nodeId) {
    let i = this.connectedPeers.indexOf(nodeId);
    if(i > -1){
      this.connectedPeers.splice(i,1);
    }
  }

}
