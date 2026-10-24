// @ts-check
const fs = require('fs');
const path = require('path');
const { pathToFileURL } = require('url');
const { test, expect } = require('@playwright/test');

const pageUrl = pathToFileURL(path.join(__dirname, '..', 'index.html')).href;

/** Lädt die Seite und sammelt JS-Fehler sowie fehlgeschlagene lokale Dateien. */
async function openPage(page) {
  const problems = [];
  page.on('pageerror', (err) => problems.push(`JS-Fehler: ${err.message}`));
  page.on('requestfailed', (req) => {
    if (req.url().startsWith('file:')) problems.push(`Datei nicht gefunden: ${req.url()}`);
  });
  // Externe Ressourcen (Google Fonts) sind für die Tests irrelevant
  await page.route(/^https?:/, (route) => route.abort());
  await page.goto(pageUrl);
  return problems;
}

/** Öffnet auf Mobil das Akkordeon einer Randspalten-Gruppe (Desktop: immer offen). */
async function openGroup(page, id) {
  const group = page.locator(`#${id}`);
  if (!(await group.evaluate((el) => /** @type {HTMLDetailsElement} */ (el).open))) {
    await group.locator('summary').click();
  }
  await expect(group).toHaveAttribute('open', '');
}

/** IDs der angezeigten Referenzkarten */
function shownProjectIds(page) {
  return page.locator('#refGrid .ref-card').evaluateAll((cards) => cards.map((c) => c.getAttribute('data-project')));
}

test('Seite lädt ohne JS-Fehler und ohne fehlende Dateien', async ({ page }) => {
  const problems = await openPage(page);
  await expect(page.locator('.sidebar h1')).toHaveText('Christoph Bröxkes');
  const portrait = page.locator('.portrait');
  await expect(portrait).toHaveJSProperty('complete', true);
  expect(await portrait.evaluate((img) => /** @type {HTMLImageElement} */ (img).naturalWidth)).toBeGreaterThan(0);
  await expect(page.locator('#refGrid .ref-card').first()).toBeVisible();
  expect(problems).toEqual([]);
});

test('Lebenslauf-PDF ist verlinkt und vorhanden', async ({ page }) => {
  await openPage(page);
  const link = page.locator('a.cv-download');
  await expect(link).toHaveText('Lebenslauf (PDF)');
  await expect(link).toHaveAttribute('download', 'CV_Christoph_Broexkes.pdf');
  const href = await link.getAttribute('href');
  expect(href).toBeTruthy();
  expect(fs.existsSync(path.join(__dirname, '..', String(href)))).toBe(true);
});

test('Daten sind konsistent', async ({ page }) => {
  await openPage(page);
  const errors = await page.evaluate(() => {
    const errs = [];
    const ym = /^\d{4}-(0[1-9]|1[0-2])$/;
    const checkRange = (label, from, to) => {
      if (!ym.test(from)) errs.push(`${label}: from "${from}" nicht im Format YYYY-MM`);
      if (to !== null && !ym.test(to)) errs.push(`${label}: to "${to}" nicht im Format YYYY-MM`);
      if (to !== null && from > to) errs.push(`${label}: from liegt nach to`);
    };
    const checkDate = (label, date) => {
      if (!ym.test(date)) errs.push(`${label}: Datum "${date}" nicht im Format YYYY-MM`);
    };

    for (const [key, skill] of Object.entries(skillsData)) {
      if (!(skill.category in categories)) errs.push(`Skill ${key}: unbekannte Kategorie "${skill.category}"`);
      if (!(skill.score > 0)) errs.push(`Skill ${key}: score muss > 0 sein`);
    }

    const stationIds = profile.stations.map((s) => s.id);
    const ids = new Set();
    for (const p of projects) {
      if (ids.has(p.id)) errs.push(`Projekt-ID "${p.id}" doppelt`);
      ids.add(p.id);
      if (!stationIds.includes(p.station)) errs.push(`Projekt ${p.id}: Station "${p.station}" fehlt in profile.stations`);
      for (const s of p.skills) if (!(s in skillsData)) errs.push(`Projekt ${p.id}: Skill "${s}" fehlt in skillsData`);
      checkRange(`Projekt ${p.id}`, p.from, p.to);
    }

    profile.stations.forEach((s) => checkRange(`Station ${s.id}`, s.from, s.to));
    profile.studentJobs.forEach((s) => checkRange(`Studentisch ${s.title}`, s.from, s.to));
    profile.education.forEach((e) => checkRange(`Ausbildung ${e.degree}`, e.from, e.to));
    profile.certificates.forEach((c) => checkDate(`Zertifikat ${c.name}`, c.date));
    profile.trainings.forEach((t) => checkDate(`Schulung ${t.name}`, t.date));
    return errs;
  });
  expect(errors).toEqual([]);
});

