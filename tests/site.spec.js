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

test('Seite lädt ohne JS-Fehler und ohne fehlende Dateien', async ({ page }) => {
  const problems = await openPage(page);
  await expect(page.locator('.hero-name')).toBeVisible();
  await expect(page.locator('.hero-portrait')).toHaveJSProperty('complete', true);
  expect(await page.locator('.hero-portrait').evaluate((img) => img.naturalWidth)).toBeGreaterThan(0);
  expect(problems).toEqual([]);
});

test('Lebenslauf-PDF ist verlinkt und vorhanden', async ({ page }) => {
  await openPage(page);
  const href = await page.locator('a.cv-download').getAttribute('href');
  expect(href).toBeTruthy();
  expect(fs.existsSync(path.join(__dirname, '..', href))).toBe(true);
});

test('Skill-Daten sind konsistent mit der Seite', async ({ page }) => {
  await openPage(page);
  const errors = await page.evaluate(() => {
    const errs = [];
    const categoryNames = Object.values(categoryMap);
    const knownTypes = ['job', 'cert', 'training', 'edu', 'hobby'];
    for (const [key, skill] of Object.entries(skillsData)) {
      if (!categoryNames.includes(skill.category)) errs.push(`${key}: unbekannte Kategorie "${skill.category}"`);
      if (!(skill.score > 0)) errs.push(`${key}: score muss > 0 sein`);
      for (const ref of skill.references) {
        if (!knownTypes.includes(ref.type)) errs.push(`${key}: unbekannter Referenz-Typ "${ref.type}"`);
        const id = referenceIdMap[ref.title];
        if (!id) errs.push(`${key}: Referenz "${ref.title}" fehlt in referenceIdMap`);
        else if (!document.getElementById(id)) errs.push(`${key}: id="${id}" existiert nicht in index.html`);
      }
    }
    document.querySelectorAll('[data-category]').forEach((el) => {
      const cat = el.getAttribute('data-category');
      if (cat !== 'all' && !(cat in categoryMap)) errs.push(`data-category="${cat}" fehlt in categoryMap`);
    });
    return errs;
  });
  expect(errors).toEqual([]);
});

test('Kategoriebalken werden aus den Scores berechnet', async ({ page }) => {
  await openPage(page);
  await page.locator('#categoryBars').scrollIntoViewIfNeeded();
  const bars = page.locator('#categoryBars .vertical-bar-fill');
  await expect(bars).toHaveCount(4);
  await expect(bars.first()).not.toHaveAttribute('style', /height: 0/);
  const expected = await page.evaluate(() => {
    const totals = Object.fromEntries(Object.entries(categoryMap).map(([key, name]) => [
      key,
      Object.values(skillsData).filter((s) => s.category === name).reduce((sum, s) => sum + s.score, 0),
    ]));
    const max = Math.max(...Object.values(totals));
    return Object.fromEntries(Object.entries(totals).map(([k, v]) => [k, `${(v / max) * 100}%`]));
  });
  for (const [key, height] of Object.entries(expected)) {
    await expect(page.locator(`#categoryBars [data-category="${key}"]`)).toHaveAttribute('data-height', height);
  }
});

test('Filter, Skill-Modal und Sprung zur Referenz funktionieren', async ({ page }) => {
  await openPage(page);
  await page.locator('.legend-item[data-category="reqeng"]').click();
  await expect(page.locator('#categoryBars')).toBeHidden();
  const skillBars = page.locator('#skillBars .skill-bar-item');
  await expect(skillBars.first()).toBeVisible();

  await skillBars.first().click();
  const modal = page.locator('#skillModal');
  await expect(modal).toHaveClass(/active/);
  await expect(page.locator('#modalSkillName')).not.toBeEmpty();

  const firstRef = page.locator('#modalReferences .reference-item').first();
  await firstRef.click();
  await expect(modal).not.toHaveClass(/active/);
  const targetId = await page.evaluate(() => {
    const top = Object.values(skillsData)
      .filter((s) => s.category === categoryMap.reqeng)
      .sort((a, b) => b.score - a.score)[0];
    return referenceIdMap[top.references[0].title];
  });
  await expect(page.locator(`#${targetId}`)).toBeInViewport();

  // Zurück zur Gesamtansicht
  await page.locator('.legend-item[data-category="all"]').click();
  await expect(page.locator('#categoryBars')).toBeVisible();
});

test('Kein horizontales Scrollen der Seite', async ({ page }) => {
  await openPage(page);
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(0);
});
