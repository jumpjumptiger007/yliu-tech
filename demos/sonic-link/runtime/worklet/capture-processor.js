class SonicCaptureProcessor extends AudioWorkletProcessor {
  pending = new Float32Array(0);
  debugEnabled = false;
  lastLevelFrame = 0;
  constructor() {
    super();
    this.port.onmessage = event => { if (event.data?.type === 'DEBUG') this.debugEnabled = event.data.enabled === true; };
  }
  process(inputs) {
    const input = inputs[0]?.[0];
    if (!input?.length) return true;
    const joined = new Float32Array(this.pending.length + input.length);
    joined.set(this.pending); joined.set(input, this.pending.length);
    const chunkSize = 2048;
    let offset = 0;
    while (joined.length - offset >= chunkSize) {
      const float = joined.slice(offset, offset + chunkSize);
      const pcm = new Int16Array(float.length);
      let sumSquares = 0;
      for (let i = 0; i < float.length; i++) pcm[i] = Math.max(-1, Math.min(1, float[i])) * (float[i] < 0 ? 32768 : 32767);
      for (let i = 0; i < float.length; i++) sumSquares += float[i] * float[i];
      if (currentFrame - this.lastLevelFrame >= sampleRate * 0.09) {
        const rms = Math.sqrt(sumSquares / float.length);
        this.port.postMessage({ type: 'LEVEL', level: Math.min(1, rms * 4) });
        this.lastLevelFrame = currentFrame;
      }
      this.port.postMessage({ type: 'PCM', pcm }, [pcm.buffer]);
      if (this.debugEnabled) this.port.postMessage({ type: 'DEBUG_PCM', pcm: float }, [float.buffer]);
      offset += chunkSize;
    }
    this.pending = joined.slice(offset);
    return true;
  }
}
registerProcessor('sonic-capture', SonicCaptureProcessor);
