// Funzioni e costanti comuni ai giochi di tt/ e ntt/ (identiche in molte pagine). Le pagine possono ridefinire una function con una propria variante.
function shuffle(a){ for(let i=a.length-1;i>0;i--){ const j=rnd(i+1); [a[i],a[j]]=[a[j],a[i]]; } return a; }
const ABORT = {abort:true};
const delay = ms => new Promise(r=>setTimeout(r,ms));
async function sleep(ms){ const g=G; await delay(ms); if(g!==G) throw ABORT; }
const P = i => G.pl[i];
function logMsg(t){ G.log.unshift(t); if(G.log.length>600) G.log.pop(); render(); }
function status(t){ G.msg=t; render(); }
async function ask(p,title,options){
  const ok=options.filter(x=>!x.disabled);
  if(!ok.length) return null;
  if(p!==HUM) return ok[rnd(ok.length)].value;
  const g=G;
  return new Promise((res,rej)=>{ PR={type:'choose',title,options,res,rej}; render(); }).then(v=>{ if(g!==G) throw ABORT; return v; });
}
function askCard(legal,hint){
  const g=G;
  return new Promise((res,rej)=>{ PR={type:'card',legal:new Set(legal),hint,sel:null,res,rej}; render(); }).then(v=>{ if(g!==G) throw ABORT; return v; });
}
function answer(i){
  if(!PR||PR.type!=='choose') return;
  const o=PR.options[i]; if(!o||o.disabled) return;
  const r=PR.res; PR=null; render(); r(o.value);
}
function playIdx(i){
  if(!PR||PR.type!=='card'||!PR.legal.has(i)) return;
  if(OPT.undo){ PR.sel=i; render(); return; }
  const r=PR.res; PR=null; render(); r(i);
}
function confirmCard(ok){
  if(!PR||PR.type!=='card'||PR.sel==null) return;
  if(!ok){ PR.sel=null; render(); return; }
  const i=PR.sel, r=PR.res; PR=null; render(); r(i);
}
function toSetup(){ if(PR){ const r=PR.rej; PR=null; r(ABORT); } G=null; NYLO_CK=null; render(); }
function logHtml(){
  return `<details class="log" ${LOGOPEN?'open':''}><summary>LOG DELLA PARTITA (${G.log.length})</summary><div class="logbody">${G.log.map(l=>`<div>${esc(l)}</div>`).join('')}</div></details>`;
}
function menuHtml(){
  return `<div class="menu-wrap"><button class="hamb" type="button" data-menu="1" aria-label="Opzioni" aria-expanded="${MENUOPEN}"><svg width="18" height="14" viewBox="0 0 18 14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M1 1h16M1 7h16M1 13h16"/></svg></button>
    ${MENUOPEN?`<div class="menu-pop">
      <label class="opt-toggle" title="Chiede conferma e permette di annullare le carte giocate"><input type="checkbox" id="optUndo" ${OPT.undo?'checked':''}> Abilita annulla</label>
      <label class="opt-toggle" title="Aggiunge una filigrana ai colori per distinguerli senza i colori"><input type="checkbox" id="optA11y" ${OPT.a11y?'checked':''}> Modalità accessibile</label>
    </div>`:''}</div>`;
}
function askName(n){
  try{ if(localStorage.getItem('nylo-skip-name')==='1'){ NAMES[0]=localStorage.getItem('nylo-player-name')||'Nylo'; newMatch(n); return; } }catch(e){}
  let ov=document.getElementById('nameModal');
  if(!ov){ ov=document.createElement('div'); ov.id='nameModal'; ov.className='name-modal'; document.body.appendChild(ov); }
  let saved=''; try{ saved=localStorage.getItem('nylo-player-name')||''; }catch(e){}
  ov.innerHTML='<form class="name-box"><h3>Come ti chiami?</h3><p>Il tuo nome sostituirà «Tu» al tavolo.</p><input id="nameInput" maxlength="16" placeholder="Il tuo nome" autocomplete="off" value="'+esc(saved)+'"><div class="opts"><button class="opt" type="submit">Inizia la partita</button><button class="opt" type="button" data-cancel="1">Annulla</button></div></form>';
  ov.style.display='flex';
  const closeName=()=>{ ov.style.display='none'; };
  ov.onclick=e=>{ if(e.target===ov||e.target.hasAttribute('data-cancel')) closeName(); };
  ov.onkeydown=e=>{ if(e.key==='Escape') closeName(); };
  const f=ov.firstChild, inp=f.querySelector('input'); inp.focus(); inp.select();
  f.onsubmit=e=>{
    e.preventDefault();
    const v=inp.value.trim().slice(0,16)||'Tu';
    try{ localStorage.setItem('nylo-player-name',v); }catch(x){}
    NAMES[0]=v; ov.style.display='none'; newMatch(n);
  };
}
function legalOf(hand,trick){
  if(!trick.length) return hand.slice();
  const f=hand.filter(c=>c.s===trick[0].c.s);
  return f.length?f:hand.slice();
}

