export class AudioSession {
    context;
    stream;
    source;
    worklet;
    worker;
    options;
    async startReceive(options) {
        this.options = options;
        if (!navigator.mediaDevices?.getUserMedia || !window.AudioWorkletNode)
            throw new Error('This browser does not support microphone capture with AudioWorklet.');
        this.context = new AudioContext();
        if (this.context.state === 'suspended')
            await this.context.resume();
        this.stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: false, autoGainControl: false, noiseSuppression: false }, video: false });
        await this.context.audioWorklet.addModule(new URL('../worklet/capture-processor.js', import.meta.url));
        this.source = this.context.createMediaStreamSource(this.stream);
        this.worklet = new AudioWorkletNode(this.context, 'sonic-capture', { numberOfInputs: 1, numberOfOutputs: 0 });
        this.worklet.port.postMessage({ type: 'DEBUG', enabled: options.debugCapture === true });
        this.worker = new Worker(new URL('../worker/decoder-worker.js', import.meta.url), { type: 'module' });
        this.worker.onmessage = e => options.onEvent(e.data);
        this.worklet.port.onmessage = e => {
            if (e.data.type === 'PCM')
                this.worker?.postMessage({ type: 'PCM', samples: e.data.pcm }, [e.data.pcm.buffer]);
            else if (e.data.type === 'DEBUG_PCM')
                options.onPcm?.(e.data.pcm);
            else if (e.data.type === 'LEVEL' && Number.isFinite(e.data.level))
                options.onLevel?.(e.data.level);
        };
        this.source.connect(this.worklet);
        this.worker.postMessage({ type: 'START', sampleRate: this.context.sampleRate, baseUrl: options.baseUrl ?? new URL('../../', import.meta.url).href });
        return { sampleRate: this.context.sampleRate, tracks: this.stream.getAudioTracks() };
    }
    async suspend() { await this.stop(); }
    async stop() {
        this.worker?.postMessage({ type: 'STOP' });
        this.worker?.terminate();
        this.worker = undefined;
        this.worklet?.disconnect();
        this.worklet = undefined;
        this.source?.disconnect();
        this.source = undefined;
        this.stream?.getTracks().forEach(track => track.stop());
        this.stream = undefined;
        if (this.context && this.context.state !== 'closed')
            await this.context.close();
        this.context = undefined;
    }
}
