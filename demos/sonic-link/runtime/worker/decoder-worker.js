import { decodeFrames } from './decoder-runtime.js';
const send = (event, transfer) => self.postMessage(event, transfer ?? []);
self.onmessage = async (event) => {
    try {
        await decodeFrames(event.data, send);
    }
    catch (error) {
        send({ type: 'ERROR', state: 'wasm-error', reason: error instanceof Error ? error.message : 'Decoder failed.' });
    }
};
