// @ts-check
const fs = require('fs');
const { defineConfig, devices } = require('@playwright/test');

// In Claude-Code-Cloud-Sitzungen ist Chromium vorinstalliert; lokal/CI wird der
// von Playwright installierte Browser genutzt.
const preinstalledChromium = process.env.PW_CHROMIUM_PATH || '/opt/pw-browsers/chromium';
const launchOptions = fs.existsSync(preinstalledChromium) ? { executablePath: preinstalledChromium } : {};

module.exports = defineConfig({
  testDir: 'tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  reporter: process.env.CI ? 'github' : 'list',
  use: { launchOptions },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'], launchOptions } },
    { name: 'mobile', use: { ...devices['Pixel 7'], launchOptions } },
  ],
});
