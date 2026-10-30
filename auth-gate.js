// Blocco di accesso condiviso: le pagine figlie restano nascoste finché non è stata inserita la password.
// Lo stato è condiviso con la home (stessa chiave in localStorage). È una protezione lato client.
(function () {
  var PW_HASH = 'ad2fcdb7122f8f450a8f1c8a9f88a7632b1d5e561b93d66e735564e2e892100d';
  var KEY = 'nylo-unlocked';
  try { if (localStorage.getItem(KEY) === PW_HASH) return; } catch (e) {}

  var st = document.createElement('style');
  st.textContent = 'html{visibility:hidden!important}#nylo-gate{visibility:visible!important}';
  document.documentElement.appendChild(st);

  function sha256(s) {
    return crypto.subtle.digest('SHA-256', new TextEncoder().encode(s)).then(function (b) {
      return Array.prototype.map.call(new Uint8Array(b), function (x) { return ('0' + x.toString(16)).slice(-2); }).join('');
    });
  }

  function build() {
    var g = document.createElement('div');
    g.id = 'nylo-gate';
    g.style.cssText = 'position:fixed;inset:0;z-index:2147483647;display:flex;align-items:center;justify-content:center;background:linear-gradient(#142b34,#0e1e25);font-family:Inter,system-ui,sans-serif;color:#e2e8f0';
    g.innerHTML =
      '<form autocomplete="off" style="width:min(320px,90vw);padding:20px;border:1px solid rgba(100,116,139,.5);border-radius:14px;background:rgba(15,23,42,.95)">' +
      '<div style="font-size:15px;margin-bottom:10px">Password di accesso</div>' +
      '<div style="display:flex;gap:8px"><input type="password" autocomplete="off" style="flex:1;min-width:0;padding:8px 10px;border-radius:8px;border:1px solid #334155;background:#1e293b;color:#f1f5f9;outline:none">' +
      '<button type="submit" style="padding:8px 12px;border:0;border-radius:8px;background:#0d9488;color:#fff;font-weight:600;cursor:pointer">Entra</button></div>' +
      '<div class="err" style="display:none;margin-top:8px;font-size:12px;color:#f87171">Password errata</div>' +
      '<a href="/" style="display:inline-block;margin-top:12px;font-size:12px;color:#94a3b8">← Home</a></form>';
    var f = g.firstChild, inp = f.querySelector('input'), err = f.querySelector('.err');
    f.addEventListener('submit', function (e) {
      e.preventDefault();
      sha256(inp.value).then(function (h) {
        if (h === PW_HASH) {
          try { localStorage.setItem(KEY, PW_HASH); } catch (x) {}
          g.remove(); st.remove();
        } else { err.style.display = 'block'; inp.select(); }
      });
    });
    document.documentElement.appendChild(g);
    inp.focus();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', build); else build();
})();
