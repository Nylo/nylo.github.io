# Random Gallery

Una webapp statica che estrae casualmente un'immagine per ciascuna delle 5 categorie, con possibilità di ri-randomizzare.

## Struttura del progetto

```
random-gallery/
├── index.html          ← webapp completa
└── images/
    ├── categoria-a/
    │   ├── 01.jpg
    │   ├── 02.jpg
    │   └── ...
    ├── categoria-b/
    ├── categoria-c/
    ├── categoria-d/
    └── categoria-e/
```

## Come personalizzarlo

Apri `index.html` e modifica la sezione **CONFIGURAZIONE** (righe ~130-180):

```js
const CATEGORIES = [
  {
    name: "Il mio nome categoria",   // ← nome visualizzato
    images: [
      "images/mia-cat/foto1.jpg",    // ← percorso relativo
      "images/mia-cat/foto2.jpg",
      ...
    ]
  },
  ...
];
```

Ogni categoria può avere 5 o 6 immagini (o quante ne vuoi).

## Come pubblicarlo su GitHub Pages

1. Crea un nuovo repository su GitHub (es. `random-gallery`)
2. Carica tutti i file (inclusa la cartella `images/`)
3. Vai su **Settings → Pages**
4. In *Source* seleziona il branch `main` e la cartella `/ (root)`
5. Clicca **Save** — dopo qualche secondo il sito sarà online a:
   `https://tuousername.github.io/random-gallery/`

## Note

- Nessuna dipendenza esterna (eccetto Google Fonts, opzionale)
- Funziona offline se rimuovi il link al font Google
- Compatibile con tutti i browser moderni
