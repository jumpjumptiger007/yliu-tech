import { initialState, reduce, reusablePreparedSend } from './runtime/state/web-state.js';
import { prepareText, prepareUrl, parseToken, hex, frameCount, estimatedSeconds } from './runtime/protocol/payload.js';
import { nextMessageId } from './runtime/protocol/message-id.js';
import { createCore, validatePayload, fragmentPayload } from './runtime/protocol/wasm-core.js';
import { TxPlayer } from './runtime/audio/tx-player.js';
import { AudioSession } from './runtime/audio/audio-session.js';
import { OneShotDebugCapture } from './runtime/audio/debug-capture.js';
import { downloadWav } from './runtime/audio/wav.js';

const root = document.querySelector('#app');
const baseUrl = new URL('./', import.meta.url).href;
const state = { ...initialState(), screen: 'send' };
const capture = new OneShotDebugCapture();
let mode = 'send';
let core;
let player;
let audio;
let latestAudio;
let lastTransfer;
let receiveGeneration = 0;
let txGeneration = 0;
let receiveStatus = 'idle';
let receiveDetail = '';
let txStatus = 'idle';
let txDetail = '';
let uiMessage = '';
let uiTone = '';
let level = 0;
let busyTransition = false;
let modeChanging = false;
let cancellingTx = false;

