# Integration des gemeinsamen Codebooks

## Aktueller Responses-Stand

Die [Prüfung vom 15.10.2026](codebook-responses-2026-10-15.md) verwendet überall
`@iqb/responses` 5.3.1, die beim Abgleich aktuelle Patchversion der 5.3-Reihe.
Die Bibliothek bezieht Responses als Peer (`^5.3.0`); Schemer, Validierung und
Generator verwenden dieselbe Installation wie der Host. Es gibt keine private
5.2.2-Installation mehr. 1.285 Generator-Tests und 4.694 installierte Exportpaare
bestehen einschließlich der unveränderten Studio-Referenzen. Aktueller Tarball-
SHA256: `9a0e75158dcc70e821c6a481d431ec6a0429e248afb85bd27991b1ae1af22d7a`.
Frühere Berichte unten beziehen sich auf ihre damaligen Paketstände.

## Vorheriger develop-Abgleich

Der [Abgleich vom 15.10.2026](codebook-develop-sync-2026-10-15.md) übernimmt Studios neue Store-Signale und Anwendungsversion von `@iqb/responses` 5.3.0. Zu diesem früheren Prüfzeitpunkt blieb der gemeinsame Generator intern bei 5.2.2; der aktuelle Responses-Abgleich oben ersetzt diesen Stand. Nach dem Merge bestehen erneut 4.694 Exportvergleiche sowie Frontend-/API-Tests und beide Builds.

## Vorherige Inlinebild-Korrektur

Die [Prüfung vom 15.10.2026](codebook-inline-images-2026-10-15.md) behebt Textverlust bei defekten Inlinebildern. 1.285 Generator-Tests und 4.694 installierte Exportpaare bestehen. Dabei verwendeten beide Anwendungen den Tarball mit SHA256 `1340db41e6493cca3d4395426c14f156319c3bbbf0b81d01f84c233a56a5091a`. Eine neue Word-Abnahme wurde für diesen Paketstand nicht ausgeführt.

## Format- und Aspect-Abnahme vom 13.10.2026

Die [Browser- und Word-Abnahme vom 13.10.2026](codebook-aspect-acceptance-2026-10-13.md) ergänzt die frühere Leerzeichen-Abnahme um bestätigte Formatierungsfixes und den bidirektionalen Formel-Austausch. Damals geprüftes Paket-SHA256: `0e355c3896799ae765cb6e90b00147da0359c56f5fdc90d36b7caf40fbe59ab8`. 1.245 Generator-Tests, 4.654 installierte Exportpaare und 262 tatsächliche Microsoft-Word-Web-Seiten sind geprüft. Die explizite 18pt-Schriftgröße des alten `Farbe`-Referenzfalls wird bewusst korrigiert; alle übrigen alten Dokumentbestandteile bleiben streng verglichen. Angaben zu früheren Paketständen weiter unten sind historische Nachweise.

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
