class PCMProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
    this.buffer = new Int16Array(1920);
    this.bufferIndex = 0;
  }

  process(inputs, outputs, parameters) {
    const input = inputs[0];
    if (!input || !input[0]) {
      console.warn('No input data or channels available');
      return true;
    }

    const left = input[0];
    const right = input[1] || input[0];

    for (let i = 0; i < left.length; i++) {
      const l = Math.max(-32768, Math.min(32767, left[i] * 32768));
      const r = Math.max(-32768, Math.min(32767, right[i] * 32768));

      this.buffer[this.bufferIndex++] = l;
      this.buffer[this.bufferIndex++] = r;

      if (this.bufferIndex >= this.buffer.length) {
        this.port.postMessage(this.buffer.buffer, [this.buffer.buffer]);
        this.buffer = new Int16Array(1920);
        this.bufferIndex = 0;
      }
    }

    return true;
  }
}

registerProcessor('pcm-processor', PCMProcessor);
