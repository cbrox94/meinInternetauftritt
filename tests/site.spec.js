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

/** Mobil sind die Randspalten-Abschnitte Akkordeons – bei Bedarf aufklappen. */
async function openSideSection(page, id) {
  const section = page.locator(`#${id}`);
  if (!(await section.evaluate((el) => /** @type {HTMLDetailsElement} */ (el).open))) {
    await section.locator('summary').click();
  }
  await expect(section).toHaveJSProperty('open', true);
}

/** IDs der angezeigten Referenzkarten. */
async function shownProjects(page) {
  return page.locator('#projectGrid .project').evaluateAll((cards) => cards.map((c) => c.getAttribute('data-project')));
}

test('Seite lädt ohne JS-Fehler und ohne fehlende Dateien', async ({ page }) => {
  const problems = await openPage(page);
  await expect(page.locator('#profileName')).toHaveText('Christoph Bröxkes');
  const photo = page.locator('#profilePhoto');
  await expect(photo).toHaveJSProperty('complete', true);
  expect(await photo.evaluate((img) => /** @type {HTMLImageElement} */ (img).naturalWidth)).toBeGreaterThan(0);
  expect(problems).toEqual([]);
});

test('Lebenslauf-PDF ist verlinkt und vorhanden', async ({ page }) => {
  await openPage(page);
  const cv = page.locator('#profileActions a.btn-cv');
  await expect(cv).toHaveText('Lebenslauf (PDF)');
  await expect(cv).toHaveAttribute('download', 'CV_Christoph_Broexkes.pdf');
  const href = await cv.getAttribute('href');
  expect(href).toBeTruthy();
  expect(fs.existsSync(path.join(__dirname, '..', /** @type {string} */ (href)))).toBe(true);
});

test('Daten sind konsistent', async ({ page }) => {
  await openPage(page);
  const errors = await page.evaluate(() => {
    const errs = [];
    const ym = /^\d{4}-(0[1-9]|1[0-2])$/;
    const checkRange = (label, from, to) => {
      if (!ym.test(from)) errs.push(`${label}: from "${from}" nicht im Format YYYY-MM`);
      if (to !== null && !ym.test(to)) errs.push(`${label}: to "${to}" nicht im Format YYYY-MM`);
      if (to && from > to) errs.push(`${label}: from liegt nach to`);
    };
    const stationIds = profile.stations.map((s) => s.id);
    for (const [key, skill] of Object.entries(skillsData)) {
      if (!(skill.category in categories)) errs.push(`Skill ${key}: unbekannte Kategorie "${skill.category}"`);
      if (!(skill.score > 0)) errs.push(`Skill ${key}: score muss > 0 sein`);
    }
    const ids = new Set();
    for (const p of projects) {
      if (ids.has(p.id)) errs.push(`Projekt-ID doppelt: ${p.id}`);
      ids.add(p.id);
      if (!stationIds.includes(p.station)) errs.push(`Projekt ${p.id}: unbekannte Station "${p.station}"`);
      for (const s of p.skills) if (!(s in skillsData)) errs.push(`Projekt ${p.id}: unbekannter Skill "${s}"`);
      checkRange(`Projekt ${p.id}`, p.from, p.to);
    }
    profile.stations.forEach((s) => checkRange(`Station ${s.id}`, s.from, s.to));
    profile.studentJobs.forEach((s) => checkRange(`Studentisch ${s.org}`, s.from, s.to));
    profile.education.forEach((e) => checkRange(`Ausbildung ${e.degree}`, e.from, e.to));
    [...profile.certificates, ...profile.trainings].forEach((c) => {
      if (!ym.test(c.date)) errs.push(`${c.name}: date "${c.date}" nicht im Format YYYY-MM`);
    });
    return errs;
  });
  expect(errors).toEqual([]);
});

test('Kategoriebalken werden aus den Scores berechnet', async ({ page }) => {
  await openPage(page);
  await page.locator('#chart').scrollIntoViewIfNeeded();
  const bars = page.locator('#chart .bar-category');
  await expect(bars).toHaveCount(4);
  const expected = await page.evaluate(() => {
    const totals = Object.fromEntries(Object.keys(categories).map((key) => [
      key,
      Object.values(skillsData).filter((s) => s.category === key).reduce((sum, s) => sum + s.score, 0),
    ]));
    const max = Math.max(...Object.values(totals));
    return Object.fromEntries(Object.entries(totals).map(([k, v]) => [k, `${Math.round((v / max) * 220)}px`]));
  });
  for (const [key, height] of Object.entries(expected)) {
    await expect(page.locator(`#chart .bar-category[data-category="${key}"] .bar-fill`)).toHaveCSS('height', height);
  }
});

