# meinInternetauftritt

Persönliche Portfolio-Website von Christoph Bröxkes – IT Consultant, Economist, Teamplayer.

**Live:** https://cbrox94.github.io/meinInternetauftritt/

Statische Seite (HTML, CSS, JavaScript) ohne Build-Schritt, veröffentlicht über GitHub Pages
vom Branch `main`. Im Mittelpunkt stehen Kompetenzen und Projekt-Referenzen: Ein Klick auf einen
Skill im Balkendiagramm oder auf eine Station in der Randspalte filtert die Referenzen. Der
Lebenslauf (Stationen, Ausbildung, Zertifikate, Schulungen) steht kompakt in der linken Randspalte.

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

- `index.html` – Seitengerüst (Inhalte werden aus `data/` gerendert)
- `css/style.css` – Styling inkl. Design-Tokens
- `data/profile.js` – Profil, Kontakt, Lebenslauf, Eigene Projekte
- `data/skills.js` – Skills und Kategorien
- `data/projects.js` – Referenzen (Projekte)
- `js/app.js` – Rendern, Diagramm und Filter
- `tests/` – automatisierte Tests

Hinweise für die Arbeit mit Claude Code stehen in [`CLAUDE.md`](CLAUDE.md).
