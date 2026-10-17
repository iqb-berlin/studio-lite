# Codebook-Integration vom 17.10.2026

## Gemeinsames Paket

Studio und Kodierbox installieren denselben Entwicklungsbuild:

- Datei: `vendor/iqb-ngx-coding-components-4.1.0-dev.ff15d6d.tgz`
- Quellcommit: `ff15d6d882417db26bc81fc88a09074eab74d57d` aus coding-components PR #251
- SHA-256: `e67c04e07762350cb4ee3b1a70a36bcde0f2ba1c24df1f5a40000346d34fd112`
- Integrität: `sha512-RjXrwSua+T89/XvhyqjmeOYnc/wUXpFMVr5aYGWeluDnHSnP8pTIJDme+mqDFgAJ1MQAIUbuQu7+rlPGhjkrrQ==`

Der Build enthält die Checkbox-Korrektur, die DOCX-Korrektur für explizite
Null-Einzüge sowie die gemeinsamen deutschen Codebook-Texte und Übersetzungshilfen.
Die Quelle wurde mit `npm run build_cc` gebaut. Nur das erzeugte Paketmanifest
bekam die Entwicklungsversionsnummer und `gitHead`, anschließend wurde genau
einmal `npm pack` ausgeführt. Beide Hosts enthalten denselben Tarball.
Versionsnummern im Bibliotheksquellcode und vorhandene Releases bleiben erhalten.
Es wurde kein neuer Alpha-Kandidat, Git-Tag oder Registry-Release erstellt.

Nach `git pull` installiert `npm ci` das eingecheckte Paket. Eine gesonderte
manuelle Installation der Bibliothek ist nicht erforderlich. Das im Studio
gewählte Schemer-HTML bleibt eine separat konfigurierte Anwendung im iframe;
die Bibliotheksaktualisierung ersetzt dieses HTML nicht.

## Übersetzungen

Der Root-Loader führt die deutschen Bibliotheksvorgaben rekursiv mit der eigenen
Sprachdatei zusammen. Eigene Begriffe überschreiben bei Bedarf einzelne Schlüssel.
Die 42 kopierten `codebook.*`-Standardtexte sind aus der Anwendungsdatei entfernt;
anwendungsspezifische Kodier-/Jobtexte bleiben erhalten. Alle Komponenten nutzen
den bestehenden gemeinsamen TranslateService. Es wird kein zweiter Dienst erzeugt.
`mergeTranslations` und `selectTranslationsForLanguage` kommen aus dem
Bibliotheks-Einstieg `@iqb/ngx-coding-components/translations`.
Cache-Busting für die Anwendungsdatei bleibt erhalten.

## Paket- und Exportvergleich

Alle 20 installierten Paketdateien stimmen mit dem gebauten Paket und miteinander
überein. Die Tarball-Integrität stimmt mit beiden Root-Locks überein. Responses
bleibt der gemeinsame Host-Peer 5.3.1. 4.694 Exportpaare über die echten
Studio-/Kodierbox-Adapter ergeben identisches JSON und identische normalisierte
DOCX-Bestandteile. Unveränderte alte Studio-Referenzen werden weiter verglichen;
die Persistenzgrenzen dieses Vergleichs liegen im Speicher.
Der maschinenlesbare Nachweis steht in
[codebook-installation-comparison-2026-10-17.json](codebook-installation-comparison-2026-10-17.json).

Studio lädt die Bibliotheksvorgaben bereits im Root-Loader; die Zusammenführung
nutzt nun die gemeinsamen Hilfen. API-Runtime-Paket, Runtime-Lock und Dockerfile
werden auf denselben Tarball umgestellt. Beim Regenerieren des Runtime-Locks
bleiben bestehende unveränderte Pins erhalten.

## Lokale Prüfung dieses Integrationsstands

- Frontend: 2.283 Tests in 273 Suites bestanden, einschließlich neuer Tests mit
  echter Anwendungs-Sprachdatei, Überschreibungen, Regionsfallback und Interpolation.
