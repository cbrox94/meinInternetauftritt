# CLAUDE.md

Persönliche Portfolio-/Lebenslauf-Website von Christoph Bröxkes (IT Consultant).
Statische Seite ohne Build-Schritt und ohne Framework, veröffentlicht über
**GitHub Pages direkt vom Branch `main`** – alles, was auf `main` landet, ist sofort live.

## Projektstruktur

| Datei | Inhalt |
|---|---|
| `index.html` | Gesamtes Markup: Navigation, Hero, Skills, Lebenslauf-Abschnitte, Hobbies, Skill-Modal |
| `css/style.css` | Komplettes Styling inkl. Responsive-Breakpoints (≤768px, 769–1024px) |
| `data/skills.js` | **Inhaltsdaten**: `skillsData`, `categoryMap`, `referenceIdMap` |
| `js/app.js` | Logik: Kategorie-Filter, Skill-Balken, Modal, Sprung zu Referenzen, Animationen |
| `Portrait.jpg`, `CV_BroexkesC.pdf` | Foto im Hero, Lebenslauf-Download |
| `tests/site.spec.js` | Playwright-Tests (Desktop + Mobil) |

Skripte werden als klassische `<script>`-Tags geladen (kein ES-Modul, kein Bundler):
erst `data/skills.js`, dann `js/app.js`. Funktionen wie `filterByCategory`, `openModal`,
`closeModal` werden über `onclick`-Attribute im HTML aufgerufen und müssen global bleiben.

## So funktioniert der Skills-Bereich

- `skillsData`: ein Eintrag pro Skill mit `name`, `category`, `score`, `references[]`.
- `category` muss exakt einem Wert aus `categoryMap` entsprechen.
- Kategoriebalken: Höhe = Summe der `score`-Werte der Kategorie relativ zur größten Kategorie
  (wird in `animateVerticalBars()` berechnet – **keine Höhen von Hand ins HTML schreiben**).
- Einzelne Skill-Balken: Höhe = `score` relativ zum höchsten Score der gewählten Kategorien.
- Referenzen (`references[].title`) werden über `referenceIdMap` auf eine `id="ref-…"`
  in `index.html` abgebildet; ein Klick im Modal scrollt dorthin.
- Referenz-Typen: `job`, `cert`, `training`, `edu`, `hobby` (Labels in `openModal()`).
- `intensity` an Referenzen wird derzeit nicht ausgewertet.

## Typische Änderungen

**Neuen Skill hinzufügen** → nur `data/skills.js`: Eintrag in `skillsData` mit gültiger
Kategorie; jede Referenz-`title` muss in `referenceIdMap` existieren. Bei langen Namen ggf.
einen Zeilenumbruch in der `.replace()`-Kette von `generateMultiCategorySkillBars()` ergänzen.

**Neue Station im Lebenslauf / neues Zertifikat / neue Schulung** → in `index.html` den
Abschnitt mit eindeutiger `id="ref-…"` anlegen, in `referenceIdMap` eintragen und bei
passenden Skills als Referenz ergänzen.

**Neue Kategorie** → `categoryMap` und `colorMap` (`js/app.js`), Legende und Kategoriebalken
in `index.html` (`data-category`) sowie Balkenfarbe in `css/style.css` (`.bar-<key>`) ergänzen.

**Lebenslauf-PDF ersetzen** → Dateiname `CV_BroexkesC.pdf` beibehalten (sonst `href` anpassen).

## Prüfen vor jedem Commit

```bash
npm install        # einmalig (in Cloud-Sitzungen erledigt das der SessionStart-Hook)
npm run check      # HTML-Lint (htmlhint) + Playwright-Tests
```

Die Tests prüfen u. a.: keine JS-Fehler, keine fehlenden Dateien, alle Referenzen zeigen auf
existierende IDs, Kategoriebalken korrekt berechnet, Filter/Modal/Sprung funktionieren,
kein horizontales Scrollen auf Mobil. Neue Features bekommen einen passenden Test in
`tests/site.spec.js`. Tests nie abschalten oder überspringen, um grün zu werden.

Die gleiche Prüfung läuft als GitHub Action (`.github/workflows/ci.yml`) bei jedem Pull
Request und Push auf `main`.

## Konventionen

- Inhalte und UI-Texte auf **Deutsch**, Code-Kommentare kurz (Deutsch oder Englisch).
- Farbwelt: Grüntöne (`#10b981`, `#059669`, `#047857`, `#065f46`), Schrift Inter.
- Änderungen über einen eigenen Branch + Pull Request, nicht direkt auf `main` (geht sofort live).
- Keine Build-Tools, Frameworks oder externen JS-Bibliotheken einführen, ohne nachzufragen.
- Alle Dateien im Repository sind über die Website-URL öffentlich abrufbar –
  keine privaten Daten, Notizen oder Zugangsdaten committen.
- Layout immer auch in der mobilen Ansicht prüfen.
