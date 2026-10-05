# Integration des gemeinsamen Codebooks

Studio bleibt Bedien- und Ausgabereferenz. Die gemeinsame UI und der Generator
stammen aus `@iqb/ngx-coding-components` 4.1.0. Der Studio-Dialog beschafft nur noch
Aufgaben und Missingprofile, übergibt Vorauswahl und Speichersperre und verarbeitet
den Exportwunsch über den bisherigen direkten API-Aufruf. Keine Job-Endpunkte,
Statusabfragen oder Queue-Abhängigkeiten wurden ergänzt.
Der Schulungsbedarf wird in beiden Anwendungen im gemeinsamen Formular gewählt
und vom gemeinsamen Generator anhand von CODER_TRAINING_REQUIRED gefiltert.
Die Gruppenspalte bleibt ausschließlich im Studio sichtbar.

Die API normalisiert Itembeziehungen auf die Variablenaliase und verwendet den
Generator der Bibliothek. Andere Berichte der DownloadWorkspaces-Klasse bleiben.
Die fachlichen Korrekturen und Referenztests stehen in
`coding-components/docs/shared-codebook.md`.

## Release-Kandidat und Runtime-Lock

Beide Anwendungen testen dieselbe Datei
`vendor/iqb-ngx-coding-components-4.1.0.tgz`. Sie ist lokal integriert und noch nicht
als npm-Version veröffentlicht. Der API-Runtime-Lock wird mit
`node scripts/update-api-runtime-deps.mjs` erzeugt. Das Skript berücksichtigt die
lokale Tarball-Abhängigkeit; Docker kopiert das Artefakt vor `npm ci`. Die bestehende
Drift-Prüfung akzeptiert ausschließlich für diese Bibliothek die exakt zur
Nx-Versionsnummer passende Tarball-Angabe; alle anderen Versionsprüfungen bleiben.

Nach gemeinsamer Abnahme: Bibliothek veröffentlichen, Root-Abhängigkeit auf 4.1.0
umstellen, Root-Lock und API-Runtime-Lock aktualisieren. Tarball und dessen COPY im
API-Dockerfile können danach entfallen. Die begrenzte lokale Versionsprüfung kann
wieder auf den reinen Versionsvergleich zurückgestellt werden. Anschließend
Runtime-Installation und beide Anwendungsabläufe erneut verifizieren.

Rollback: vorherige Anwendungsversion, keine Datenmigration.
