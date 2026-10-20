# Responses 5.5.0 im Studio-Abhängigkeitsupdate

Root-Manifest/-Lock und API-Runtime-Paar pinnen die veröffentlichte Version 5.5.0. Coding-Scheme bleibt auf 3.5.0 und Coding Components auf 4.0.0. Der gemeinsame Codebook-Umstieg auf 4.1.0 wird separat in PR #1728 behandelt.

Das npm-Archiv stimmt bytegenau mit dem freigegebenen [Release](https://github.com/iqb-berlin/responses/releases/tag/5.5.0) überein: SHA-256 `736cb5ad542e64ec54b06ae7bd3cb46f43922183f11126bd29bed3961d716925`. Beide Lockfiles pinnen dessen SHA-512-Integrität. Responses verwendet verschachtelt VariableInfo 2.1; direkte VariableInfo-1.x-Abhängigkeiten bleiben erhalten.

Der Branch übernimmt den bereits auf `develop` gemergten State-DTO-Fix aus #1877. Die zusätzliche alte DTO-Kopie entfällt. Im Workspace-Download-Test ersetzt der ESM-Mock nur `CodingScheme` und erhält alle übrigen realen Exporte; der bisherige komplette Mock verhinderte den ESM-Import von Responses 5.5.0.

## Erneut lokal geprüft

- API: `npx nx test api --runInBand --skipNxCache --testPathPatterns='(download-docx|download-workspaces|codebook-image-security|coding-report.dto|unit-download).*spec.ts$'`, mit `NODE_OPTIONS=--experimental-vm-modules`: 128 Tests / 5 Suites bestanden.
- Frontend: `npx nx test frontend --runInBand --skipNxCache --testPathPatterns='(export-coding-book|coding-report.component|unit-print-coding|coding-components-translations).*spec.ts$'`: 35 Tests / 4 Suites bestanden.
- API- und Frontend-Produktionsbuild mit `--skipNxCache`: bestanden.
- ESLint für den geänderten Workspace-Download-Test: bestanden.
- `npm ci --dry-run --ignore-scripts --no-audit --no-fund`: Root und isoliertes API-Runtime-Paar bestanden.
- Docker-Drift-Prüfung gegen das neu erzeugte API-Manifest: alle 37 erzeugten Abhängigkeiten stimmen mit dem eingecheckten Paar überein; `pg` ist zusätzlich gepinnt. Keine Angular-Abhängigkeit im Runtime-Manifest.

Frontend und API wurden nacheinander geprüft. Diese Prüfungen sind keine vollständige Host-Suite, kein Docker-Imagebuild und keine neue HTTP-/Browser-Abnahme. Remote-CI ist separat am aktuellen PR-Head zu prüfen.
