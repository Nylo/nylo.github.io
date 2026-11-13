// Registra il service worker (solo su https o localhost): salva sul dispositivo pagine, script, font e icone già visti,
// così il sito si apre più in fretta e le partite contro l'AI funzionano anche senza connessione.
(function () {
  if (!('serviceWorker' in navigator)) return;
  if (location.protocol !== 'https:' && location.hostname !== 'localhost' && location.hostname !== '127.0.0.1') return;
  var firstVisit = !navigator.serviceWorker.controller;
  window.addEventListener('load', function () {
    navigator.serviceWorker.register('/sw.js').then(function () { return navigator.serviceWorker.ready; }).then(function () {
      // alla primissima visita la pagina corrente è stata caricata prima del service worker: la salviamo ora
      if (firstVisit) return navigator.serviceWorker.ready.then(function (r) { if (r.active) r.active.postMessage({ type: 'cache', url: location.pathname + location.search, assets: performance.getEntriesByType('resource').map(function (e) { return e.name; }) }); });
    }).catch(function () {});
  });
})();