test('Kategoriebalken werden aus den Scores berechnet', async ({ page }) => {
  await openPage(page);
  await page.locator('.chart-card').scrollIntoViewIfNeeded();
  const fills = page.locator('#chart .cbar .bar-fill');
  await expect(fills).toHaveCount(4);
  const expected = await page.evaluate(() => {
    const totals = {};
    for (const skill of Object.values(skillsData)) totals[skill.category] = (totals[skill.category] || 0) + skill.score;
    const max = Math.max(...Object.values(totals));
    return Object.keys(categories).map((key) => (totals[key] / max) * 220);
  });
  for (let i = 0; i < expected.length; i++) {
    await expect.poll(() => fills.nth(i).evaluate((el) => el.getBoundingClientRect().height)).toBeCloseTo(expected[i], 0);
  }
});

test('Legende: Mehrfachauswahl, Rücksprung zu „Alle“', async ({ page }) => {
  await openPage(page);
  const legend = (key) => page.locator(`#legend [data-category="${key}"]`);
  await expect(legend('all')).toHaveAttribute('aria-pressed', 'true');

  await legend('reqeng').click();
  await legend('pm').click();
  await expect(legend('all')).toHaveAttribute('aria-pressed', 'false');
  await expect(legend('pm')).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('#chart .cbar')).toHaveCount(0);

  const shown = await page.locator('#chart .sbar').evaluateAll((bars) => bars.map((b) => b.getAttribute('data-skill')));
  const expected = await page.evaluate(() => Object.entries(skillsData)
    .filter(([, s]) => s.category === 'reqeng' || s.category === 'pm')
    .map(([key]) => key));
  expect([...shown].sort()).toEqual([...expected].sort());
  const scores = await page.evaluate((keys) => keys.map((k) => skillsData[k].score), shown);
  for (let i = 1; i < scores.length; i++) expect(scores[i]).toBeLessThanOrEqual(scores[i - 1]);

  // Alle 4 gewählt → zurück zu Ebene 1
  await legend('data').click();
  await legend('tech').click();
  await expect(page.locator('#chart .cbar')).toHaveCount(4);
  await expect(legend('all')).toHaveAttribute('aria-pressed', 'true');

  // „Alle“ setzt zurück
  await legend('data').click();
  await expect(page.locator('#chart .sbar').first()).toBeVisible();
  await legend('all').click();
  await expect(page.locator('#chart .cbar')).toHaveCount(4);

  // Klick auf Kategoriebalken wählt die Kategorie
  await page.locator('#chart .cbar[data-category="tech"]').click();
  await expect(legend('tech')).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('#chart .sbar')).toHaveCount(await page.evaluate(() => Object.values(skillsData).filter((s) => s.category === 'tech').length));
});

test('Skill-Filter: Hinweisbox, gefilterte Referenzen, Sprung', async ({ page }) => {
  await openPage(page);
  const skill = await page.evaluate(() => projects[0].skills[0]);
  const category = await page.evaluate((s) => skillsData[s].category, skill);
  const expected = await page.evaluate((s) => projects.filter((p) => p.skills.includes(s)).map((p) => p.id), skill);

  await page.locator(`#legend [data-category="${category}"]`).click();
  const bar = page.locator(`#chart .sbar[data-skill="${skill}"]`);
  await bar.click();
  await expect(bar).toHaveAttribute('aria-pressed', 'true');

  const callout = page.locator('#skillCallout');
  await expect(callout).toBeVisible();
  const countText = expected.length === 1 ? '1 Referenz passend' : `${expected.length} Referenzen passend`;
  await expect(callout).toContainText(countText);
  expect((await shownProjectIds(page)).sort()).toEqual([...expected].sort());
  await expect(page.locator('#filterText')).toContainText('Gefiltert nach');

  await callout.getByRole('link', { name: 'Zu den Referenzen' }).click();
  await expect(page.locator('#referenzen')).toBeInViewport();
  await expect(page.locator('#referenzenTitle')).toBeFocused();

  await callout.getByRole('button', { name: 'Auswahl aufheben' }).click();
  await expect(callout).toBeHidden();
  await expect(bar).toHaveAttribute('aria-pressed', 'false');
  await expect(page.locator('#filterText')).toContainText('Alle Referenzen');
  expect(await shownProjectIds(page)).toHaveLength(await page.evaluate(() => projects.length));
});

