# meinInternetauftritt

Persönliche Portfolio-Website von Christoph Bröxkes – IT Consultant, Economist, Teamplayer.

**Live:** https://cbrox94.github.io/meinInternetauftritt/

Statische Seite (HTML, CSS, JavaScript) ohne Build-Schritt, veröffentlicht über GitHub Pages
vom Branch `main`. Herzstück ist eine interaktive Skill-Visualisierung: Kategorien filtern,
Skills anklicken und direkt zur passenden Station im Lebenslauf springen.

## Lokal ansehen

`index.html` im Browser öffnen – oder mit lokalem Server:

```bash
python3 -m http.server 8000   # dann http://localhost:8000
```

## Prüfen

```bash
npm install
npm run check   # HTML-Lint + Playwright-Tests (Desktop & Mobil)
```

Beim ersten Mal außerhalb von Claude Code zusätzlich: `npx playwright install chromium`.

## Struktur

- `index.html` – Seiteninhalt
- `css/style.css` – Styling
- `data/skills.js` – Skills, Kategorien und Referenz-Zuordnung
- `js/app.js` – Interaktivität
- `tests/` – automatisierte Tests

Hinweise für die Arbeit mit Claude Code stehen in [`CLAUDE.md`](CLAUDE.md).
