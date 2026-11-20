// ═══ NOTA LEGALE (in fondo, al centro, di ogni pagina di gioco o strumento): modifica qui il testo ═══
// Per cambiare la frase basta cambiare NYLO_DISCLAIMER. Per nasconderla su una pagina: <html data-no-disclaimer>.
var NYLO_DISCLAIMER = 'Questo gioco o strumento di supporto, le sue idee, regole, immagini e marchi appartengono ai rispettivi autori ed editori. ' +
  'Qui viene riprodotto esclusivamente per uso personale, senza alcuno scopo di lucro. ' +
  'Su richiesta dei legittimi titolari dei diritti verrà rimosso.';

// Pulsante "casetta" per tornare alla home: chiede conferma con una finestra modale.
// Nelle pagine con <html data-home-inline> il pulsante è nella barra in alto (window.nyloHomeBtn());
// nelle altre compare un pulsante tondo fisso in basso a sinistra.
(function () {
  var inFrame = window.self !== window.top;
  if (inFrame) { window.nyloHomeBtn = function () { return ''; }; window.nyloBackBtn = function () { return ''; }; }
  // Salvataggi delle partite contro l'AI (localStorage 'nylo-saves'): { <id gioco>: { id, title, ts, data } }.
  // Ogni gioco ha il proprio punto di ripristino (uno solo per gioco: salvare di nuovo lo stesso gioco lo sostituisce).
  // Le pagine di gioco si registrano con window.NYLO_SAVE = { id, snap() } (snap = stringa dello stato all'ultimo punto sicuro, o null).
  var SAVES_KEY = 'nylo-saves', OLD_SAVE_KEY = 'nylo-save';
  function readSaves() {
    var m = {};
    try { var o = JSON.parse(localStorage.getItem(SAVES_KEY) || 'null'); if (o && typeof o === 'object') m = o; } catch (e) {}
    try {   // migrazione dal vecchio salvataggio singolo
      var old = JSON.parse(localStorage.getItem(OLD_SAVE_KEY) || 'null');
      if (old && old.id && old.data) { if (!m[old.id]) m[old.id] = old; localStorage.setItem(SAVES_KEY, JSON.stringify(m)); }
      if (localStorage.getItem(OLD_SAVE_KEY) !== null) localStorage.removeItem(OLD_SAVE_KEY);
    } catch (e) {}
    return m;
  }
  window.nyloSaveInfo = function (id) { var s = readSaves()[id]; return s && s.id && s.data ? s : null; };
  window.nyloSaveGame = function (id, title, data) {
    try { var m = readSaves(); m[id] = { id: id, title: title, ts: Date.now(), data: data }; localStorage.setItem(SAVES_KEY, JSON.stringify(m)); return true; } catch (e) { return false; }
  };
  window.nyloSaveData = function (id) { var s = window.nyloSaveInfo(id); return s ? s.data : null; };
  window.nyloSaveClear = function (id) { try { var m = readSaves(); if (id in m) { delete m[id]; localStorage.setItem(SAVES_KEY, JSON.stringify(m)); } } catch (e) {} };
  // valore con # = stanze nella stessa pagina del gioco (si ricarica con #stanze); altrimenti pagina separata
  var ONLINE_GAMES = {};
  var SVG = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 11l9-8 9 8"/><path d="M5 10v10h5v-6h4v6h5V10"/></svg>';
  window.nyloHomeBtn = function () {
    return '<button type="button" class="nylo-home" data-home="1" title="Torna alla home" aria-label="Torna alla home">' + SVG + '<span>Home</span></button>';
  };
  var BACK_SVG = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 12H5"/><path d="M11 6l-6 6 6 6"/></svg>';
  // pulsante "Indietro": torna alla lista dei giochi trick-taking (stesso stile del pulsante Home)
  // to = destinazione (default /tt/), what = come la chiama il messaggio ("alla lista dei giochi")
  window.nyloBackBtn = function (to, what) {
    to = to || '/tt/'; what = what || 'alla lista dei giochi';
    return '<button type="button" class="nylo-home nylo-back" data-back="' + to + '" data-back-what="' + what + '" title="Torna ' + what + '" aria-label="Torna ' + what + '">' + BACK_SVG + '<span>Indietro</span></button>';
  };
  var st = document.createElement('style');
  st.textContent = '.nylo-home{display:inline-flex;align-items:center;gap:6px;padding:5px 10px;border-radius:7px;border:1px solid var(--border,rgba(255,255,255,.35));background:transparent;color:var(--text-soft,#cbd5e1);font:500 12px Inter,system-ui,sans-serif;cursor:pointer;white-space:nowrap}' +
    '.nylo-home:hover{background:var(--surface-raised,rgba(255,255,255,.1));color:var(--text,#fff)}' +
    '.menu-pop .opt-toggle.nylo-menu-action{display:block;width:100%;padding:9px 10px;border:0;border-radius:6px;text-align:left;white-space:normal;font:500 13px Inter,system-ui,sans-serif;cursor:pointer;background:transparent;color:inherit}' +
    '.menu-pop .opt-toggle.nylo-menu-action:hover{background:var(--accent-soft,rgba(255,255,255,.1))}' +
    '.nylo-menu-action input{position:absolute;width:1px;height:1px;opacity:0;pointer-events:none}' +
    '.nylo-home-float{position:fixed;left:12px;bottom:12px;z-index:2147483000;width:42px;height:42px;justify-content:center;border-radius:50%;background:rgba(15,23,42,.88);color:#f1f5f9;border-color:rgba(255,255,255,.45);box-shadow:0 4px 14px rgba(0,0,0,.4)}' +
    '.nylo-home-float span{display:none}' +
    '.topbar>.nylo-home,.topbar>[data-new]{display:none!important}' +
    '.menu-pop .nylo-nav{display:block;width:100%;padding:9px 10px;border:0;border-radius:6px;text-align:left;white-space:nowrap;font:500 13px Inter,system-ui,sans-serif;cursor:pointer;background:transparent;color:var(--text,inherit)}' +
    '.menu-pop .nylo-nav:hover{background:var(--accent-soft,rgba(255,255,255,.1))}' +
    '.logbody b.nylo-me{font-weight:800;color:var(--text,inherit)}' +
    // voce di menu a pulsante («Mostra/Nascondi le carte uscite»): senza questo il pulsante prende lo stile grigio del browser
    '.menu-pop button.opt-toggle{display:block;width:100%;background:transparent;border:0;border-radius:6px;padding:9px 10px;text-align:left;font-family:inherit;font-size:13px;color:var(--text,inherit);cursor:pointer;white-space:nowrap}' +
    '.menu-pop button.opt-toggle:hover,.menu-pop button.opt-toggle:focus-visible{background:var(--accent-soft,rgba(255,255,255,.1));outline:0}' +
    '.menu-pop .nylo-sep{height:1px;margin:2px 0;background:var(--border,rgba(255,255,255,.2))}' +
    // elenchi numerati del regolamento: senza padding (reset globale) i numeri finiscono sul bordo dell'accordion
    '.rtext ol,details.rules ol{padding-left:22px}' +
    // niente scroll orizzontale: se un elemento sborda il browser mobile rimpicciolisce la pagina e lascia spazio bianco in fondo
    'html,body{overflow-x:clip}' +
    '.nylo-disclaimer{display:block;clear:both;box-sizing:border-box;width:calc(100% - 24px);max-width:620px;margin:24px auto 0;padding:8px 14px;border-radius:8px;background:rgba(0,0,0,.55);text-align:center;font:400 11px/1.5 Inter,system-ui,sans-serif;color:#e2e8f0}';
  document.head.appendChild(st);

  // accordion: lo stato aperto/chiuso resta mentre la pagina si ridisegna (si azzera solo cambiando o ricaricando la pagina)
  var ACC = {};
  function accKey(d) {
    var sm = d.querySelector(':scope > summary');
    return sm ? sm.textContent.trim().split(/[\s·(]/)[0].toUpperCase() : null;
  }
  document.addEventListener('toggle', function (e) {
    var d = e.target;
    if (!d || !d.matches || !d.matches('details')) return;
    var k = accKey(d); if (k) ACC[k] = d.open;
  }, true);
  function restoreAcc() {
    Array.prototype.forEach.call(document.querySelectorAll('details'), function (d) {
      var k = accKey(d);
      if (k && Object.prototype.hasOwnProperty.call(ACC, k) && d.open !== ACC[k]) d.open = ACC[k];
    });
  }
  // log della partita: il nome del giocatore collegato (quello salvato in nylo-player-name; per le partite contro l'AI è anche G.pl[0]) in grassetto.
  // Si lavora sui nodi di testo già resi dalla pagina: nessuna modifica alle singole pagine di gioco.
  var NB_RE = null, NB_NAME = null;
  function myLogName() {
    var n = '';
    try { n = (localStorage.getItem('nylo-player-name') || '').trim(); } catch (e) {}
    if (!n) { try { if (typeof G !== 'undefined' && G && G.pl && G.pl[0] && G.pl[0].name) n = String(G.pl[0].name).trim(); } catch (e) {} }
    return n;
  }
  function boldLog() {
    var lines = document.querySelectorAll('.logbody > div:not([data-nb])');
    if (!lines.length) return;
    var name = myLogName();
    if (name !== NB_NAME) {
      NB_NAME = name;
      NB_RE = name ? new RegExp('(^|[^\\p{L}\\p{N}_])(' + name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ')(?![\\p{L}\\p{N}_])', 'gu') : null;
    }
    Array.prototype.forEach.call(lines, function (div) {
      div.setAttribute('data-nb', '1');
      if (!NB_RE) return;
      var walker = document.createTreeWalker(div, NodeFilter.SHOW_TEXT), nodes = [], t;
      while ((t = walker.nextNode())) nodes.push(t);
      nodes.forEach(function (node) {
        var text = node.nodeValue; NB_RE.lastIndex = 0;
        if (!NB_RE.test(text)) return;
        NB_RE.lastIndex = 0;
        var frag = document.createDocumentFragment(), last = 0, m;
        while ((m = NB_RE.exec(text))) {
          var start = m.index + m[1].length;
          if (start > last) frag.appendChild(document.createTextNode(text.slice(last, start)));
          var b = document.createElement('b'); b.className = 'nylo-me'; b.textContent = m[2]; frag.appendChild(b);
          last = start + m[2].length;
        }
        if (last < text.length) frag.appendChild(document.createTextNode(text.slice(last)));
        node.parentNode.replaceChild(frag, node);
      });
    });
  }
  // nota legale in fondo alla pagina, centrata (in coda al body, non sopra il gioco). Non compare nella home
  function addDisclaimer() {
    var path = location.pathname.replace(/index\.html$/, '');
    if (!NYLO_DISCLAIMER || document.documentElement.hasAttribute('data-no-disclaimer') || path === '/') return;
    if (document.querySelector('.nylo-disclaimer')) return;
    var d = document.createElement('footer');
    d.className = 'nylo-disclaimer'; d.textContent = NYLO_DISCLAIMER;
    document.body.appendChild(d);
    // pagina più corta dello schermo: la nota scende comunque in fondo alla finestra
    var busy = false;
    function place() {
      busy = false;
      d.style.marginTop = '24px'; d.style.marginBottom = '12px';
      var gap = window.innerHeight - (d.getBoundingClientRect().bottom + window.pageYOffset + 12);
      if (gap > 0) d.style.marginTop = (24 + gap) + 'px';
    }
    function later() { if (!busy) { busy = true; requestAnimationFrame(place); } }
    place(); window.addEventListener('resize', later); window.addEventListener('load', later);
    new MutationObserver(later).observe(document.body, { childList: true, subtree: true });
  }
  var ov;
  function build() {
    if (!document.documentElement.hasAttribute('data-home-inline')) {
      if (!inFrame) {
        var f = document.createElement('div');
        f.innerHTML = window.nyloHomeBtn();
        f = f.firstChild; f.className += ' nylo-home-float';
        document.body.appendChild(f);
      }
    } else {
      var updateGameMenu = function () {
        var topbar = document.querySelector('.topbar');
        var menu = document.querySelector('.menu-wrap .menu-pop');
        // Menu condiviso: «Nuova partita» in cima (se la pagina la offre), poi le voci del gioco, poi dopo un divisore «Salva» (solo se la
        // partita è salvabile) ed «Esci» (che chiede dove andare: pagina del gioco / elenco giochi / home)
        if (topbar && menu && !menu.querySelector('.nylo-nav')) {
          var mk = function (label, attrs) {
            var b = document.createElement('button'); b.type = 'button'; b.className = 'nylo-nav'; b.textContent = label;
            Object.keys(attrs).forEach(function (k) { b.setAttribute(k, attrs[k]); });
            return b;
          };
          if (topbar.querySelector(':scope > [data-new]')) menu.insertBefore(mk('Nuova partita', { 'data-new': '1' }), menu.firstChild);
          var sep = document.createElement('div'); sep.className = 'nylo-sep';
          menu.appendChild(sep);
          if (canSaveNow()) menu.appendChild(mk('Salva', { 'data-nylo-save': '1' }));
          menu.appendChild(mk('Esci', { 'data-nylo-exit': '1' }));
        }

        Array.prototype.forEach.call(document.querySelectorAll('.menu-pop .opt-toggle input#optA11y, .menu-pop .opt-toggle input#optUndo'), function (input) {
          var label = input.parentElement;
          var text = input.id === 'optA11y'
            ? (input.checked ? 'Passa a modalità standard' : 'Passa a modalità accessibile')
            : (input.checked ? 'Disabilita annulla' : 'Abilita annulla');
          input.tabIndex = -1;
          input.setAttribute('aria-hidden', 'true');
          label.classList.add('nylo-menu-action');
          label.setAttribute('role', 'button');
          label.setAttribute('tabindex', '0');
          label.setAttribute('aria-pressed', input.checked ? 'true' : 'false');
          if (label.getAttribute('data-action-label') !== text) {
            Array.prototype.forEach.call(label.childNodes, function (node) { if (node !== input) label.removeChild(node); });
            label.appendChild(document.createTextNode(' ' + text));
            label.setAttribute('data-action-label', text);
          }
        });

        var name = '';
        try { name = localStorage.getItem('nylo-player-name') || ''; } catch (e) {}
        if (name) Array.prototype.forEach.call(document.querySelectorAll('.opts button[data-n]'), function (button) {
          var original = button.getAttribute('data-player-label') || button.textContent;
          if (!button.hasAttribute('data-player-label')) button.setAttribute('data-player-label', original);
          var personalized = original.replace(/\btu\s*\+\s*/gi, name + ' vs ');
          if (/^inizia la partita$/i.test(original)) {
            var totalPlayers = Number(button.getAttribute('data-n'));
            if (totalPlayers > 1) personalized = totalPlayers + ' giocatori (' + name + ' vs ' + (totalPlayers - 1) + ' AI)';
          }
          if (button.textContent !== personalized) button.textContent = personalized;
        });

        var dock = document.querySelector('.dock');
        var message = dock && dock.querySelector('.dock-msg');
        var options = dock && dock.querySelector('.opts');
        var startOptions = options && Array.prototype.filter.call(options.querySelectorAll('button[data-n]'), function (button) {
          return button.textContent.trim().toLowerCase() !== 'rigioca';
        });
        if (message && startOptions && startOptions.length) {
          if (message.textContent !== 'In che modalità vuoi giocare?') message.textContent = 'In che modalità vuoi giocare?';
          var path = location.pathname.replace(/\/?$/, '/');
          var onlineHref = ONLINE_GAMES[path];
          if (onlineHref && !options.querySelector('[data-mode-online]')) {
            var friendsButton = document.createElement('button');
            friendsButton.type = 'button';
            friendsButton.className = startOptions[0].className;
            friendsButton.textContent = 'Contro gli amici';
            friendsButton.setAttribute('data-mode-online', onlineHref);
            options.appendChild(friendsButton);
          }
        }
      };
      updateGameMenu(); restoreAcc(); boldLog();
      new MutationObserver(function () { updateGameMenu(); restoreAcc(); boldLog(); }).observe(document.body, { childList: true, subtree: true });
      window.addEventListener('resize', updateGameMenu);
      document.addEventListener('keydown', function (e) {
        var label = e.target.closest && e.target.closest('.nylo-menu-action');
        if (label && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); label.click(); }
      });
      document.addEventListener('click', function (e) {
        var friendsButton = e.target.closest && e.target.closest('[data-mode-online]');
        if (friendsButton) location.href = friendsButton.getAttribute('data-mode-online');
      });
    }
    if (!inFrame) addDisclaimer();
    if (inFrame) return;
    ov = document.createElement('div');
    ov.style.cssText = 'position:fixed;inset:0;z-index:2147483001;display:none;align-items:center;justify-content:center;background:rgba(0,0,0,.55);padding:16px;font-family:Inter,system-ui,sans-serif';
    ov.innerHTML = '<div role="dialog" aria-modal="true" style="width:min(340px,100%);padding:20px;border-radius:12px;background:#1e293b;color:#f1f5f9;border:1px solid #475569;box-shadow:0 14px 40px rgba(0,0,0,.5)">' +
      '<div data-title style="font-size:16px;font-weight:600;margin-bottom:6px">Tornare alla home?</div>' +
      '<div data-warn style="font-size:13px;color:#cbd5e1;margin-bottom:16px;line-height:1.5">La partita in corso andrà persa.</div>' +
      '<div style="display:flex;gap:8px;justify-content:flex-end;flex-wrap:wrap">' +
      '<button type="button" data-no style="padding:8px 14px;border-radius:7px;border:1px solid #64748b;background:transparent;color:#e2e8f0;cursor:pointer;font-size:13px">Annulla</button>' +
      '<button type="button" data-save style="display:none;padding:8px 14px;border-radius:7px;border:0;background:#2563eb;color:#fff;font-weight:600;cursor:pointer;font-size:13px">Salva e esci</button>' +
      '<button type="button" data-gamehome style="display:none;padding:8px 14px;border-radius:7px;border:0;background:#7c3aed;color:#fff;font-weight:600;cursor:pointer;font-size:13px">Menu del gioco</button>' +
      '<button type="button" data-yes style="padding:8px 14px;border-radius:7px;border:0;background:#0d9488;color:#fff;font-weight:600;cursor:pointer;font-size:13px">Torna alla home</button></div></div>';
    document.body.appendChild(ov);
    ov.addEventListener('click', function (e) { if (e.target === ov || e.target.hasAttribute('data-no')) ov.style.display = 'none'; });
    ov.querySelector('[data-yes]').addEventListener('click', function () { location.href = ov._to || '/'; });
    ov.querySelector('[data-save]').addEventListener('click', function () {
      var sv = window.NYLO_SAVE, data = sv && sv.snap && sv.snap();
      if (data && window.nyloSaveGame(sv.id, document.title, data)) window.__nyloSaved = true;
      location.href = ov._to || '/';
    });
    ov.querySelector('[data-gamehome]').addEventListener('click', gameHome);
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') ov.style.display = 'none'; });
  }
  // ── Salva / Esci (voci del menu condiviso) ──
  function curSave() {
    var sv = window.NYLO_SAVE, snap = null;
    try { snap = sv && sv.snap ? sv.snap() : null; } catch (e) {}
    return snap ? { sv: sv, snap: snap } : null;
  }
  function canSaveNow() { return !!curSave() && !gameOver() && !notStarted(); }
  // la partita corrente coincide con quella già salvata (nessuna domanda sul salvataggio uscendo)
  function isSavedNow() {
    var c = curSave(), info = c && window.nyloSaveInfo(c.sv.id);
    return !!(c && info && info.data === c.snap);
  }
  function toast(msg) {
    var t = document.createElement('div');
    t.setAttribute('role', 'status');
    t.style.cssText = 'position:fixed;left:50%;bottom:24px;transform:translateX(-50%);z-index:2147483002;max-width:calc(100% - 32px);padding:10px 16px;border-radius:10px;background:#0d9488;color:#fff;font:600 13px Inter,system-ui,sans-serif;box-shadow:0 8px 24px rgba(0,0,0,.45);text-align:center';
    t.textContent = msg; document.body.appendChild(t);
    setTimeout(function () { t.style.transition = 'opacity .4s'; t.style.opacity = '0'; setTimeout(function () { t.remove(); }, 450); }, 2200);
  }
  function closeMenu() { try { document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' })); } catch (e) {} }
  function doSave() {
    var c = curSave(); if (!c || gameOver() || notStarted()) return false;
    if (!window.nyloSaveGame(c.sv.id, document.title, c.snap)) { toast('Salvataggio non riuscito'); return false; }
    toast('Partita salvata');
    return true;
  }
  function inRoom() { try { return typeof roomRef !== 'undefined' && !!roomRef && typeof leave === 'function'; } catch (e) { return false; } }
  // si lascia la stanza (se c'è) prima di cambiare pagina
  function navigateTo(url) {
    if (inRoom()) { try { leave(url); return; } catch (e) {} }
    location.href = url;
  }
  // destinazioni di «Esci»
  function exitTargets() {
    var m = location.pathname.match(/^\/(n?tt)\//), backEl = document.querySelector('[data-back]');
    var back = backEl && backEl.getAttribute('data-back');
    var out = [];
    if (back && !(window.NYLO_IN_SETUP || notStarted())) out.push({ k: 'game', label: 'Pagina del gioco' });
    if (back) out.push({ k: 'list', label: back === '/#lab' ? 'Lab' : 'Elenco giochi', to: back === '/#lab' ? back : (m ? '/' + m[1] + '/' : '/tt/') });
    out.push({ k: 'home', label: 'Home', to: '/' });
    return out;
  }
  var ov2;
  var BTN = 'display:block;width:100%;padding:10px 14px;border-radius:8px;border:0;color:#fff;font-weight:600;cursor:pointer;font-size:14px;text-align:center;';
  function exitGo(t) {
    ov2.style.display = 'none';
    window.__nyloSaved = isSavedNow();      // salvata: uscire non conta come partita abbandonata nelle statistiche
    if (t.k === 'game') { if (inRoom()) navigateTo(location.pathname); else gameHome(); }
    else navigateTo(t.to);
  }
  function openExit() {
    if (!ov2) {
      ov2 = document.createElement('div');
      ov2.style.cssText = 'position:fixed;inset:0;z-index:2147483001;display:none;align-items:center;justify-content:center;background:rgba(0,0,0,.55);padding:16px;font-family:Inter,system-ui,sans-serif';
      document.addEventListener('keydown', function (e) { if (e.key === 'Escape') ov2.style.display = 'none'; });
      document.body.appendChild(ov2);
    }
    closeMenu();
    var targets = exitTargets(), inProgress = !(notStarted() || gameOver() || window.NYLO_IN_SETUP);
    var pending = null;
    var cancel = '<button type="button" data-x="cancel" style="' + BTN + 'background:transparent;border:1px solid #64748b;color:#e2e8f0;font-weight:500">Annulla</button>';
    var box = function (title, text, btns) {
      ov2.innerHTML = '<div role="dialog" aria-modal="true" style="width:min(340px,100%);padding:20px;border-radius:12px;background:#1e293b;color:#f1f5f9;border:1px solid #475569;box-shadow:0 14px 40px rgba(0,0,0,.5)">' +
        '<div style="font-size:16px;font-weight:600;margin-bottom:6px">' + title + '</div>' +
        '<div style="font-size:13px;color:#cbd5e1;margin-bottom:14px;line-height:1.5">' + text + '</div>' +
        '<div style="display:flex;flex-direction:column;gap:8px">' + btns + '</div></div>';
      ov2.style.display = 'flex';
      var f = ov2.querySelector('[data-x]'); if (f) f.focus();
    };
    var step1 = function () {
      var warn = 'Dove vuoi andare?';
      if (inRoom()) { var st0 = null; try { st0 = typeof S !== 'undefined' ? S : null; } catch (er) {} warn = st0 ? 'Potrai rientrare nella stanza con lo stesso codice. Dove vuoi andare?' : 'Dove vuoi andare?'; }
      else if (inProgress && !canSaveNow()) warn = 'La partita in corso andrà persa. Dove vuoi andare?';
      else if (inProgress && isSavedNow()) warn = 'La partita è salvata. Dove vuoi andare?';
      box('Uscire?', warn, targets.map(function (t, i) { return '<button type="button" data-x="' + i + '" style="' + BTN + 'background:#334155">' + t.label + '</button>'; }).join('') + cancel);
    };
    var step2 = function () {
      var c = curSave(), old = c && window.nyloSaveInfo(c.sv.id);
      var repl = old ? ' Sostituirà quella già salvata di questo gioco.' : '';
      box('Salvare la partita?', 'Potrai riprenderla più tardi dall\'elenco giochi. Per ogni gioco si può salvare una sola partita.' + repl,
        '<button type="button" data-x="save" style="' + BTN + 'background:#2563eb">Salva ed esci</button>' +
        '<button type="button" data-x="nosave" style="' + BTN + 'background:#0d9488">Non salvare</button>' + cancel);
    };
    ov2.onclick = function (e) {
      var b = e.target.closest && e.target.closest('[data-x]');
      if (!b) { if (e.target === ov2) ov2.style.display = 'none'; return; }
      var x = b.getAttribute('data-x');
      if (x === 'cancel') { ov2.style.display = 'none'; return; }
      if (x === 'save') { doSave(); exitGo(pending); return; }
      if (x === 'nosave') { exitGo(pending); return; }
      pending = targets[Number(x)]; if (!pending) return;
      if (inProgress && canSaveNow() && !isSavedNow()) step2(); else exitGo(pending);
    };
    step1();
  }
  document.addEventListener('click', function (e) {
    var b = e.target.closest && e.target.closest('[data-nylo-exit],[data-nylo-save]');
    if (!b) return;
    if (b.hasAttribute('data-nylo-save')) { doSave(); closeMenu(); } else openExit();
  });
  // 'Menu del gioco': la schermata iniziale della pagina (scelta giocatori / modalita). Pagine framework (src-ai): si ricarica senza hash;
  // pagine classiche: si azzera la partita con toSetup() (stessa azione di 'Nuova partita')
  function gameHome() {
    ov.style.display = 'none';
    if (document.getElementById('src-ai')) { location.href = location.pathname; return; }
    try { if (typeof toSetup === 'function') { toSetup(); return; } } catch (e) {}
    location.href = location.pathname;
  }
  // partita conclusa (vincitore determinato): niente avviso di perdita. G / S sono lo stato globale delle pagine di gioco
  function gameOver() {
    try { if (typeof G !== 'undefined' && G && (G.over || G.phase === 'gameEnd')) return true; } catch (e) {}
    try { if (typeof S !== 'undefined' && S && S.phase === 'gameEnd') return true; } catch (e) {}
    return false;
  }
  // partita non ancora iniziata (stato di gioco presente ma nullo = schermata di scelta modalità): niente da perdere
  function notStarted() {
    try { if (typeof G !== 'undefined') return !G; } catch (e) {}
    return false;
  }
  // delegato: funziona anche per i pulsanti ridisegnati dal render delle pagine
  document.addEventListener('click', function (e) {
    var b = e.target.closest && e.target.closest('[data-home],[data-back]');
    if (!b || !ov) return;
    askLeave(b);
  });
  function askLeave(b) {
    var back = b.getAttribute('data-back');
    if (window.NYLO_IN_SETUP || (back && notStarted())) { location.href = back || '/'; return; }   // scelta iniziale: niente da perdere, si esce subito
    ov._to = back || '/';
    var isList = back === '/tt/' || back === '/ntt/';
    ov.querySelector('[data-title]').textContent = back ? 'Uscire dalla partita?' : 'Tornare alla home?';
    ov.querySelector('[data-yes]').textContent = !back ? 'Torna alla home' : isList ? 'Elenco giochi' : 'Torna indietro';
    ov.querySelector('[data-gamehome]').style.display = back ? '' : 'none';
    // niente avviso se la partita non è iniziata o è finita: al suo posto una riga vuota, per tenere staccati titolo e pulsanti
    var warn = ov.querySelector('[data-warn]'), noWarn = notStarted() || gameOver();
    warn.textContent = noWarn ? (back ? 'Dove vuoi andare?' : ' ') : 'La partita in corso andrà persa.';
    // partita contro l'AI salvabile: si può tenerla (una per gioco) e riprenderla poi dall'elenco
    var sv = window.NYLO_SAVE, canSave = false;
    try { canSave = !noWarn && !!(sv && sv.snap && sv.snap()); } catch (er) {}
    var saveBtn = ov.querySelector('[data-save]'), yesBtn = ov.querySelector('[data-yes]');
    saveBtn.style.display = canSave ? '' : 'none';
    if (canSave) {
      var old = window.nyloSaveInfo(sv.id), repl = old ? ' Sostituirà quella già salvata di questo gioco.' : '';
      warn.textContent = 'Vuoi salvare la partita per riprenderla più tardi? Per ogni gioco si può salvare una sola partita.' + repl;
      if (!back) yesBtn.textContent = 'Non salvare';
    }
    ov.style.display = 'flex'; ov.querySelector('[data-no]').focus();
  }
  // tasto Indietro del browser / del sistema operativo (gesto o tasto Android, PWA compresa): come il pulsante "Indietro" dell'app.
  // Sulle pagine con un pulsante Indietro si aggiunge una voce "sentinella" alla cronologia (alla prima interazione dell'utente,
  // altrimenti i browser mobile la ignorano); quando viene consumata si rimette e si apre lo stesso avviso (salva / non salvare / annulla).
  (function backGuard() {
    if (inFrame) return;
    var armed = false;
    function backEl() { return document.querySelector('[data-back]'); }
    function arm() {
      if (armed || !backEl()) return;
      armed = true;
      try { history.pushState({ nyloGuard: 1 }, '', location.href); } catch (e) { armed = false; }
    }
    ['pointerdown', 'keydown', 'touchstart'].forEach(function (ev) { document.addEventListener(ev, arm, { capture: true, passive: true }); });
    window.addEventListener('popstate', function () {
      if (!armed) return;
      if (history.state && history.state.nyloGuard) return;          // si è tornati su una voce nostra: niente da fare
      armed = false;
      var b = backEl();
      if (!b || !ov) { history.back(); return; }
      if (ov.style.display === 'flex' || (ov2 && ov2.style.display === 'flex')) { arm(); ov.style.display = 'none'; if (ov2) ov2.style.display = 'none'; return; }   // avviso già aperto: Indietro = Annulla
      arm();
      openExit();
    });
  })();
  // statistiche personali per gioco: partite concluse / abbandonate / vinte / perse, salvate nel browser per nome giocatore
  // (chiave nylo-stats:<nome>; per gioco e modalità ai|friends). Si legge lo stato globale G delle pagine di gioco (indice 0 = giocatore umano)
  (function stats() {
    if (inFrame) return;
    var m = location.pathname.match(/^\/(n?tt)\/([^/]+)\//);
    if (!m) return;
    var mode = /\/online\//.test(location.pathname) ? 'friends' : 'ai';
    var gkey = '/' + m[1] + '/' + m[2] + '/';
    function skey() {
      var n = ''; try { n = localStorage.getItem('nylo-player-name') || ''; } catch (e) {}
      return 'nylo-stats:' + (n.trim().toLowerCase() || 'ospite');
    }
    function rec(kind) {
      try {
        var d = JSON.parse(localStorage.getItem(skey()) || '{}');
        var g = d[gkey] || (d[gkey] = {});
        var s = g[mode] || (g[mode] = { p: 0, a: 0, w: 0, l: 0 });
        if (kind === 'a') s.a++; else { s.p++; if (kind === 'w') s.w++; else if (kind === 'l') s.l++; }
        localStorage.setItem(skey(), JSON.stringify(d));
      } catch (e) {}
    }
    function getG() { try { return typeof G !== 'undefined' ? G : null; } catch (e) { return null; } }
    function ended(g) { return g.phase === 'gameEnd' || !!(g.over && typeof g.over === 'object'); }
    function result(g) {
      var o = g.over;
      if (typeof o === 'number') return o === 0 ? 'w' : 'l';
      if (!o || typeof o !== 'object') return 'x';
      var w = o.winners; if (w === undefined) w = o.winner;
      if (w === undefined) return 'x';
      return (Array.isArray(w) ? w.indexOf(0) >= 0 : w === 0) ? 'w' : 'l';
    }
    // le pagine con il passaggio «Ok, si parte»: finché non lo premi la partita non è iniziata e uscire non la fa contare come abbandonata
    var needsOk = false;
    try { needsOk = /Ok, si parte/.test(document.documentElement.innerHTML); } catch (e) {}
    var cur = null, done = false, started = false;
    document.addEventListener('click', function (e) {
      var b = e.target.closest && e.target.closest('button');
      if (b && /^\s*ok,?\s+si parte\s*$/i.test(b.textContent || '')) started = true;
    }, true);
    function tick() {
      var g = getG();
      if (g !== cur) { if (cur && !done && started && !window.__nyloSaved) rec('a'); cur = g; done = false; started = !needsOk; }
      if (cur && !done && ended(cur)) { done = true; rec(result(cur)); }
    }
    setInterval(tick, 400);
    window.addEventListener('pagehide', function () { tick(); if (cur && !done && started && !window.__nyloSaved) { done = true; rec('a'); } });
  })();

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', build); else build();
})();