const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c]));
const bytesFor = () => {
  if (state.kind === 'URL') return prepareUrl(state.input);
  if (state.kind === 'TOKEN') return parseToken(state.input);
  return prepareText(state.input);
};
function setMessage(text = '', tone = '') { uiMessage = text; uiTone = tone; render(); }
function modeTitle() { return mode === 'send' ? 'Prepare a transfer' : mode === 'receive' ? 'Listen for a transfer' : 'Local system readout'; }
function setStatusClass(status) { return status === 'error' ? 'error' : status === 'ready' || status === 'complete' ? 'good' : status === 'listening' || status === 'playing' ? 'good' : status === 'requesting' || status === 'assembling' ? 'warn' : ''; }
function render() {
  const focus = document.activeElement?.dataset?.focus;
  const start = document.activeElement?.selectionStart;
  const end = document.activeElement?.selectionEnd;
  let prepared, validation;
  try { prepared = bytesFor(); validation = ''; } catch (error) { validation = error.message; }
  const count = prepared ? frameCount(prepared.bytes.length) : 0;
  const nav = `<nav class="modebar" aria-label="Sonic Link modes">${[['send','01','SEND'],['receive','02','RECEIVE'],['diagnostics','03','DIAGNOSTICS']].map(([id,n,label]) => `<button class="mode-button" type="button" data-action="mode" data-mode="${id}" aria-pressed="${mode === id}"><span class="mode-index">${n}</span>${label}</button>`).join('')}</nav>`;
  const sendView = `<section class="task" aria-labelledby="task-title">
    <div class="section-head"><div><p class="eyebrow">Task surface / transmit</p><h1 id="task-title">${modeTitle()}</h1><p class="section-note">Send text, a web address, or hexadecimal bytes through local acoustic audio.</p></div><span class="state-tag ${setStatusClass(txStatus)}">${esc(txStatus === 'idle' ? 'READY' : txStatus.toUpperCase())}</span></div>
    <div class="form-block"><div class="field-label-row"><label for="kind">Payload type</label><span class="counter">MAX 93 BYTES</span></div><select id="kind" class="input" data-focus="kind" aria-label="Payload type"><option value="TEXT" ${state.kind==='TEXT'?'selected':''}>Text</option><option value="URL" ${state.kind==='URL'?'selected':''}>URL</option><option value="TOKEN" ${state.kind==='TOKEN'?'selected':''}>Hex token</option></select></div>
    <div class="form-block"><div class="field-label-row"><label for="payload">${state.kind==='TOKEN'?'Hexadecimal bytes':state.kind==='URL'?'Web address':'Message'}</label><span class="counter">${prepared?.bytes.length ?? 0} / 93 B</span></div>${state.kind==='TEXT'?`<textarea id="payload" data-focus="payload" maxlength="1000" spellcheck="false" aria-describedby="payload-help">${esc(state.input)}</textarea>`:`<input id="payload" class="input" data-focus="payload" value="${esc(state.input)}" autocomplete="off" spellcheck="false" aria-describedby="payload-help">`}<p class="helper ${validation?'error':''}" id="payload-help">${validation ? esc(validation) : state.kind==='TOKEN'?'Enter hexadecimal byte pairs; spaces are optional.':'Payload is validated locally and limited to 93 bytes.'}</p></div>
    <div class="meter"><span class="meter-label">Transmission estimate</span><span class="meter-value">${prepared ? `${count} FRAME${count===1?'':'S'} · ~${estimatedSeconds(count).toFixed(1)} SEC` : 'WAITING FOR VALID PAYLOAD'}</span></div>
    ${txStatus==='playing'||txStatus==='complete'||txStatus==='interrupted'?`<div class="frame-progress" aria-live="polite"><div class="progress-meta"><span>${txStatus==='playing'?'Frame progress':txStatus==='complete'?'Transfer complete':'Transfer interrupted'}</span><span>${state.txFrame} / ${state.txFrames}</span></div><div class="progress-track" role="progressbar" aria-label="Transmission frames" aria-valuemin="0" aria-valuemax="${state.txFrames}" aria-valuenow="${state.txFrame}"><div class="progress-fill" style="width:${state.txFrames?state.txFrame/state.txFrames*100:0}%"></div></div></div>`:''}
    <div class="button-row">${txStatus==='complete'?`<button class="button primary" data-action="send-again" ${modeChanging?'disabled':''}>SEND AGAIN</button><button class="button" data-action="new-message" ${modeChanging?'disabled':''}>NEW MESSAGE</button>`:`<button class="button primary" data-action="send" ${!prepared||txStatus==='playing'||txStatus==='preparing'||busyTransition||cancellingTx?'disabled':''}>${txStatus==='playing'?'TRANSMITTING…':txStatus==='preparing'?'PREPARING…':'TRANSMIT'}</button>${txStatus==='playing'?`<button class="button danger" data-action="cancel-send" ${cancellingTx||modeChanging?'disabled':''}>STOP</button>`:''}`}</div>
    <p class="inline-status ${uiTone}" role="status" aria-live="polite">${esc(uiMessage || (validation ? '' : txDetail))}</p>
    <p class="privacy-note">Audio is generated in this browser. No payload is uploaded or sent to a server.</p>
  </section>`;
  const receiveView = `<section class="task" aria-labelledby="task-title">
    <div class="section-head"><div><p class="eyebrow">Task surface / receive</p><h1 id="task-title">${modeTitle()}</h1><p class="section-note">Start listening only when you are ready to receive a nearby Sonic Link transfer.</p></div><span class="state-tag ${setStatusClass(receiveStatus)}">${esc(receiveStatus.toUpperCase())}</span></div>
    <div class="listen-level" aria-label="Live microphone level"><span class="level-label">INPUT LEVEL</span><div class="level-bars" aria-hidden="true">${Array.from({length:24},(_,i)=>`<span class="level-bar ${level*24>i?'on':''}"></span>`).join('')}</div><span class="level-value">${latestAudio ? `${Math.round(level*100)}%` : '—'}</span></div>
    <div class="meter"><span class="meter-label">Decoder</span><span class="meter-value">${receiveStatus==='listening'||receiveStatus==='assembling'?'LOCAL / ACTIVE':'LOCAL / STANDBY'}</span></div>
    ${receiveStatus==='assembling'?`<div class="meter"><span class="meter-label">Frames received</span><span class="meter-value">${state.rxReceived} / ${state.rxTotal}</span></div>`:''}
    <div class="button-row">${receiveStatus==='listening'||receiveStatus==='assembling'?'<button class="button danger" data-action="stop-listen">STOP LISTENING</button>':'<button class="button primary" data-action="start-listen" '+(busyTransition?'disabled':'')+'>START LISTENING</button>'}</div>
    <p class="inline-status ${uiTone}" role="status" aria-live="polite">${esc(uiMessage || receiveDetail || 'Microphone access starts after you select Start Listening.')}</p>
    ${state.result?renderResult(state.result):''}
    <p class="privacy-note">Microphone audio stays in this browser and is processed locally. The microphone is released when you stop listening or leave this mode.</p>
  </section>`;
  const diagView = `<section class="task" aria-labelledby="task-title"><div class="section-head"><div><p class="eyebrow">Task surface / diagnostics</p><h1 id="task-title">${modeTitle()}</h1><p class="section-note">Runtime facts from this browser session. No transfer data is shown until one completes.</p></div><span class="state-tag">LOCAL</span></div>
    <div class="diag-grid">
      ${diagCell('WEB COMPANION','0.1.0')}${diagCell('EXECUTION','Browser / local')}${diagCell('PROTOCOL FRAME','40 bytes')}${diagCell('MAX PAYLOAD','93 bytes')}${diagCell('AUDIO CONTEXT',latestAudio?`${latestAudio.sampleRate} Hz`:'Not started')}${diagCell('WASM RUNTIME',core?'Loaded':'Loads on demand')}${diagCell('MICROPHONE',receiveStatus==='listening'||receiveStatus==='assembling'?'Active by request':'Off')}${diagCell('LAST TRANSFER',lastTransfer?esc(lastTransfer):'None this session')}
    </div>
    <div class="button-row">${capture.sampleCount?'<button class="button primary" data-action="download-wav">DOWNLOAD WAV</button><button class="button" data-action="clear-capture">CLEAR CAPTURE</button>':`<button class="button ${capture.isArmed?'danger':''}" data-action="arm-capture">${capture.isArmed?'CANCEL CAPTURE':'ARM 30 SEC CAPTURE'}</button>`}</div>
    <p class="inline-status ${uiTone}" role="status" aria-live="polite">${esc(uiMessage || (capture.sampleCount?`${capture.sampleCount.toLocaleString()} samples captured at ${capture.rate} Hz.`:capture.isArmed?'Capture is armed for the next listening session. WAV stays on this device.':'Debug audio capture is off. Arm it only when you need a local recording.'))}</p>
    <p class="privacy-note">Capture is opt-in and limited to 30 seconds. The WAV is created only after you choose Download. Nothing is uploaded.</p>
  </section>`;
  root.innerHTML = `<header class="topline"><div class="brand"><p class="brand-name">SONIC LINK</p><span class="brand-sub">WEB COMPANION</span></div><div class="system-mark"><span class="system-dot"></span>LOCAL SYSTEM</div></header>${nav}<div class="layout">${mode==='send'?sendView:mode==='receive'?receiveView:diagView}<aside class="readout" aria-label="Session readout"><div class="readout-head">Persistent readout / session</div><div class="readout-body">${readoutRow('MODE',mode.toUpperCase())}${readoutRow('SEND',txStatus.toUpperCase(),txStatus==='playing'?'active':'')}${readoutRow('RECEIVE',receiveStatus.toUpperCase(),receiveStatus==='listening'?'active':'')}${readoutRow('AUDIO RATE',latestAudio?`${latestAudio.sampleRate} Hz`:'NOT STARTED')}${readoutRow('LAST TRANSFER',lastTransfer||'NONE THIS SESSION',lastTransfer?'':'empty')}</div><div class="readout-footer">NO CLOUD · NO ACCOUNT · LOCAL AUDIO ONLY</div></aside></div>`;
  if (focus) {
    const next = root.querySelector(`[data-focus="${focus}"]`);
    next?.focus({preventScroll:true});
    if (typeof start === 'number' && typeof next?.setSelectionRange === 'function') next.setSelectionRange(start,end);
  }
}
function readoutRow(label,value,cls='') { return `<div class="readout-row"><span class="readout-label">${label}</span><span class="readout-value ${cls}">${esc(value)}</span></div>`; }
function diagCell(label,value) { return `<div class="diag-cell"><span class="readout-label">${label}</span><span class="readout-value">${value}</span></div>`; }
function renderResult(result) {
  const kind = result.kind;
  let content = '';
  if (kind === 'TEXT') content = `<p class="result-content">${esc(new TextDecoder().decode(result.bytes))}</p>`;
  else if (kind === 'URL') { const url = new TextDecoder().decode(result.bytes); content = `<p class="result-content">${esc(url)}</p><div class="button-row"><a class="button" href="${esc(url)}" target="_blank" rel="noopener noreferrer" data-safe-url="true">OPEN URL</a><button class="button" data-action="copy-result">COPY URL</button></div>`; }
  else if (kind === 'TOKEN') content = `<p class="result-content mono">${esc(hex(result.bytes))}</p>`;
  else if (kind === 'DEVICE_INFO') content = renderDeviceInfo(result.bytes);
  return `<div class="result-box"><p class="result-title">Received ${esc(kind)} · ID ${result.messageId}</p>${content}<div class="button-row">${kind==='TEXT'||kind==='TOKEN'?'<button class="button" data-action="copy-result">COPY</button>':''}<button class="button" data-action="listen-again">LISTEN AGAIN</button></div></div>`;
}
function renderDeviceInfo(bytes) {
  if (bytes.length < 16) return `<p class="result-content">${esc(hex(bytes))}</p>`;
  const u = [...bytes];
  const cells = [['MODEL',u[1]],['FIRMWARE',`${u[2]}.${u[3]}.${u[4]}`],['GGWAVE',`${u[5]}.${u[6]}.${u[7]}`],['BATTERY',u[8]===255?'—':`${u[8]}%`],['PROFILE',u[9]],['FINGERPRINT',u.slice(12,16).map(x=>x.toString(16).padStart(2,'0')).join('').toUpperCase()]];
  return `<div class="device-grid">${cells.map(([k,v])=>`<div class="device-cell"><span class="readout-label">${k}</span><span class="readout-value">${esc(v)}</span></div>`).join('')}</div>`;
}

