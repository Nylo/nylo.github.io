// Pulsante "casetta" fisso nelle pagine dei giochi: chiede conferma e torna alla home del sito.
(function () {
  if (window.self !== window.top) return;            // non nelle pagine caricate in iframe (es. regolamenti)
  function build() {
    var b = document.createElement('button');
    b.type = 'button';
    b.setAttribute('aria-label', 'Torna alla home');
    b.title = 'Torna alla home';
    b.style.cssText = 'position:fixed;left:12px;bottom:12px;z-index:2147483000;width:42px;height:42px;display:flex;align-items:center;justify-content:center;border-radius:50%;border:1px solid rgba(255,255,255,.45);background:rgba(15,23,42,.88);color:#f1f5f9;cursor:pointer;box-shadow:0 4px 14px rgba(0,0,0,.4)';
    b.innerHTML = '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 11l9-8 9 8"/><path d="M5 10v10h5v-6h4v6h5V10"/></svg>';
    document.body.appendChild(b);

    var ov = document.createElement('div');
    ov.style.cssText = 'position:fixed;inset:0;z-index:2147483001;display:none;align-items:center;justify-content:center;background:rgba(0,0,0,.55);padding:16px;font-family:Inter,system-ui,sans-serif';
    ov.innerHTML = '<div role="dialog" aria-modal="true" style="width:min(340px,100%);padding:20px;border-radius:12px;background:#1e293b;color:#f1f5f9;border:1px solid #475569;box-shadow:0 14px 40px rgba(0,0,0,.5)">' +
      '<div style="font-size:16px;font-weight:600;margin-bottom:6px">Tornare alla home?</div>' +
      '<div style="font-size:13px;color:#cbd5e1;margin-bottom:16px;line-height:1.5">La partita in corso andrà persa.</div>' +
      '<div style="display:flex;gap:8px;justify-content:flex-end">' +
      '<button type="button" data-no style="padding:8px 14px;border-radius:7px;border:1px solid #64748b;background:transparent;color:#e2e8f0;cursor:pointer;font-size:13px">Annulla</button>' +
      '<button type="button" data-yes style="padding:8px 14px;border-radius:7px;border:0;background:#0d9488;color:#fff;font-weight:600;cursor:pointer;font-size:13px">Torna alla home</button></div></div>';
    document.body.appendChild(ov);

    function open() { ov.style.display = 'flex'; ov.querySelector('[data-no]').focus(); }
    function close() { ov.style.display = 'none'; }
    b.addEventListener('click', open);
    ov.addEventListener('click', function (e) { if (e.target === ov || e.target.hasAttribute('data-no')) close(); });
    ov.querySelector('[data-yes]').addEventListener('click', function () { location.href = '/'; });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') close(); });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', build); else build();
})();
