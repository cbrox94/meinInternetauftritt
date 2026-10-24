# CLAUDE.md

Persönliche Portfolio-/Lebenslauf-Website von Christoph Bröxkes (IT Consultant).
Statische Seite ohne Build-Schritt und ohne Framework, veröffentlicht über
**GitHub Pages direkt vom Branch `main`** – alles, was auf `main` landet, ist sofort live.

Aufbau: links eine (auf Desktop sticky) **Randspalte** mit Kopf und kompaktem Lebenslauf,
rechts der **Hauptbereich** mit Profiltext, Kompetenz-Diagramm, **Referenzen** (Projekte),
Eigenen Projekten, Ausgleich und Footer. Ab ≤ 1024px einspaltig, die Randspalte wird zum
Kopfbereich mit Akkordeons.

## Projektstruktur

| Datei | Inhalt |
|---|---|
| `index.html` | Nur das statische Gerüst (Container mit IDs); alle Inhalte rendert `js/app.js` |
| `css/style.css` | Komplettes Styling; Design-Tokens als Custom Properties in `:root`; Breakpoints ≤1024px und ≤600px |
| `data/profile.js` | `profile`: Name, Kontakt, Profiltext, Stationen, studentische Tätigkeiten, Ausbildung, Zertifikate, Schulungen, Eigene Projekte, Hobbies, Footer |
| `data/skills.js` | `skillsData` (Skills mit `category`-Key und `score`), `categories` (Name, Balkenlabel, Farbe) |
| `data/projects.js` | `projects`: Referenzen mit Station und Skills |
| `js/app.js` | Zustand, Rendering, Filterlogik, Diagramm, Animationen |
| `Portrait.jpg`, `CV_BroexkesC.pdf` | Foto, Lebenslauf-Download |
| `tests/site.spec.js` | Playwright-Tests (Desktop + Mobil) |

Skripte werden als klassische `<script>`-Tags geladen (kein ES-Modul, kein Bundler), Reihenfolge:
`data/profile.js`, `data/skills.js`, `data/projects.js`, `js/app.js`. Die Daten liegen als
globale `const`. Es gibt **keine** `onclick`-Attribute: Interaktionen laufen über
Event-Delegation mit `data-action="…"` (z. B. `pick-skill`, `pick-station`, `pick-category`).

## Datenmodell

- Datumsformat überall `'YYYY-MM'`, `to: null` = laufend. Anzeigeformate („MM/JJJJ“,
  „seit MM/JJJJ“, „JJJJ – JJJJ“) erzeugen `formatMonth()`, `formatRange()`, `formatYears()` in
  `js/app.js` – keine fertigen Datumsstrings in die Daten schreiben.
- `skillsData[key]`: `name`, `category` (Key aus `categories`), `score`, optional `label` mit
  weichem Trennzeichen `­` für lange Wörter, `references` (nur Dokumentation der
  Score-Grundlage, wird nicht angezeigt).
- `profile.stations[]`: filterbare Stationen mit `id`, `title`, `org`, `orgShort`, `badge`, `from`, `to`.
- `projects[]`: `id` (eindeutig, kebab-case), `station` (id aus `profile.stations`), `title`,
  `from`, `to`, `context`, `role`, `summary`, optional `situation`, `tasks`, `result`, `team`,
  `skills` (Keys aus `skillsData`).

## So funktioniert die Interaktion

- Zentraler Zustand `state = { categories, skill, station, openProjects }`; `setState()` ruft
  `render()` auf. `categories: []` bedeutet „Alle“.
- Legende: Mehrfachauswahl; keine oder alle 4 Kategorien gewählt → „Alle“.
- Ebene 1 (Alle): Kategoriebalken, Höhe = Summe der Scores relativ zur größten Kategorie.
  Ebene 2: Skills der gewählten Kategorien, absteigend nach Score, Höhe relativ zum höchsten
  Score. **Keine Höhen von Hand ins HTML schreiben.**
- **Alle Zähler „N Referenzen“ werden aus `projects[*].skills` bzw. `projects[*].station`
  berechnet** (unter Berücksichtigung des jeweils anderen aktiven Filters).
- Klick auf Skill (Balken oder Tag in einer Karte) bzw. Station (Randspalte oder Badge) toggelt
  den jeweiligen Filter. „Filter zurücksetzen“ setzt Skill + Station zurück, nicht die Legende.

## Typische Änderungen

**Neue Referenz** → nur `data/projects.js`: Objekt mit gültiger `station` und `skills`.
Zähler, Filter und Sortierung ergeben sich automatisch.

**Neue Station** → Eintrag in `profile.stations` (`data/profile.js`); Projekte darauf verweisen.

**Neuer Skill** → nur `data/skills.js`: Eintrag in `skillsData` mit gültigem Kategorie-Key;
bei langen Einzelwörtern `label` mit `­` ergänzen.

**Neues Zertifikat / neue Schulung / Ausbildung** → entsprechendes Array in `data/profile.js`.

**Neue Kategorie** → `categories` in `data/skills.js` und Farb-Token `--cat-<key>` in
`css/style.css` ergänzen.

**Lebenslauf-PDF ersetzen** → Dateiname `CV_BroexkesC.pdf` beibehalten (sonst `profile.cv` anpassen).

## Vertraulichkeit der Projekttexte

Referenzen beschreiben Kundenprojekte. Kunden und Projekte **anonymisiert** beschreiben
(Branche statt Kundenname, keine Projektnamen, keine internen Systeme oder Interna).
Platzhalter in eckigen Klammern (`'[Titel folgt]'`) dürfen nicht nach `main` – der Test
„Platzhalter-Wächter“ schlägt dann fehl.

## Prüfen vor jedem Commit

```bash
npm install        # einmalig (in Cloud-Sitzungen erledigt das der SessionStart-Hook)
npm run check      # HTML-Lint (htmlhint) + Playwright-Tests
```

Die Tests prüfen u. a.: keine JS-Fehler, keine fehlenden Dateien, Datenkonsistenz (Stationen,
Skills, Kategorien, eindeutige IDs, Datumsformat), Balkenhöhen aus Scores, Legende, Skill- und
Stationsfilter, Details-Toggle, Aufklapplisten/Akkordeons, sticky Randspalte, kein horizontales
Scrollen, keine Platzhalter in `data/projects.js`. Neue Features bekommen einen passenden Test
in `tests/site.spec.js`. Tests nie abschalten oder überspringen, um grün zu werden.

Die gleiche Prüfung läuft als GitHub Action (`.github/workflows/ci.yml`) bei jedem Pull
Request und Push auf `main`.

## Konventionen

- Inhalte und UI-Texte auf **Deutsch**, Code-Kommentare kurz (Deutsch oder Englisch).
- Design-Tokens aus `:root` verwenden (Grüntöne, Schrift Inter); keine Verlaufsflächen,
  keine farbigen Linksrahmen an Karten, keine Emojis.
- Bedienelemente sind echte `<button>`/`<a href>` mit sichtbarem Fokus und korrekten
  `aria-pressed`/`aria-expanded`; Texte per `textContent`, nie ungeprüft per `innerHTML`.
- Änderungen über einen eigenen Branch + Pull Request, nicht direkt auf `main` (geht sofort live).
- Keine Build-Tools, Frameworks oder externen JS-Bibliotheken einführen, ohne nachzufragen.
- Alle Dateien im Repository sind über die Website-URL öffentlich abrufbar –
  keine privaten Daten, Notizen oder Zugangsdaten committen.
- Layout immer auch in der mobilen Ansicht prüfen.
