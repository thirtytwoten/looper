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
    this.connectedPeers.push(user.getId());
    serverLink.emit('joinStation', this.ownerid, user.getId());
  }

  leave(nodeId) {
    let i = this.connectedPeers.indexOf(nodeId);
    if(i > -1){
      this.connectedPeers.splice(i,1);
    }
  }

}
