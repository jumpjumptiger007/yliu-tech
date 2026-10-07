import { nextMessageId, normalizeMessageId, randomMessageId } from '../protocol/message-id.js';
export const initialState = (seed = randomMessageId()) => ({ screen: 'home', kind: 'TEXT', input: 'Hello from my phone!', messageId: normalizeMessageId(seed), messageRevision: 0,
    tx: 'idle', txFrame: 0, txFrames: 0, rx: 'idle', rxReceived: 0, rxTotal: 0, lastError: '', debugArmed: false });
export function reduce(state, action) {
    switch (action.type) {
        case 'NAVIGATE': return { ...state, screen: action.screen, lastError: '' };
        case 'EDIT': return { ...state, ...(action.kind ? { kind: action.kind } : {}), ...(action.input !== undefined ? { input: action.input } : {}), tx: 'idle' };
        case 'NEW_MESSAGE': return { ...state, messageRevision: state.messageRevision + 1, tx: 'idle', screen: 'send' };
        case 'TX_PREPARED': {
            const messageId = nextMessageId(state.messageId);
            if (normalizeMessageId(action.messageId) !== messageId)
                return state;
            return { ...state, messageId, preparedSend: { kind: action.kind, input: action.input, revision: state.messageRevision, messageId, frames: action.frames } };
        }
        case 'TX_START': return { ...state, screen: 'sending', tx: 'playing', txFrame: 0, txFrames: action.frames };
        case 'TX_FRAME': return { ...state, txFrame: action.frame };
        case 'TX_COMPLETE': return { ...state, tx: 'complete', txFrame: state.txFrames, screen: 'sent' };
        case 'TX_INTERRUPTED': return { ...state, tx: 'interrupted', screen: 'interrupted', lastError: action.reason };
        case 'RX_STATE': return { ...state, rx: action.state, lastError: action.reason ?? '' };
        case 'RX_PROGRESS': return { ...state, rx: 'assembling', rxReceived: action.received, rxTotal: action.total };
        case 'RX_LEVEL': return { ...state, rxLevel: action.level === undefined ? undefined : Math.max(0, Math.min(1, action.level)) };
        case 'RX_RESULT': return { ...state, rx: 'idle', result: { kind: action.kind, bytes: action.bytes, messageId: action.messageId }, screen: 'result' };
        case 'DEBUG_ARM': return { ...state, debugArmed: action.value };
    }
}
export function reusablePreparedSend(state, kind = state.kind, input = state.input) {
    const prepared = state.preparedSend;
    return prepared && prepared.kind === kind && prepared.input === input && prepared.revision === state.messageRevision
        ? prepared
        : undefined;
}
