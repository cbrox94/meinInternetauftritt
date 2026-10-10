# CLAUDE.md

Persönliche Portfolio-/Lebenslauf-Website von Christoph Bröxkes (IT Consultant).
Statische Seite ohne Build-Schritt und ohne Framework, veröffentlicht über
**GitHub Pages direkt vom Branch `main`** – alles, was auf `main` landet, ist sofort live.

## Projektstruktur

| Datei | Inhalt |
|---|---|
| `index.html` | Nur das statische Gerüst: Randspalte (`aside.sidebar`) + Hauptbereich (`main`) |
| `css/style.css` | Komplettes Styling; Design-Tokens als CSS-Variablen in `:root`; Breakpoint ≤1024px (einspaltig) |
| `data/profile.js` | **Inhaltsdaten** `profile`: Kopf, Kontakt, Profiltext, Stationen, studentische Tätigkeiten, Ausbildung, Zertifikate, Schulungen, Eigene Projekte, Hobbies, Footer |
| `data/skills.js` | **Inhaltsdaten** `skillsData` (Skills mit Score) und `categories` |
| `data/projects.js` | **Inhaltsdaten** `projects`: Referenzen (Projekte) – Hauptinhalt der Seite |
| `js/app.js` | Logik: Zustand + Rendern, Diagramm, Filter, Aufklapplisten |
| `Portrait.jpg`, `CV_BroexkesC.pdf` | Foto, Lebenslauf-Download |
| `tests/site.spec.js` | Playwright-Tests (Desktop + Mobil) |

Skripte werden als klassische `<script>`-Tags geladen (kein ES-Modul, kein Bundler), Reihenfolge:
`data/profile.js`, `data/skills.js`, `data/projects.js`, `js/app.js`. Alle Listen werden per JS
aus den Daten gerendert – **Inhalte nie direkt in `index.html` schreiben.**

## So funktioniert die Seite

- **Layout:** ≥1025px zwei Spalten mit stickiger Randspalte (Lebenslauf kompakt) und Hauptbereich
  (Profil, Kompetenzen, Referenzen, Eigene Projekte). ≤1024px eine Spalte; die Randspalten-Abschnitte
  sind dann `<details>`-Akkordeons (zugeklappt).
- **Zustand** in `js/app.js`: `state = { categories, skill, station, openProjects }`; Änderungen nur über
  `setState()`, das `render()` aufruft. Bedienelemente sind echte `<button>`/`<a>` mit `data-action`
  (Event-Delegation), keine Inline-`onclick`. Text immer per `textContent` setzen.
- **Diagramm:** Ebene 1 = Kategoriebalken (Höhe = Summe der Scores relativ zur größten Kategorie),
  Ebene 2 = Skills der gewählten Kategorien (Höhe = Score relativ zum höchsten Score), absteigend.
  Legende mit Mehrfachauswahl; alle 4 gewählt oder keine → „Alle“.
- **Filter:** Klick auf Skill (Balken oder Tag in einer Karte) bzw. Station (Randspalte oder Badge) filtert
  die Referenzen. Alle Zähler „N Referenzen“ werden **nur aus `projects[*].skills`/`.station` berechnet**
  (`skillsData[*].references` dokumentiert nur die Score-Grundlage und wird nicht angezeigt).

## Datenmodell

- Datumswerte überall `'YYYY-MM'`, `to: null` = laufend. Anzeigeformate erzeugt `app.js`.
- `profile.stations[]`: `id`, `title`, `org`, `orgShort`, `location`, `badge` (Kurzlabel auf Karten), `from`, `to`.
- `projects[]`: `id` (eindeutig, kebab-case), `station` (id aus `profile.stations`), `title`, `from`, `to`,
  `context`, `role`, `summary` (ein Satz), optional `situation`, `tasks`, `result`, `team`, `skills` (Keys aus `skillsData`).
- `skillsData[key]`: `name`, optional `label` (mit `\u00AD` als Trennstelle für lange Wörter), `category`
  (Key aus `categories`), `score`, `references`.
- `categories[key]`: `name`, `barLabel` (`\n` = Zeilenumbruch), `color` (CSS-Variable `--cat-*`).

## Typische Änderungen

**Neue Referenz** → nur `data/projects.js`. **Vertraulich:** Kunden und Projekte anonymisiert beschreiben
(Branche statt Kundenname, keine internen System- oder Projektnamen, Zahlen nur, wenn belegbar).

**Neue Station** → Eintrag in `profile.stations` (`data/profile.js`); Referenzen verweisen per `station` darauf.

**Neuer Skill** → Eintrag in `skillsData` mit gültigem Kategorie-Key; bei langen Wörtern `label` mit `\u00AD`.

**Zertifikat / Schulung / Ausbildung / studentische Tätigkeit** → jeweilige Liste in `data/profile.js`.

**Neue Kategorie** → `categories` in `data/skills.js` und Farbe `--cat-<key>` in `css/style.css`.

**Lebenslauf-PDF ersetzen** → Dateiname `CV_BroexkesC.pdf` beibehalten (sonst `profile.cv.href` anpassen).

## Prüfen vor jedem Commit

```bash
npm install        # einmalig (in Cloud-Sitzungen erledigt das der SessionStart-Hook)
npm run check      # HTML-Lint (htmlhint) + Playwright-Tests
```

Die Tests prüfen u. a.: keine JS-Fehler, keine fehlenden Dateien, Datenkonsistenz (Stationen,
Skills, Kategorien, Datumsformate), Kategoriebalken korrekt berechnet, Legende/Skill-/Stationsfilter,
Aufklapplisten, Layout (sticky Randspalte, kein horizontales Scrollen) und dass `data/projects.js`
keine `[Platzhalter]` mehr enthält. Neue Features bekommen einen passenden Test in
`tests/site.spec.js`. Tests nie abschalten oder überspringen, um grün zu werden.

Die gleiche Prüfung läuft als GitHub Action (`.github/workflows/ci.yml`) bei jedem Pull
Request und Push auf `main`.

## Konventionen

- Inhalte und UI-Texte auf **Deutsch**, Code-Kommentare kurz (Deutsch oder Englisch).
- Farben nur über die Design-Tokens in `:root` (`--ink`, `--muted`, `--accent`, `--cat-*` …), Schrift Inter.
- Keine Emojis, keine Verlaufsflächen; sichtbarer Fokus und `aria-pressed`/`aria-expanded` pflegen.
- Änderungen über einen eigenen Branch + Pull Request, nicht direkt auf `main` (geht sofort live).
- Keine Build-Tools, Frameworks oder externen JS-Bibliotheken einführen, ohne nachzufragen.
- Alle Dateien im Repository sind über die Website-URL öffentlich abrufbar –
  keine privaten Daten, Notizen oder Zugangsdaten committen.
- Layout immer auch in der mobilen Ansicht prüfen.
