import RingBuffer from "ringbufferjs";
import { handleError } from "./utils";

export default class SlaveSpeakers {
  constructor() {
    this.buffer = []
  }

  getSampleRate() {
    if (!window.AudioContext) {
      return 44100;
    }
    let myCtx = new window.AudioContext();
    let sampleRate = myCtx.sampleRate;
    myCtx.close();
    return sampleRate;
  }

  start() {
    // Audio is not supported
    if (!window.AudioContext) {
      return;
    }
    this.audioCtx = new window.AudioContext();
    this.scriptNode = this.audioCtx.createScriptProcessor(1024, 0, 2);
    this.scriptNode.onaudioprocess = this.onaudioprocess;
    this.scriptNode.connect(this.audioCtx.destination);
  }

  stop() {
    if (this.scriptNode) {
      this.scriptNode.disconnect(this.audioCtx.destination);
      this.scriptNode.onaudioprocess = null;
      this.scriptNode = null;
    }
    if (this.audioCtx) {
      this.audioCtx.close().catch(handleError);
      this.audioCtx = null;
    }
  }

  syncAudioBuffer(samples) {
    this.buffer = samples
  }

  onaudioprocess = e => {
    var left = e.outputBuffer.getChannelData(0);
    var right = e.outputBuffer.getChannelData(1);
    var size = left.length;

    for (var i = 0; i < size; i++) {
      left[i] = this.buffer[i * 2] || 0;
      right[i] = this.buffer[i * 2 + 1] || 0;
    }
  };
}
