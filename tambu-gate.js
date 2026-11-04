// Blocco di accesso dell'area Tambu (password separata da quella della home). Protezione lato client.
(function () {
  // accetta sia la vecchia password dell'area Tambu sia quella dell'area Lab della home
  var PW_HASHES = ['ee3285b0d4cd738c1216cc988fa4728e1a3bbb26216b4a473cf12eeedafd18ce', 'c57025ae9174f33c56f41db133f1b855c82502a687de8eddcb9e1d6fa491bdfb'];
  var KEY = 'nylo-tambu-unlocked';
  try { if (PW_HASHES.indexOf(localStorage.getItem(KEY)) >= 0) return; } catch (e) {}

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
    g.style.cssText = 'position:fixed;inset:0;z-index:2147483647;display:flex;align-items:center;justify-content:center;background:#0a0c10;font-family:Inter,system-ui,sans-serif;color:#e2e8f0';
    g.innerHTML =
      '<form autocomplete="off" style="width:min(320px,90vw);padding:20px;border:1px solid rgba(100,116,139,.5);border-radius:14px;background:rgba(15,23,42,.95)">' +
      '<div style="font-size:15px;margin-bottom:10px">Password area Lab</div>' +
      '<div style="display:flex;gap:8px"><input type="password" autocomplete="off" style="flex:1;min-width:0;padding:8px 10px;border-radius:8px;border:1px solid #334155;background:#1e293b;color:#f1f5f9;outline:none">' +
      '<button type="submit" style="padding:8px 12px;border:0;border-radius:8px;background:#0d9488;color:#fff;font-weight:600;cursor:pointer">Entra</button></div>' +
      '<div class="err" style="display:none;margin-top:8px;font-size:12px;color:#f87171">Password errata</div>' +
      '<a href="/" style="display:inline-block;margin-top:12px;font-size:12px;color:#94a3b8">← Home</a></form>';
    var f = g.firstChild, inp = f.querySelector('input'), err = f.querySelector('.err');
    f.addEventListener('submit', function (e) {
      e.preventDefault();
      sha256(inp.value).then(function (h) {
        if (PW_HASHES.indexOf(h) >= 0) {
          try { localStorage.setItem(KEY, h); } catch (x) {}
          g.remove(); st.remove();
        } else { err.style.display = 'block'; inp.select(); }
      });
    });
    document.documentElement.appendChild(g);
    inp.focus();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', build); else build();
})();
