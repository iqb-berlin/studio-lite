# Inlinebild-Korrektur und Installationsvergleich vom 15.10.2026

## Korrektur

Ein defektes Inlinebild konnte den gesamten umgebenden Instruktionsabsatz durch
„HTML konnte nicht verarbeitet werden.“ ersetzen. Der Fehler wird jetzt direkt
am Bild behandelt: Der Hinweis steht an seiner Position, Text und Formatierung
vor und nach dem Bild sowie folgende Absätze bleiben erhalten. Spätere gültige
Bilder und Formeln werden weiterhin genau einmal ausgegeben. Gültige Dokumente,
Filter, JSON-Inhalte, UI und Jobverarbeitung werden nicht geändert.

## Regressionstests

40 neue Tests prüfen fünf erfundene Fälle (defekte Bildbytes, leeres src,
fehlendes src, nicht unterstützte Bildbytes und mehrere defekte Bilder vor
einem gültigen Bild und einer Formel). Alle Fälle werden als allgemeine und
Code-Instruktion, mit und ohne Score-Spalte, über ESM und CommonJS exportiert.
Geprüft werden vollständiger Absatztext, Quellreihenfolge, Fettmarkierung, Farbe,
Schriftgröße, Folgeabsatz, Bildmedien und native Formeln. Alle 40 Tests schlugen
vor der Korrektur wegen des fehlenden Absatzes fehl und bestehen danach.

Studio und Kodierbox ergänzen außerdem jeweils zwei Tests gegen das tatsächlich
installierte Paket: allgemeine und Code-Instruktionen in beiden Score-Layouts.

- Bibliothek frisch gebaut; 1.285 Generator-Tests ohne übersprungene Tests bestanden.
- 526 Angular-Tests bestanden; Generator-Lint ohne Fehler, sechs bestehende Warnungen.
- Studio: 15 API-Tests und 66 betroffene Frontend-Tests bestanden; API-Lint ohne Fehler.
- Kodierbox: gesamte Backend-Suite mit 2.635 bestandenen und 17 übersprungenen Tests;
  60 betroffene Frontend-Tests bestanden; Backend-Lint ohne Fehler.
- Bibliotheksbuild sowie beide Frontend- und beide Backend/API-Builds bestanden;
  Frontend und Backend wurden getrennt und nacheinander geprüft.
- Die 32 ursprünglichen Studio-Rohschema-Referenzen und 20 Leerzeichenreferenzen
  wurden nicht neu erzeugt und bestehen weiterhin. Die bereits dokumentierte,
  gezielt normalisierte 18pt-Korrektur bleibt unverändert.

## Gleiches installiertes Artefakt

Beide Anwendungen verwenden denselben neuen 4.1.0-Tarball. SHA256:
`1340db41e6493cca3d4395426c14f156319c3bbbf0b81d01f84c233a56a5091a`.
Root-Locks und Studios API-Runtime-Lock enthalten dieselbe neue Paketprüfsumme;
sonstige Abhängigkeitsversionen bleiben unverändert.

Der Vergleich prüft vor dem Export die Tarball-Bytes gegen die Lock-Prüfsumme
und alle 20 ausgelieferten Paketdateien gegen den frischen Build. Das verhindert,
dass eine alte npm-Installation trotz aktualisiertem Lock unbemerkt verglichen wird.

4.694 Exportpaare bestehen: die bisherigen 4.654 plus 40 zusätzliche Bildfehler-
Paare (fünf Fälle, zwei Instruktionsorte, zwei Score-Layouts, JSON und DOCX).
JSON wird strukturell, DOCX über alle normalisierten Dokumentbestandteile inklusive
Bildern, Beziehungen, Styles und Fußzeile verglichen. Die neuen Fälle prüfen
zusätzlich erwartete Inhalte, Code 0 und optionale Scores ausdrücklich.

Der maschinenlesbare Nachweis liegt in der Bibliothek unter
`docs/codebook-inline-image-installation-comparison-2026-10-15.json`.

## Nachweisgrenzen

Die echten Anwendungsadapter laufen in diesem Vergleich mit Datenhaltung im Speicher.
HTTP, Browser, PostgreSQL und Redis wurden für diesen Fix nicht erneut geprüft.
Die frühere Word-Web-Abnahme gilt für den damaligen Paketstand; für den neuen
Tarball wurde kein neuer Microsoft-Renderinglauf ausgeführt. Desktop-Word unter
Windows bleibt offen. Es wurde kein Paket veröffentlicht, gemergt oder ausgerollt.

## Wiederholung

In coding-components: `npm run build_cc`, danach `npm run test:codebook` und
`npm run test:cc`. Den gepackten Tarball in beide Anwendungen installieren und
`node scripts/compare-codebook-installations.mjs STUDIO_ROOT BOX_ROOT OUTPUT_DIR`
ausführen. Frontend- und Backend-Prüfungen getrennt und nacheinander ausführen.