async function coreReady() { core ??= await createCore(baseUrl); return core; }
function parsedSend() { return bytesFor(); }
async function transmit() {
  if (busyTransition || modeChanging || cancellingTx || txStatus==='playing' || txStatus==='preparing' || receiveStatus==='listening' || receiveStatus==='assembling') return;
  let payload;
  try { payload = parsedSend(); } catch (error) { setMessage(error.message,'error'); return; }
  const generation = ++txGeneration;
  txStatus = 'preparing'; txDetail='Preparing local encoder…'; setMessage('Preparing local encoder…');
  try {
    const instance = await coreReady();
    if (generation !== txGeneration || document.visibilityState==='hidden') throw new Error('Transmission interrupted.');
    let prepared = reusablePreparedSend(state);
    if (!prepared) {
      const valid = validatePayload(instance,payload.kind,payload.bytes);
      if (valid !== 0) throw new Error('Payload is not valid for the Sonic Link protocol.');
      const id = nextMessageId(state.messageId);
      const frames = fragmentPayload(instance,payload.kind,id,payload.bytes);
      Object.assign(state,reduce(state,{type:'TX_PREPARED',kind:payload.kind,input:state.input,messageId:id,frames}));
      prepared = reusablePreparedSend(state);
    }
    if (!prepared) throw new Error('Could not prepare this transfer.');
    Object.assign(state,reduce(state,{type:'TX_START',frames:prepared.frames.length}));
    txStatus='playing'; txDetail=''; setMessage('Transmission started. Keep this page visible until it completes.');
    player = new TxPlayer();
    await player.send(prepared.frames, progress => {
      if (generation !== txGeneration) return;
      if (progress.complete) {
        Object.assign(state,reduce(state,{type:'TX_COMPLETE'})); txStatus='complete'; txDetail='All frames finished playing.';
        lastTransfer=`Sent ${prepared.kind} · ${payload.bytes.length} ${payload.bytes.length===1?'byte':'bytes'} · ${prepared.frames.length} ${prepared.frames.length===1?'frame':'frames'}`;
        setMessage('Transfer complete. The receiver can now use this payload.','success');
      } else {
        Object.assign(state,reduce(state,{type:'TX_FRAME',frame:progress.frame})); render();
      }
    },baseUrl);
  } catch (error) {
    if (generation === txGeneration) {
      Object.assign(state,reduce(state,{type:'TX_INTERRUPTED',reason:error.message}));
      txStatus='interrupted'; txDetail=error.message || 'Transmission interrupted.';
      setMessage(txDetail,'error');
    }
  } finally { if (generation===txGeneration) { player=undefined; render(); } }
}
async function stopReceive(reason = 'Listening stopped.') {
  const current = audio; audio = undefined; receiveGeneration++;
  capture.finish();
  if (current) { try { await current.stop(); } catch {} }
  latestAudio = undefined; level = 0;
  if (receiveStatus==='listening'||receiveStatus==='assembling'||receiveStatus==='requesting') receiveStatus='idle';
  receiveDetail=reason;
}
async function startReceive() {
  if (busyTransition || audio || txStatus==='playing') return;
  const generation=++receiveGeneration;
  receiveStatus='requesting'; receiveDetail='Requesting microphone access…'; setMessage(receiveDetail);
  const session=new AudioSession(); audio=session;
  try {
    const info=await session.startReceive({baseUrl,debugCapture:capture.isArmed,
      onLevel:value=>{ if (generation!==receiveGeneration || audio!==session) return; level=value; render(); },
      onPcm:samples=>{
        if (generation!==receiveGeneration||audio!==session||!latestAudio||!capture.isArmed) return;
        const pcm=new Int16Array(samples.length);
        for(let i=0;i<samples.length;i++) pcm[i]=Math.max(-32768,Math.min(32767,Math.round(samples[i]*32767)));
        capture.push(pcm);
      },
      onEvent:event=>handleReceiveEvent(event,generation,session)
    });
    if (generation!==receiveGeneration || audio!==session) { await session.stop(); return; }
    latestAudio=info;
    if (capture.isArmed) capture.arm(info.sampleRate);
    receiveStatus='listening'; receiveDetail=`Listening at ${info.sampleRate} Hz. Audio stays on this device.`;
    setMessage(receiveDetail,'success'); render();
    info.tracks.forEach(track=>track.addEventListener('ended',()=>{if(generation===receiveGeneration){stopReceive('Microphone input ended.').then(render);}}));
  } catch(error) {
    if (generation!==receiveGeneration) return;
    await session.stop(); audio=undefined; latestAudio=undefined;
    receiveStatus='error'; receiveDetail=permissionMessage(error);
    setMessage(receiveDetail,'error'); render();
  }
}
function permissionMessage(error) {
  if (error?.name==='NotAllowedError'||error?.name==='SecurityError') return 'Microphone permission was denied. Allow microphone access in your browser settings, then try again.';
  if (error?.name==='NotFoundError'||error?.name==='DevicesNotFoundError') return 'No microphone was found. Connect a microphone and try again.';
  if (/does not support/i.test(error?.message||'')) return 'This browser does not support the required local audio capture features.';
  return error?.message||'Could not start local audio capture.';
}
function handleReceiveEvent(event,generation,session) {
  if(generation!==receiveGeneration||audio!==session) return;
  if(event.type==='READY') { receiveStatus='listening'; receiveDetail=`Decoder ready at ${event.sampleRate} Hz.`; render(); }
  else if(event.type==='PROGRESS') { Object.assign(state,reduce(state,{type:'RX_PROGRESS',received:event.received,total:event.total})); receiveStatus='assembling'; receiveDetail='A Sonic Link message is being assembled.'; uiMessage=''; uiTone=''; render(); }
  else if(event.type==='INCOMPLETE'||event.type==='EXPIRED') { receiveStatus='listening'; receiveDetail=event.reason; uiMessage=''; uiTone=''; render(); }
  else if(event.type==='RESULT') {
    const kind={1:'TEXT',2:'URL',3:'TOKEN',4:'DEVICE_INFO'}[event.payloadType];
    if(!kind) { receiveDetail='A transfer arrived with an unsupported payload type.'; render(); return; }
    Object.assign(state,reduce(state,{type:'RX_RESULT',kind,bytes:event.bytes,messageId:event.messageId}));
    lastTransfer=`Received ${kind} · ${event.bytes.length} ${event.bytes.length===1?'byte':'bytes'} · ID ${event.messageId}`;
    receiveStatus='listening'; receiveDetail='Transfer received and validated locally.'; setMessage(receiveDetail,'success');
  } else if(event.type==='ERROR') {
    receiveDetail=event.reason||'The local decoder reported an error.';
    uiMessage=''; uiTone=event.state==='paused'?'':'error';
    if(event.state==='incomplete') { receiveStatus='listening'; render(); }
    else {
      receiveStatus=event.state==='paused'?'idle':'error';
      const terminalStatus=receiveStatus;
      const terminalTone=uiTone;
      stopReceive(receiveDetail).then(()=>{receiveStatus=terminalStatus; uiMessage=''; uiTone=terminalTone; render();});
    }
  }
}
async function changeMode(next) {
  if (next===mode||modeChanging) return;
  modeChanging=true; busyTransition=true; render();
  if (audio) await stopReceive('Listening stopped because the mode changed.');
  if (txStatus==='playing'||txStatus==='preparing') {
    txGeneration++;
    try { await player?.cancel(); } catch {}
    player=undefined; busyTransition=false; cancellingTx=false; txStatus='interrupted'; txDetail='Transmission stopped because the mode changed.';
    Object.assign(state,reduce(state,{type:'TX_INTERRUPTED',reason:txDetail}));
  }
  mode=next; Object.assign(state,reduce(state,{type:'NAVIGATE',screen:next}));
  busyTransition=false; modeChanging=false; uiMessage=''; uiTone=''; render();
}
root.addEventListener('click',async event=>{
  const button=event.target.closest('[data-action]'); if(!button) return;
  const action=button.dataset.action;
  if(action==='mode') { await changeMode(button.dataset.mode); return; }
  if(action==='send'||action==='send-again') { await transmit(); return; }
  if(action==='new-message') { Object.assign(state,reduce(state,{type:'NEW_MESSAGE'})); txStatus='idle'; txDetail=''; uiMessage=''; render(); return; }
  if(action==='cancel-send') {
    if (cancellingTx||modeChanging||txStatus!=='playing') return;
    const generation=++txGeneration;
    const activePlayer=player;
    cancellingTx=true; render();
    try { await activePlayer?.cancel(); } catch {}
    if (generation!==txGeneration) return;
    player=undefined; cancellingTx=false; txStatus='interrupted'; txDetail='Transmission stopped.';
    Object.assign(state,reduce(state,{type:'TX_INTERRUPTED',reason:txDetail})); setMessage(txDetail,'error'); return;
  }
  if(action==='start-listen') { await startReceive(); return; }
  if(action==='stop-listen') { await stopReceive(); uiMessage='Listening stopped. Microphone released.'; uiTone=''; render(); return; }
  if(action==='listen-again') { state.result=undefined; uiMessage=''; render(); await startReceive(); return; }
  if(action==='copy-result') {
    const result=state.result; if(!result) return;
    const text=result.kind==='TOKEN'?hex(result.bytes):new TextDecoder().decode(result.bytes);
    try { await navigator.clipboard.writeText(text); setMessage('Copied to clipboard.','success'); } catch { setMessage('Clipboard access is unavailable in this browser.','error'); }
    return;
  }
  if(action==='arm-capture') {
    if(capture.isArmed) { capture.clear(); Object.assign(state,reduce(state,{type:'DEBUG_ARM',value:false})); setMessage('Debug capture cancelled.'); }
    else { capture.arm(48000); Object.assign(state,reduce(state,{type:'DEBUG_ARM',value:true})); setMessage('Capture armed. Start listening to record up to 30 seconds.','success'); }
    render(); return;
  }
  if(action==='clear-capture') { capture.clear(); render(); return; }
  if(action==='download-wav') { if(capture.sampleCount) downloadWav(capture.toWav()); return; }
});
root.addEventListener('input',event=>{
  if(event.target.id==='payload') {
    Object.assign(state,reduce(state,{type:'NEW_MESSAGE'}));
    Object.assign(state,reduce(state,{type:'EDIT',input:event.target.value}));
    txStatus='idle'; txDetail=''; uiMessage=''; uiTone=''; render();
  }
});
root.addEventListener('change',event=>{
  if(event.target.id==='kind') {
    Object.assign(state,reduce(state,{type:'NEW_MESSAGE'}));
    const kind=event.target.value;
    const input=kind==='TEXT'?'':kind==='URL'?'https://':'';
    Object.assign(state,reduce(state,{type:'EDIT',kind,input}));
    txStatus='idle'; txDetail=''; uiMessage=''; uiTone=''; render();
  }
});
document.addEventListener('visibilitychange',async()=>{
  if(document.visibilityState==='hidden') {
    if(audio) {
      await stopReceive('Listening paused because this page is hidden.');
      uiMessage=''; uiTone=''; render();
    }
    if(txStatus==='playing'||txStatus==='preparing') {
      txGeneration++; try { await player?.cancel(); } catch {}
      player=undefined; busyTransition=false; cancellingTx=false; txStatus='interrupted'; txDetail='Transmission interrupted because this page was hidden.';
      Object.assign(state,reduce(state,{type:'TX_INTERRUPTED',reason:txDetail})); setMessage(txDetail,'error');
    }
  }
});
window.addEventListener('pagehide',()=>{
  receiveGeneration++; txGeneration++;
  try { audio?.stop(); player?.cancel(); } catch {}
  capture.finish();
});

function validateReceivedLinks() {
  root.querySelectorAll('a[data-safe-url]').forEach(anchor=>{
    try { const url=new URL(anchor.href); if(url.protocol!=='https:'&&url.protocol!=='http:') anchor.remove(); }
    catch { anchor.remove(); }
  });
}
const observer=new MutationObserver(validateReceivedLinks);
observer.observe(root,{childList:true,subtree:true});
render();