test('Skill ohne Referenz zeigt Leerzustand', async ({ page }) => {
  await openPage(page);
  // Unabhängig von den echten Daten: Projektliste zur Laufzeit leeren
  await page.evaluate(() => { projects.length = 0; });
  await page.locator('#legend [data-category="reqeng"]').click();
  const bar = page.locator('#chart .sbar').first();
  await expect(bar.locator('.bar-count')).toHaveText('–');
  await bar.click();
  await expect(page.locator('#skillCallout')).toContainText('noch keine Referenz zu diesem Skill');
  await expect(page.locator('#refEmpty')).toBeVisible();
  await expect(page.locator('#refGrid .ref-card')).toHaveCount(0);
});

test('Stationsfilter: Randspalte, Kombination, Zurücksetzen, Badge', async ({ page }) => {
  await openPage(page);
  const project = await page.evaluate(() => projects[0]);
  const byStation = await page.evaluate((st) => projects.filter((p) => p.station === st).map((p) => p.id), project.station);
  const reset = page.locator('#resetFilters');
  await expect(reset).toBeHidden();

  await openGroup(page, 'groupStations');
  const station = page.locator(`#stationList [data-station="${project.station}"]`);
  await expect(station.locator('.station-count')).toHaveText(byStation.length === 1 ? '1 Referenz' : `${byStation.length} Referenzen`);
  await station.click();
  await expect(station).toHaveAttribute('aria-pressed', 'true');
  expect((await shownProjectIds(page)).sort()).toEqual([...byStation].sort());
  await expect(reset).toBeVisible();

  // Kombination mit Skill-Filter (über Skill-Tag der Karte)
  const skill = project.skills[0];
  await page.locator(`.ref-card[data-project="${project.id}"] .tag[data-skill="${skill}"]`).click();
  const both = await page.evaluate(([st, sk]) => projects.filter((p) => p.station === st && p.skills.includes(sk)).map((p) => p.id), [project.station, skill]);
  expect((await shownProjectIds(page)).sort()).toEqual([...both].sort());
  await expect(page.locator('#filterText')).toContainText(' + ');

  // Zurücksetzen hebt beide Filter auf, nicht die Legende
  await reset.click();
  await expect(station).toHaveAttribute('aria-pressed', 'false');
  await expect(page.locator('#skillCallout')).toBeHidden();
  await expect(reset).toBeHidden();
  expect(await shownProjectIds(page)).toHaveLength(await page.evaluate(() => projects.length));

  // Stations-Badge auf der Karte setzt denselben Filter (Toggle)
  const badge = page.locator(`.ref-card[data-project="${project.id}"] .badge`);
  await badge.click();
  await expect(station).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator(`.ref-card[data-project="${project.id}"] .badge`)).toHaveAttribute('aria-pressed', 'true');
  await page.locator(`.ref-card[data-project="${project.id}"] .badge`).click();
  await expect(station).toHaveAttribute('aria-pressed', 'false');
});

test('Skill-Tag in der Karte setzt den Skillfilter und wird hervorgehoben', async ({ page }) => {
  await openPage(page);
  const project = await page.evaluate(() => projects[0]);
  const skill = project.skills[project.skills.length - 1];
  const tag = () => page.locator(`.ref-card[data-project="${project.id}"] .tag[data-skill="${skill}"]`);
  await tag().click();
  await expect(tag()).toHaveAttribute('aria-pressed', 'true');
  await expect(tag()).toHaveCSS('color', 'rgb(255, 255, 255)');
  await expect(tag()).toBeFocused();
  await expect(page.locator('#skillCallout')).toContainText(await page.evaluate((s) => skillsData[s].name, skill));
  await tag().click();
  await expect(tag()).toHaveAttribute('aria-pressed', 'false');
  await expect(page.locator('#skillCallout')).toBeHidden();
});

test('Details einer Referenz auf- und zuklappen', async ({ page }) => {
  await openPage(page);
  const card = page.locator('#refGrid .ref-card').first();
  const toggle = card.locator('.details-toggle');
  const details = card.locator('.card-details');
  await expect(toggle).toHaveAttribute('aria-expanded', 'false');
  await expect(details).toBeHidden();
  await toggle.click();
  await expect(card.locator('.details-toggle')).toHaveAttribute('aria-expanded', 'true');
  await expect(card.locator('.details-toggle')).toHaveText('Weniger anzeigen');
  await expect(details).toBeVisible();
  await expect(details.locator('dt').first()).toBeVisible();
  await card.locator('.details-toggle').click();
  await expect(card.locator('.details-toggle')).toHaveAttribute('aria-expanded', 'false');
  await expect(details).toBeHidden();
});

