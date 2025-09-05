class PCMProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
    this.buffer = [];
  }

  process(inputs) {
    const input = inputs[0];
    if (input && input[0]) {
      const left = input[0];
      const right = input[1] || input[0];

      const pcm16BitStereo = new Int16Array(left.length * 2);
      
      for (let i = 0; i < left.length; i++) {
        const l = Math.max(-32768, Math.min(32767, left[i] * 32768));
        const r = Math.max(-32768, Math.min(32767, right[i] * 32768));
        pcm16BitStereo[i * 2] = l;
        pcm16BitStereo[i * 2 + 1] = r;
      }
      
      this.port.postMessage(pcm16BitStereo.buffer, [pcm16BitStereo.buffer]);
    }

    return true;
  }
}

registerProcessor('pcm-processor', PCMProcessor);
