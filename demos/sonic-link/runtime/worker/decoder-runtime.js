import { takeSampleBlocks } from '../audio/sample-chunker.js';
let core;
let modem;
let rx = -1;
let statePtr = 0;
let inputResampler = 0;
let inputSampleRate = 48000;
let chunked = new Int16Array(0);
let pollTimer;
export async function decodeFrames(message, emit) {
    if (message.type === 'START') {
        const baseUrl = message.baseUrl ?? new URL('../../', import.meta.url).href;
        const coreUrl = new URL('wasm/sonic-core.js', baseUrl).href;
        const modemUrl = new URL('wasm/ggwave.js', baseUrl).href;
        const [coreModule, modemModule] = await Promise.all([
            import(/* @vite-ignore */ coreUrl).then(m => m.default({ locateFile: (p) => new URL(p, new URL('wasm/', baseUrl)).href })),
            import(/* @vite-ignore */ modemUrl).then(m => m.default({ locateFile: (p) => new URL(p, new URL('wasm/', baseUrl)).href })),
        ]);
        core = coreModule;
        modem = modemModule;
        modem._sl_ggwave_quiet();
        inputSampleRate = message.sampleRate ?? 48000;
        inputResampler = inputSampleRate === 48000 ? 0 : modem._sl_ggwave_create_input_resampler(inputSampleRate, 48000);
        if (inputSampleRate !== 48000 && !inputResampler)
            throw new Error('Could not initialize local microphone sample-rate conversion.');
        rx = modem._sl_ggwave_create_rx(48000);
        if (rx < 0)
            throw new Error('Could not initialize the pinned ggwave receiver.');
        statePtr = core._sl_reassembly_create();
        if (!statePtr)
            throw new Error('Could not initialize shared Sonic Link reassembly.');
        chunked = new Int16Array(0);
        if (pollTimer)
            clearInterval(pollTimer);
        pollTimer = setInterval(() => pollAssembly(emit), 100);
        emit({ type: 'READY', sampleRate: inputSampleRate, decoderSampleRate: 48000 });
        return;
    }
    if (message.type === 'STOP') {
        if (pollTimer)
            clearInterval(pollTimer);
        pollTimer = undefined;
        if (rx >= 0)
            modem._sl_ggwave_free(rx);
        if (inputResampler)
            modem._sl_ggwave_free_input_resampler(inputResampler);
        if (statePtr)
            core._sl_reassembly_free(statePtr);
        rx = -1;
        statePtr = 0;
        inputResampler = 0;
        inputSampleRate = 48000;
        chunked = new Int16Array(0);
        return;
    }
    if (message.type !== 'PCM' || !message.samples || rx < 0)
        return;
    let convertedSamples = message.samples;
    if (inputResampler) {
        const input = modem._malloc(message.samples.length * 2);
        const capacity = Math.ceil(message.samples.length * 48000 / inputSampleRate) + 128;
        const output = modem._malloc(capacity * 2);
        modem.HEAP16.set(message.samples, input >>> 1);
        const count = modem._sl_ggwave_resample_input(inputResampler, input, message.samples.length, output, capacity);
        if (count < 0) {
            modem._free(input);
            modem._free(output);
            throw new Error('Local microphone sample-rate conversion failed.');
        }
        convertedSamples = modem.HEAP16.slice(output >>> 1, (output >>> 1) + count);
        modem._free(input);
        modem._free(output);
    }
    const { blocks, remainder } = takeSampleBlocks(chunked, convertedSamples);
    for (const samples of blocks) {
        const bytes = new Uint8Array(samples.buffer, samples.byteOffset, samples.byteLength);
        const ptr = modem._malloc(bytes.length);
        modem.HEAPU8.set(bytes, ptr);
        const out = modem._malloc(256);
        const decoded = modem._sl_ggwave_decode(rx, ptr, 512, out, 256);
        if (decoded === 40)
            acceptFrame(modem.HEAPU8.slice(out, out + 40), emit);
        modem._free(ptr);
        modem._free(out);
    }
    chunked = remainder;
}
function nowMs() { return Math.floor(performance.now()) >>> 0; }
function pollAssembly(emit) {
    if (!core || !statePtr)
        return;
    const out = core._malloc(101);
    const status = core._sl_reassembly_poll(statePtr, nowMs(), out);
    const result = core.HEAPU8.slice(out, out + 101);
    core._free(out);
    emitResult(status, result, emit, true);
}
function acceptFrame(frame, emit) {
    const ptr = core._malloc(40);
    core.HEAPU8.set(frame, ptr);
    const out = core._malloc(101);
    const status = core._sl_reassembly_accept(statePtr, ptr, nowMs(), out);
    const result = core.HEAPU8.slice(out, out + 101);
    core._free(ptr);
    core._free(out);
    emitResult(status, result, emit);
}
function emitResult(status, result, emit, polling = false) {
    const received = result[5], total = result[6];
    if (!polling && (status === 1 || status === 2))
        emit({ type: 'PROGRESS', received, total });
    if (status === 4)
        emit({ type: 'INCOMPLETE', received, total, reason: 'Message incomplete. Keep listening to receive the remaining frames.' });
    if (status === 7)
        emit({ type: 'EXPIRED', received, total, reason: 'The partial message expired. You can keep listening for a new message.' });
    if (status === 5) {
        const length = result[7], type = result[4];
        const data = result.slice(8, 8 + length);
        const check = core._malloc(Math.max(1, length));
        core.HEAPU8.set(data, check);
        const valid = core._sl_validate_payload(type, check, length);
        core._free(check);
        if (valid === 0)
            emit({ type: 'RESULT', payloadType: type, messageId: result[2] | (result[3] << 8), bytes: data }, [data.buffer]);
        else
            emit({ type: 'ERROR', state: 'incomplete', reason: 'The completed payload did not pass validation.' });
    }
    else if (status === 6 || status < 0)
        emit({ type: 'ERROR', state: 'incomplete', reason: 'Frame validation failed.' });
}
