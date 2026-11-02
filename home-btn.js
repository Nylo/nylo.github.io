// Pulsante "casetta" per tornare alla home: chiede conferma con una finestra modale.
// Nelle pagine con <html data-home-inline> il pulsante è nella barra in alto (window.nyloHomeBtn());
// nelle altre compare un pulsante tondo fisso in basso a sinistra.
(function () {
  if (window.self !== window.top) { window.nyloHomeBtn = function () { return ''; }; return; }   // non negli iframe
  var SVG = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 11l9-8 9 8"/><path d="M5 10v10h5v-6h4v6h5V10"/></svg>';
  window.nyloHomeBtn = function () {
    return '<button type="button" class="nylo-home" data-home="1" title="Torna alla home" aria-label="Torna alla home">' + SVG + '<span>Home</span></button>';
  };
  var st = document.createElement('style');
  st.textContent = '.nylo-home{display:inline-flex;align-items:center;gap:6px;padding:5px 10px;border-radius:7px;border:1px solid var(--border,rgba(255,255,255,.35));background:transparent;color:var(--text-soft,#cbd5e1);font:500 12px Inter,system-ui,sans-serif;cursor:pointer;white-space:nowrap}' +
    '.nylo-home:hover{background:var(--surface-raised,rgba(255,255,255,.1));color:var(--text,#fff)}' +
    '@media(max-width:600px){.nylo-home span{display:none}.nylo-home{padding:5px 8px}}' +
    '.nylo-home-float{position:fixed;left:12px;bottom:12px;z-index:2147483000;width:42px;height:42px;justify-content:center;border-radius:50%;background:rgba(15,23,42,.88);color:#f1f5f9;border-color:rgba(255,255,255,.45);box-shadow:0 4px 14px rgba(0,0,0,.4)}' +
    '.nylo-home-float span{display:none}';
  document.head.appendChild(st);

  var ov;
  function build() {
    if (!document.documentElement.hasAttribute('data-home-inline')) {
      var f = document.createElement('div');
      f.innerHTML = window.nyloHomeBtn();
      f = f.firstChild; f.className += ' nylo-home-float';
      document.body.appendChild(f);
    }
    ov = document.createElement('div');
    ov.style.cssText = 'position:fixed;inset:0;z-index:2147483001;display:none;align-items:center;justify-content:center;background:rgba(0,0,0,.55);padding:16px;font-family:Inter,system-ui,sans-serif';
    ov.innerHTML = '<div role="dialog" aria-modal="true" style="width:min(340px,100%);padding:20px;border-radius:12px;background:#1e293b;color:#f1f5f9;border:1px solid #475569;box-shadow:0 14px 40px rgba(0,0,0,.5)">' +
      '<div style="font-size:16px;font-weight:600;margin-bottom:6px">Tornare alla home?</div>' +
      '<div data-warn style="font-size:13px;color:#cbd5e1;margin-bottom:16px;line-height:1.5">La partita in corso andrà persa.</div>' +
      '<div style="display:flex;gap:8px;justify-content:flex-end">' +
      '<button type="button" data-no style="padding:8px 14px;border-radius:7px;border:1px solid #64748b;background:transparent;color:#e2e8f0;cursor:pointer;font-size:13px">Annulla</button>' +
      '<button type="button" data-yes style="padding:8px 14px;border-radius:7px;border:0;background:#0d9488;color:#fff;font-weight:600;cursor:pointer;font-size:13px">Torna alla home</button></div></div>';
    document.body.appendChild(ov);
    ov.addEventListener('click', function (e) { if (e.target === ov || e.target.hasAttribute('data-no')) ov.style.display = 'none'; });
    ov.querySelector('[data-yes]').addEventListener('click', function () { location.href = '/'; });
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
    var b = e.target.closest && e.target.closest('[data-home]');
    if (!b || !ov) return;
    ov.querySelector('[data-warn]').style.display = gameOver() ? 'none' : '';
    ov.style.display = 'flex'; ov.querySelector('[data-no]').focus();
  });
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', build); else build();
})();