test('Legende: Mehrfachauswahl, Sortierung und Rückkehr zu „Alle“', async ({ page }) => {
  await openPage(page);
  const legend = (key) => page.locator(`#legend [data-category="${key}"]`);

  await legend('reqeng').click();
  await legend('pm').click();
  await expect(legend('all')).toHaveAttribute('aria-pressed', 'false');
  await expect(legend('reqeng')).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('#chart .bar-category')).toHaveCount(0);

  const shown = await page.locator('#chart .bar-skill').evaluateAll((els) => els.map((e) => e.getAttribute('data-skill')));
  const expected = await page.evaluate(() => Object.keys(skillsData)
    .filter((id) => ['reqeng', 'pm'].includes(skillsData[id].category))
    .sort((a, b) => skillsData[b].score - skillsData[a].score));
  expect(shown).toEqual(expected);

  // Alle 4 gewählt → zurück zu Ebene 1
  await legend('data').click();
  await legend('tech').click();
  await expect(page.locator('#chart .bar-category')).toHaveCount(4);
  await expect(legend('all')).toHaveAttribute('aria-pressed', 'true');

  // Letzte Kategorie abwählen → „Alle“
  await legend('data').click();
  await legend('data').click();
  await expect(page.locator('#chart .bar-category')).toHaveCount(4);

  // „Alle“ setzt zurück
  await legend('tech').click();
  await legend('all').click();
  await expect(page.locator('#chart .bar-category')).toHaveCount(4);

  // Klick auf Kategoriebalken wählt die Kategorie
  await page.locator('#chart .bar-category[data-category="data"]').click();
  await expect(legend('data')).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('#chart .bar-skill').first()).toBeVisible();
});

test('Skill-Filter: Hinweisbox, Referenzen und Sprung', async ({ page }) => {
  await openPage(page);
  const skill = await page.evaluate(() => projects[0].skills[0]);
  const category = await page.evaluate((id) => skillsData[id].category, skill);
  await page.locator(`#legend [data-category="${category}"]`).click();

  const bar = page.locator(`#chart .bar-skill[data-skill="${skill}"]`);
  await bar.click();
  await expect(bar).toHaveAttribute('aria-pressed', 'true');

  const expected = await page.evaluate((id) => projects
    .filter((p) => p.skills.includes(id))
    .sort((a, b) => b.from.localeCompare(a.from))
    .map((p) => p.id), skill);
  const name = await page.evaluate((id) => skillsData[id].name, skill);
  const countText = expected.length === 1 ? '1 Referenz passend' : `${expected.length} Referenzen passend`;

  const callout = page.locator('#skillCallout');
  await expect(callout).toBeVisible();
  await expect(callout).toContainText(`${name} · ${countText}`);
  expect(await shownProjects(page)).toEqual(expected);
  await expect(page.locator('#filterText')).toContainText(`Gefiltert nach ${name}`);

  await callout.getByRole('link', { name: 'Zu den Referenzen' }).click();
  await expect(page.locator('#referenzen')).toBeInViewport();
  await expect(page.locator('#referenzenTitle')).toBeFocused();

  await callout.getByRole('button', { name: 'Auswahl aufheben' }).click();
  await expect(callout).toBeHidden();
  await expect(page.locator('#filterText')).toContainText('Alle Referenzen');
  expect((await shownProjects(page)).length).toBe(await page.evaluate(() => projects.length));
});

test('Stationsfilter, Kombination und „Filter zurücksetzen“', async ({ page }) => {
  await openPage(page);
  const { station, skill } = await page.evaluate(() => ({ station: projects[0].station, skill: projects[0].skills[0] }));
  // erwartete Karten für die Station, optional kombiniert mit einem Skill
  const expectFor = (withSkill) => page.evaluate(([st, sk]) => projects
    .filter((p) => p.station === st && (!sk || p.skills.includes(sk)))
    .sort((a, b) => b.from.localeCompare(a.from))
    .map((p) => p.id), [station, withSkill]);

  await openSideSection(page, 'sideStations');
  const stationButton = page.locator(`#stationList [data-station="${station}"]`);
  await stationButton.click();
  await expect(stationButton).toHaveAttribute('aria-pressed', 'true');
  expect(await shownProjects(page)).toEqual(await expectFor(null));

  // Kombination mit Skill-Tag
  await page.locator(`#projectGrid .tag[data-skill="${skill}"]`).first().click();
  expect(await shownProjects(page)).toEqual(await expectFor(skill));
  await expect(page.locator('#filterText')).toContainText(' + ');

  const reset = page.locator('#resetFilter');
  await expect(reset).toBeVisible();
  await reset.click();
  await expect(reset).toBeHidden();
  await expect(stationButton).toHaveAttribute('aria-pressed', 'false');
  await expect(page.locator('#filterText')).toContainText('Alle Referenzen');

  // Stations-Badge auf der Karte setzt denselben Filter
  await page.locator(`#projectGrid .station-badge[data-station="${station}"]`).first().click();
  await expect(stationButton).toHaveAttribute('aria-pressed', 'true');
  expect(await shownProjects(page)).toEqual(await expectFor(null));
});

