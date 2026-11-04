// Pulsante "casetta" per tornare alla home: chiede conferma con una finestra modale.
// Nelle pagine con <html data-home-inline> il pulsante è nella barra in alto (window.nyloHomeBtn());
// nelle altre compare un pulsante tondo fisso in basso a sinistra.
(function () {
  if (window.self !== window.top) { window.nyloHomeBtn = function () { return ''; }; window.nyloBackBtn = function () { return ''; }; return; }   // non negli iframe
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
    '@media(max-width:600px){.nylo-home span{display:none}.nylo-home{padding:5px 8px}}' +
    '.menu-pop .opt-toggle.nylo-menu-action{display:block;width:100%;padding:9px 10px;border:0;border-radius:6px;text-align:left;white-space:normal;font:500 13px Inter,system-ui,sans-serif;cursor:pointer;background:transparent;color:inherit}' +
    '.menu-pop .opt-toggle.nylo-menu-action:hover{background:var(--accent-soft,rgba(255,255,255,.1))}' +
    '.nylo-menu-action input{position:absolute;width:1px;height:1px;opacity:0;pointer-events:none}' +
    '.nylo-home-float{position:fixed;left:12px;bottom:12px;z-index:2147483000;width:42px;height:42px;justify-content:center;border-radius:50%;background:rgba(15,23,42,.88);color:#f1f5f9;border-color:rgba(255,255,255,.45);box-shadow:0 4px 14px rgba(0,0,0,.4)}' +
    '.nylo-home-float span{display:none}' +
    '@media(max-width:760px){html.nylo-mobile-menu-home .topbar>.nylo-home{display:none!important}.nylo-mobile-menu-home .menu-pop>.nylo-home{display:flex;width:100%;justify-content:flex-start;padding:9px 10px;border:0;border-radius:6px;font-size:13px}.nylo-mobile-menu-home .menu-pop>.nylo-home span{display:inline}}';
  document.head.appendChild(st);

  var ov;
  function build() {
    if (!document.documentElement.hasAttribute('data-home-inline')) {
      var f = document.createElement('div');
      f.innerHTML = window.nyloHomeBtn();
      f = f.firstChild; f.className += ' nylo-home-float';
      document.body.appendChild(f);
    } else {
      if (document.querySelector('.menu-wrap')) document.documentElement.classList.add('nylo-mobile-menu-home');
      var updateGameMenu = function () {
        var mobile = window.matchMedia && window.matchMedia('(max-width:760px)').matches;
        var topbar = document.querySelector('.topbar');
        var menu = document.querySelector('.menu-wrap .menu-pop');
        var homeInMenu = document.querySelector('.menu-pop>.nylo-home[data-home]');
        var homeInBar = topbar && topbar.querySelector(':scope > .nylo-home[data-home]');
        if (mobile && menu && homeInBar) menu.appendChild(homeInBar);
        else if (!mobile && topbar && homeInMenu) topbar.insertBefore(homeInMenu, document.querySelector('.menu-wrap'));

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
      };
      updateGameMenu();
      new MutationObserver(updateGameMenu).observe(document.body, { childList: true, subtree: true });
      window.addEventListener('resize', updateGameMenu);
      document.addEventListener('keydown', function (e) {
        var label = e.target.closest && e.target.closest('.nylo-menu-action');
        if (label && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); label.click(); }
      });
    }
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
  // delegato: funziona anche per i pulsanti ridisegnati dal render delle pagine
  document.addEventListener('click', function (e) {
    var b = e.target.closest && e.target.closest('[data-home],[data-back]');
    if (!b || !ov) return;
    var back = b.getAttribute('data-back');
    ov._to = back || '/';
    ov.querySelector('[data-title]').textContent = back ? 'Tornare ' + (b.getAttribute('data-back-what') || 'alla lista dei giochi') + '?' : 'Tornare alla home?';
    ov.querySelector('[data-yes]').textContent = !back ? 'Torna alla home' : back === '/tt/' ? 'Torna ai giochi' : 'Torna indietro';
    ov.querySelector('[data-warn]').style.display = gameOver() ? 'none' : '';
    ov.style.display = 'flex'; ov.querySelector('[data-no]').focus();
  });
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', build); else build();
})();
