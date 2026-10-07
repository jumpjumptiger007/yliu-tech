export class OneShotDebugCapture {
    chunks = [];
    count = 0;
    armed = false;
    rate = 0;
    active = false;
    maxSamples = 0;
    arm(sampleRate) { this.clear(); this.maxSamples = Math.floor(sampleRate * 30); this.armed = true; this.active = false; this.rate = sampleRate; }
    push(samples) {
        if (!this.armed)
            return false;
        this.active = true;
        const room = Math.max(0, this.maxSamples - this.count);
        const take = Math.min(room, samples.length);
        if (take) {
            this.chunks.push(samples.slice(0, take));
            this.count += take;
        }
        if (take < samples.length || this.count >= this.maxSamples)
            this.armed = false;
        return this.active;
    }
    finish() { this.armed = false; this.active = false; }
    clear() { this.chunks = []; this.count = 0; this.armed = false; this.active = false; this.rate = 0; this.maxSamples = 0; }
    get sampleCount() { return this.count; }
    get isArmed() { return this.armed; }
    get isActive() { return this.active; }
    toWav() {
        const buffer = new ArrayBuffer(44 + this.count * 2);
        const view = new DataView(buffer);
        const ascii = (offset, value) => [...value].forEach((c, i) => view.setUint8(offset + i, c.charCodeAt(0)));
        ascii(0, 'RIFF');
        view.setUint32(4, 36 + this.count * 2, true);
        ascii(8, 'WAVE');
        ascii(12, 'fmt ');
        view.setUint32(16, 16, true);
        view.setUint16(20, 1, true);
        view.setUint16(22, 1, true);
        view.setUint32(24, this.rate, true);
        view.setUint32(28, this.rate * 2, true);
        view.setUint16(32, 2, true);
        view.setUint16(34, 16, true);
        ascii(36, 'data');
        view.setUint32(40, this.count * 2, true);
        let offset = 44;
        for (const chunk of this.chunks)
            for (const sample of chunk) {
                view.setInt16(offset, sample, true);
                offset += 2;
            }
        return new Blob([buffer], { type: 'audio/wav' });
    }
}