test('Skill-Tag in einer Karte setzt den Filter und wird hervorgehoben', async ({ page }) => {
  await openPage(page);
  const skill = await page.evaluate(() => projects[0].skills[0]);
  await page.locator(`#projectGrid .tag[data-skill="${skill}"]`).first().click();
  const tag = page.locator(`#projectGrid .tag[data-skill="${skill}"]`).first();
  await expect(tag).toHaveAttribute('aria-pressed', 'true');
  await expect(tag).toHaveClass(/is-active/);
  await expect(page.locator('#skillCallout')).toBeVisible();
});

test('Tastatur: Skill per Enter wählen, Fokus bleibt erhalten', async ({ page }) => {
  await openPage(page);
  await page.locator('#legend [data-category="reqeng"]').click();
  const bar = page.locator('#chart .bar-skill').first();
  await bar.focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('#chart .bar-skill').first()).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('#chart .bar-skill').first()).toBeFocused();
});

test('Details einer Referenz auf- und zuklappen', async ({ page }) => {
  await openPage(page);
  const toggle = page.locator('#projectGrid .details-toggle').first();
  const details = page.locator(`#${await toggle.getAttribute('aria-controls')}`);
  await expect(toggle).toHaveAttribute('aria-expanded', 'false');
  await expect(details).toBeHidden();
  await toggle.click();
  await expect(toggle).toHaveAttribute('aria-expanded', 'true');
  await expect(details).toBeVisible();
  await expect(toggle).toHaveText('Weniger anzeigen');
  await toggle.click();
  await expect(toggle).toHaveAttribute('aria-expanded', 'false');
  await expect(details).toBeHidden();
});

test('Aufklapplisten in der Randspalte funktionieren', async ({ page }) => {
  await openPage(page);
  const mobile = await page.evaluate(() => window.innerWidth <= 1024);
  for (const id of ['sideStations', 'sideEducation', 'sideCertificates']) {
    await expect(page.locator(`#${id}`)).toHaveJSProperty('open', !mobile);
  }

  await openSideSection(page, 'sideStations');
  const students = page.locator('#studentToggle');
  await expect(page.locator('#studentList')).toBeHidden();
  await students.click();
  await expect(students).toHaveAttribute('aria-expanded', 'true');
  await expect(page.locator('#studentList li')).toHaveCount(3);
  await expect(page.locator('#studentList')).toBeVisible();

  await openSideSection(page, 'sideEducation');
  await expect(page.locator('#educationList li')).toHaveCount(2);

  await openSideSection(page, 'sideCertificates');
  const trainings = page.locator('#trainingToggle');
  await expect(trainings).toHaveText('Weitere Schulungen (7) anzeigen');
  await trainings.click();
  await expect(trainings).toHaveText('Schulungen ausblenden');
  await expect(page.locator('#trainingList li')).toHaveCount(7);
  await expect(page.locator('#trainingList')).toBeVisible();
  await trainings.click();
  await expect(page.locator('#trainingList')).toBeHidden();
});

test('Layout: Randspalte und kein horizontales Scrollen', async ({ page }) => {
  await openPage(page);
  const mobile = await page.evaluate(() => window.innerWidth <= 1024);
  const sidebar = page.locator('#sidebar');
  if (mobile) {
    const [side, main] = await Promise.all([sidebar.boundingBox(), page.locator('#main').boundingBox()]);
    expect(side && main && side.y + side.height <= main.y + 1).toBe(true);
  } else {
    await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(0);
    const box = await sidebar.boundingBox();
    expect(Math.abs(box?.y ?? 99)).toBeLessThan(1);
    await expect(sidebar).toBeInViewport();
  }

  // Ebene 2 mit vielen Skills darf die Seite nicht verbreitern
  await page.locator('#legend [data-category="data"]').click();
  await page.locator('#legend [data-category="reqeng"]').click();
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(0);
});

test('Entfernte Elemente sind weg', async ({ page }) => {
  await openPage(page);
  await expect(page.locator('a[href*="instagram"]')).toHaveCount(0);
  await expect(page.locator('#skillModal')).toHaveCount(0);
  await expect(page.locator('nav, .navbar')).toHaveCount(0);
  expect(await page.evaluate(() => typeof referenceIdMap)).toBe('undefined');
});

// Schlägt bewusst fehl, solange data/projects.js Platzhalter enthält – dann nicht auf main mergen.
test('Platzhalter-Wächter: keine [Platzhalter] in den Referenzen', async ({ page }) => {
  await openPage(page);
  const found = await page.evaluate(() => {
    const hits = [];
    const walk = (value, where) => {
      if (typeof value === 'string') {
        if (/\[[^\]]+\]/.test(value)) hits.push(`${where}: ${value}`);
      } else if (value && typeof value === 'object') {
        Object.entries(value).forEach(([k, v]) => walk(v, `${where}.${k}`));
      }
    };
    walk(projects, 'projects');
    return hits;
  });
  expect(found).toEqual([]);
});