test('Aufklapplisten und Akkordeons in der Randspalte', async ({ page, isMobile }) => {
  await openPage(page);
  const groups = ['groupStations', 'groupEducation', 'groupCertificates'];
  for (const id of groups) {
    const open = await page.locator(`#${id}`).evaluate((el) => /** @type {HTMLDetailsElement} */ (el).open);
    expect(open).toBe(!isMobile);
  }

  await openGroup(page, 'groupStations');
  const students = page.locator('#toggleStudents');
  await expect(page.locator('#studentList')).toBeHidden();
  await students.click();
  await expect(students).toHaveAttribute('aria-expanded', 'true');
  await expect(page.locator('#studentList li')).toHaveCount(3);
  await expect(page.locator('#studentList')).toContainText('Dataport AöR · 2022 – 2023');
  await students.click();
  await expect(students).toHaveAttribute('aria-expanded', 'false');
  await expect(page.locator('#studentList')).toBeHidden();

  await openGroup(page, 'groupEducation');
  await expect(page.locator('#educationList')).toContainText('CAU Kiel · 2020 – 2023 · Nebenfach Informatik');

  await openGroup(page, 'groupCertificates');
  await expect(page.locator('#certificateList li')).toHaveCount(4);
  const trainings = page.locator('#toggleTrainings');
  await expect(trainings).toHaveText('Weitere Schulungen (7) anzeigen');
  await trainings.click();
  await expect(trainings).toHaveAttribute('aria-expanded', 'true');
  await expect(trainings).toHaveText('Schulungen ausblenden');
  await expect(page.locator('#trainingList li')).toHaveCount(7);
  await expect(page.locator('#trainingList')).toBeVisible();

  if (isMobile) {
    // Akkordeon wieder zuklappen
    await page.locator('#groupStations summary').click();
    await expect(page.locator('#stationList')).toBeHidden();
  }
});

test('Layout: Randspalte sticky (Desktop) bzw. oben (Mobil), kein horizontales Scrollen', async ({ page, isMobile }) => {
  await openPage(page);
  const sidebar = page.locator('.sidebar');
  const main = page.locator('main');

  if (isMobile) {
    const sideBox = await sidebar.boundingBox();
    const mainBox = await main.boundingBox();
    expect(sideBox && mainBox && sideBox.y + sideBox.height <= mainBox.y + 1).toBe(true);
  } else {
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(200);
    await expect(sidebar).toBeInViewport();
    expect(await sidebar.evaluate((el) => el.getBoundingClientRect().top)).toBeCloseTo(0, 0);
  }

  const overflow = () => page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(await overflow()).toBeLessThanOrEqual(0);
  // auch mit vielen Skill-Balken (Diagramm scrollt intern)
  await page.locator('#legend [data-category="data"]').click();
  await page.locator('#legend [data-category="tech"]').click();
  await expect(page.locator('#chart .sbar').first()).toBeVisible();
  expect(await overflow()).toBeLessThanOrEqual(0);
});

test('Entfernte Elemente sind weg', async ({ page }) => {
  await openPage(page);
  await expect(page.locator('a[href*="instagram"]')).toHaveCount(0);
  await expect(page.locator('#skillModal')).toHaveCount(0);
  await expect(page.locator('nav, .navbar')).toHaveCount(0);
  expect(await page.evaluate(() => typeof window.referenceIdMap)).toBe('undefined');
  // keine Emojis im sichtbaren Text
  const text = await page.locator('body').innerText();
  expect(text).not.toMatch(/\p{Emoji_Presentation}/u);
});

test('Platzhalter-Wächter: data/projects.js enthält keine [Platzhalter]', async ({ page }) => {
  // Schlägt bewusst fehl, solange nur das Beispielprojekt existiert – erst mit echten
  // Projektinhalten wird der Test grün und der Branch darf nach main.
  await openPage(page);
  const placeholders = await page.evaluate(() => {
    const found = [];
    const walk = (value, where) => {
      if (typeof value === 'string') {
        if (/\[[^\]]+\]/.test(value)) found.push(`${where}: ${value}`);
      } else if (value && typeof value === 'object') {
        for (const [k, v] of Object.entries(value)) walk(v, `${where}.${k}`);
      }
    };
    walk(projects, 'projects');
    return found;
  });
  expect(placeholders).toEqual([]);
});
