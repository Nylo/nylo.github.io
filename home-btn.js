// Pulsante "casetta" per tornare alla home: chiede conferma con una finestra modale.
// Nelle pagine con <html data-home-inline> il pulsante è nella barra in alto (window.nyloHomeBtn());
// nelle altre compare un pulsante tondo fisso in basso a sinistra.
(function () {
  var inFrame = window.self !== window.top;
  if (inFrame) { window.nyloHomeBtn = function () { return ''; }; window.nyloBackBtn = function () { return ''; }; }
  // valore con # = stanze nella stessa pagina del gioco (si ricarica con #stanze); altrimenti pagina separata
  var ONLINE_GAMES = { '/tt/spy-team/': '#stanze', '/tt/six-forces/': '#stanze', '/tt/9-lives/': '#stanze' };
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
    '.menu-pop .nylo-sep{height:1px;margin:2px 0;background:var(--border,rgba(255,255,255,.2))}';
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
        // Indietro / Home / Nuova partita stanno sempre nel menu hamburger (senza icone)
        if (topbar && menu && !menu.querySelector('.nylo-nav')) {
          var mk = function (label, attrs) {
            var b = document.createElement('button'); b.type = 'button'; b.className = 'nylo-nav'; b.textContent = label;
            Object.keys(attrs).forEach(function (k) { b.setAttribute(k, attrs[k]); });
            return b;
          };
          var items = [];
          if (topbar.querySelector(':scope > [data-home]')) items.push(mk('Home', { 'data-home': '1' }));
          var back = topbar.querySelector(':scope > [data-back]');
          if (back) items.push(mk('Indietro', { 'data-back': back.getAttribute('data-back'), 'data-back-what': back.getAttribute('data-back-what') || '' }));
          if (topbar.querySelector(':scope > [data-new]')) items.push(mk('Nuova partita', { 'data-new': '1' }));
          if (items.length) {
            var sep = document.createElement('div'); sep.className = 'nylo-sep';
            var first = menu.firstChild;
            items.forEach(function (it) { menu.insertBefore(it, first); });
            menu.insertBefore(sep, first);
          }
        }

        Array.prototype.forEach.call(document.querySelectorAll('.menu-pop .opt-toggle input#optA11y, .menu-pop .opt-toggle input#optUndo'), function (input) {
          var label = input.parentElement;
          var text = input.id === 'optA11y'
            ? (input.checked ? 'Disattiva modalità accessibile' : 'Attiva modalità accessibile')
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
      updateGameMenu(); restoreAcc();
      new MutationObserver(function () { updateGameMenu(); restoreAcc(); }).observe(document.body, { childList: true, subtree: true });
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
    if (inFrame) return;
    ov = document.createElement('div');
    ov.style.cssText = 'position:fixed;inset:0;z-index:2147483001;display:none;align-items:center;justify-content:center;background:rgba(0,0,0,.55);padding:16px;font-family:Inter,system-ui,sans-serif';
    ov.innerHTML = '<div role="dialog" aria-modal="true" style="width:min(340px,100%);padding:20px;border-radius:12px;background:#1e293b;color:#f1f5f9;border:1px solid #475569;box-shadow:0 14px 40px rgba(0,0,0,.5)">' +
      '<div data-title style="font-size:16px;font-weight:600;margin-bottom:6px">Tornare alla home?</div>' +
      '<div data-warn style="font-size:13px;color:#cbd5e1;margin-bottom:16px;line-height:1.5">La partita in corso andrà persa.</div>' +
      '<div style="display:flex;gap:8px;justify-content:flex-end">' +
      '<button type="button" data-no style="padding:8px 14px;border-radius:7px;border:1px solid #64748b;background:transparent;color:#e2e8f0;cursor:pointer;font-size:13px">Annulla</button>' +
      '<button type="button" data-yes style="padding:8px 14px;border-radius:7px;border:0;background:#0d9488;color:#fff;font-weight:600;cursor:pointer;font-size:13px">Torna alla home</button></div></div>';
    document.body.appendChild(ov);
    ov.addEventListener('click', function (e) { if (e.target === ov || e.target.hasAttribute('data-no')) ov.style.display = 'none'; });
    ov.querySelector('[data-yes]').addEventListener('click', function () { location.href = ov._to || '/'; });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') ov.style.display = 'none'; });
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
    var back = b.getAttribute('data-back');
    ov._to = back || '/';
    ov.querySelector('[data-title]').textContent = back ? 'Tornare ' + (b.getAttribute('data-back-what') || 'alla lista dei giochi') + '?' : 'Tornare alla home?';
    ov.querySelector('[data-yes]').textContent = !back ? 'Torna alla home' : (back === '/tt/' || back === '/ntt/') ? 'Torna ai giochi' : 'Torna indietro';
    // niente avviso se la partita non è iniziata o è finita: al suo posto una riga vuota, per tenere staccati titolo e pulsanti
    var warn = ov.querySelector('[data-warn]'), noWarn = notStarted() || gameOver();
    warn.textContent = noWarn ? ' ' : 'La partita in corso andrà persa.';
    ov.style.display = 'flex'; ov.querySelector('[data-no]').focus();
  });
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
      if (g !== cur) { if (cur && !done && started) rec('a'); cur = g; done = false; started = !needsOk; }
      if (cur && !done && ended(cur)) { done = true; rec(result(cur)); }
    }
    setInterval(tick, 400);
    window.addEventListener('pagehide', function () { tick(); if (cur && !done && started) { done = true; rec('a'); } });
  })();

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', build); else build();
})();
