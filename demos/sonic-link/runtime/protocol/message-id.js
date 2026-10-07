export function normalizeMessageId(value) {
    const normalized = value & 0xffff;
    return normalized === 0 ? 1 : normalized;
}
export function nextMessageId(current) {
    return normalizeMessageId((normalizeMessageId(current) + 1) & 0xffff);
}
export function randomMessageId(random = crypto.getRandomValues(new Uint16Array(1))[0]) {
    return normalizeMessageId(random);
}