- API: 1.315 Tests in 132 Suites bestanden.
- Frontend-/API-Lint und beide Produktionsbuilds bestanden; bestehende Budget-,
  CommonJS-/Stylesheet- und acht API-Lint-Warnungen bleiben.
- Runtime-Lock mit dem Skript aktualisiert: 512 unveränderte Versionspins,
  keine Versionsänderung einer anderen bestehenden Abhängigkeit; zwei nicht mehr
  benötigte Mathjs-/Fraction-Einträge entfallen. Die Docker-Drift-Prüfung stimmt
  mit dem frisch gebauten Produktionsmanifest überein.
- Separate Runtime-Installation mit npm 11.18.0 und
  `npm ci --omit=dev --ignore-scripts`: 512 Pakete erfolgreich installiert.
- Alle 20 installierten Bibliotheksdateien stimmen auch in der Produktionsinstallation
  mit dem gebauten Paket überein. JSON-/DOCX-Einstieg, Null-Einzug mit 100 Twips,
  native Formel sowie ICNS-/PNG-Regression mit `image-size@2.0.3` bestanden.
- Vollständiger npm-Audit: 66 hoch, 0 kritisch, 61 moderat, 1 niedrig. Das entspricht
  dem vorherigen Alpha-Integrationsaudit; diese bestehenden Befunde werden durch
  diese Änderung nicht als behoben ausgewiesen.

Der [Produktionspaket-Nachweis](codebook-production-check-2026-10-17.json)
bezieht sich auf diese separate Installation. Native Installationsskripte und
Docker-Start wurden dabei nicht ausgeführt. Ein Deployment und eine erneute
Microsoft-Word-Abnahme des Originalfalls sind nicht bestätigt. Die entfernte CI
ist am aktuellen PR-Head separat zu prüfen. Frühere Word-Abnahmen gelten für
ihre dort dokumentierten Artefakte.

## CI-Nachtrag: Navigation und Zielauswahl im Browsertest

Die GitLab-Pipeline [104220](https://scm.cms.hu-berlin.de/iqb/studio-lite/-/pipelines/104220)
für `25128e73` scheiterte beim Kopieren an einer als animierend erkannten
`mat-option` sowie beim ersten Test ausgeblendeter Reiter an einer ausbleibenden
Arbeitsbereichs-Anfrage. Die Testnavigation aktiviert den tatsächlichen
Arbeitsbereichslink nun per Fokus und Enter und prüft nach der Anfrage zusätzlich
den Seitentitel. Das Aufgabenmenü wartet auf sein eigenes sichtbares Menüpanel.
Die Zielauswahl beim Verschieben/Kopieren nutzt die Tastaturbedienung des echten
Material-Selects und prüft den ausgewählten Wert und das geschlossene Panel.
HTTP-Ergebnis und Aufgabenbestand in Quelle und Ziel werden weiterhin geprüft;
es kommen keine pauschalen Wartezeiten oder unterdrückten Animationsprüfungen hinzu.

Gegen ein isoliertes lokales PostgreSQL 14.24 mit allen 120 Liquibase-Migrationen
(Liquibase 4.33.0), echte API und Produktionsfrontend bestehen elf Tests für
ausgeblendete Reiter sowie alle drei vorhandenen Erstellungs-/Verschiebe-/Kopierfälle.
Ein temporärer Einstieg importierte dafür die unveränderten drei Testfälle mit
deren regulärer Einrichtung und Bereinigung; er ist nicht Teil des PRs.
E2E-Lint besteht mit sechs vorhandenen Warnungen, E2E-Typecheck besteht ebenfalls.
Chrome lief headless mit Cypress-Binary 15.21.1 (wie in den fehlgeschlagenen
CI-Logs); die installierte CLI 15.10.0 meldet dabei eine Versionswarnung.
Dies bestätigt diese 14 Browserfälle lokal, keine vollständige E2E-Suite,
Coverage, Docker-Ausführung oder entfernte CI am neuen Head.
