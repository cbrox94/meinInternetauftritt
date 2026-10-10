#!/bin/bash
# Installiert in Claude-Code-Cloud-Sitzungen die Abhängigkeiten, damit
# `npm run check` sofort läuft. Lokal passiert nichts.
set -euo pipefail

if [ "${CLAUDE_CODE_REMOTE:-}" != "true" ]; then
  exit 0
fi

cd "$CLAUDE_PROJECT_DIR"
npm install --no-audit --no-fund
