export async function createCore(baseUrl = new URL('../../', import.meta.url).href) {
    const wasmModuleUrl = new URL('wasm/sonic-core.js', baseUrl).href;
    const module = await import(/* @vite-ignore */ wasmModuleUrl);
    return module.default({ locateFile: (file) => new URL(file, new URL('wasm/', baseUrl)).href });
}
const typeId = { TEXT: 1, URL: 2, TOKEN: 3, DEVICE_INFO: 4 };
export function validatePayload(core, kind, bytes) {
    const ptr = core._malloc(Math.max(1, bytes.length));
    core.HEAPU8.set(bytes, ptr);
    const result = core._sl_validate_payload(typeId[kind] ?? 0, ptr, bytes.length);
    core._free(ptr);
    return result;
}
export function fragmentPayload(core, kind, id, bytes) {
    const input = core._malloc(Math.max(1, bytes.length)), output = core._malloc(3 * 40);
    core.HEAPU8.set(bytes, input);
    const count = core._sl_fragment(typeId[kind] ?? 0, id, input, bytes.length, output);
    core._free(input);
    if (count < 1 || count > 3) {
        core._free(output);
        throw new Error('Payload is invalid for Sonic Link framing.');
    }
    const result = [];
    for (let i = 0; i < count; i++)
        result.push(core.HEAPU8.slice(output + i * 40, output + (i + 1) * 40));
    core._free(output);
    return result;
}
