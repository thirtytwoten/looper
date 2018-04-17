// require Nexus, Tone

class Sound {
  constructor(type, name) {
    this.type = type;
    this.name = name;
  }

  play() {
    console.log(`Sound: play ${this.name}(${this.type})`);
  }

}

class Sample extends Sound {
  constructor(name, src){
    super('sample', name);
    this.player = new Tone.Player({
      url: src,
      volume: -10,
      fadeOut : "64n"
    }).toMaster();
  }

  play(t) {
    // console.log(`Sample: play ${this.name}`);
    if(this.player.state === 'stopped') {
      this.player.start(t, 0, "32n");
    } else {
      //this.player.restart(t, 0, "32n");
    }
    
  }
}

class PianoNote extends Sound {
  constructor(name){
    super('pianoKey', name);
  }

  play() {
    console.log(`PianoKey: play ${this.name}`);
    var dist = new Tone.Distortion(2).toMaster();
    var synth = new Tone.Synth().connect(dist);
    synth.triggerAttackRelease(this.name, "8n");
  }
}

class SoundMatrix {
  constructor(divId, sounds=[], context, beatLength=16, bpm=120){
    this.divId = divId;
    this.sounds = sounds;
    this.beatLength = beatLength;
    this.bpm = bpm;
    this.sequencer = null;
    this.loop = null;

    Nexus.context = context;
    this.createSequencer(`#${divId}`);
  }

  createSequencer(selector) {
    this.sequencer = new Nexus.Sequencer( selector, {
     'size': [800,200],
     'mode': 'toggle',
     'rows': this.sounds.length,
     'columns': this.beatLength
    });
    this.loop = new Tone.Sequence((time, col)=>{
      this.playBeat(time, col);
    }, [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15], "16n");
    Tone.Transport.start();
  }

  playBeat(time, col) {
    let rows = this.sequencer.matrix.pattern;
    rows.forEach((row,i)=> {
      if(row[col] === true) {
        this.sounds[i].play(time);
      }
    });
    this.sequencer.next();
  }

  start() {
    this.loop.start();
  }

  stop() {
    this.loop.stop();
  }

}