// ═══ Salvataggio della partita contro l'AI (la modale di home-btn.js chiede se salvare uscendo; una partita per gioco, in localStorage) ═══
// Una pagina di gioco chiama ckpt() ai punti sicuri (inizio mano / inizio presa), registra nyloSaveInit(id, resume) e fa ripartire
// run() dal punto salvato. Lo stato G si serializza in JSON (Set e Map comprese): le carte vanno confrontate per id, non per identità.
let NYLO_CK = null;
function nyloSer(o){ return JSON.stringify(o,(k,v)=>v instanceof Set?{__set:[...v]}:(v instanceof Map?{__map:[...v]}:v)); }
function nyloDes(s){ return JSON.parse(s,(k,v)=>v&&typeof v==='object'&&v.__set?new Set(v.__set):(v&&typeof v==='object'&&v.__map?new Map(v.__map):v)); }
function ckpt(){ try{ NYLO_CK=G&&!G.over?nyloSer(G):null; }catch(e){ NYLO_CK=null; } }
function nyloSaveInit(id,resume){
  window.NYLO_SAVE={id,snap:()=>NYLO_CK};
  if(location.hash!=='#resume') return;
  const d=window.nyloSaveData&&nyloSaveData(id);
  try{ history.replaceState(null,'',location.pathname); }catch(e){}
  if(!d) return;
  try{ resume(nyloDes(d)); if(window.nyloSaveClear) nyloSaveClear(id); }catch(e){ console.error('Ripresa non riuscita',e); G=null; render(); }
}

// ═══ Voce di menu «Mostra/Nascondi le carte uscite» (pulsante, non checkbox): al click simula un 'change' con checked = nuovo stato, così i gestori delle pagine restano quelli di prima ═══
(function(){
  const st=document.createElement('style');
  st.textContent=':where(button.opt-toggle){background:transparent;border:0;color:inherit;font-family:inherit;text-align:left;cursor:pointer;width:100%}';
  document.head.appendChild(st);
  // accordion (log, riepilogo, regolamento…): da chiusi tutti alti uguali e con lo stesso font/font-size in ogni gioco
  const ac=document.createElement('style');
  ac.textContent='details.log,details.recap,details.rules,#app>details{padding:12px 16px!important}details.log>summary,details.recap>summary,details.rules>summary,#app>details>summary{font-family:inherit!important;font-size:12px!important;font-weight:600!important;line-height:20px!important;letter-spacing:.05em!important;text-transform:uppercase!important}';
  document.head.appendChild(ac);
  document.addEventListener('click',e=>{
    const b=e.target.closest&&e.target.closest('button#optMemo'); if(!b) return;
    b.checked=/^\s*Mostra/.test(b.textContent);
    b.dispatchEvent(new Event('change',{bubbles:true}));
  });
})();
