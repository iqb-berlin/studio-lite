# SOLVER-Kompatibilität und Paket-Mindestversion vom 15.10.2026

Dieser Nachtrag ersetzt den Paketstand aus `codebook-responses-2026-10-15.md`.
Responses bleibt in allen Anwendungen und der Bibliotheksentwicklung bei 5.3.1.
Der öffentliche Peer der Bibliothek verlangt jetzt `^5.3.1`: 5.3.0 erkennt die
kleingeschriebenen Chemieformate gespeicherter Aufgaben noch nicht.
Zwei neue Bibliothekstests sichern zusätzlich `chem-molecule` und
`chem-element-symbols`; der Installationsvergleich prüft die Mindestversion und
beide Formen direkt über die tatsächlich installierten Pakete.

## Erhaltenes Kodierverhalten der Kodierbox

Das unveränderte npm-Responses 5.3.1 ändert gegenüber Kodierboxs bisherigem 5.2.0
SOLVER-Ergebnisse: neue absolute mathjs-Toleranz und Kodierung von NULL-Ergebnissen.
Die Kodierbox erhält deshalb eine lokale, reproduzierbar erzeugte Engine-Fassung
**aus dem installierten Responses 5.3.1**, deren einziger umgeleiteter Import die
SOLVER-Mathematik ist. Der gesamte Ableitungsablauf bleibt aus 5.3.1; Codes und
abhängige Variablen sehen das richtige Ergebnis bereits vor der Codeauswahl.

Der Adapter verwendet eine private Instanz der bisherigen mathjs-Version 12.4.3
mit relativer Toleranz 1e-12 und schreibgeschützter Konfiguration. Dies erhält auch
weitere Math-Funktionen; nur die absolute Toleranz von mathjs 15 zu ändern wäre
keine vollständige Absicherung. NULL liefert wie bisher DERIVE_ERROR.
Auch verschachtelte evaluate/parser-Aufrufe können die Konfiguration nicht ändern.
Globale Math-Instanzen und die normale Responses-Factory werden nicht verändert.

Validierung, Abhängigkeitsgraph, Schemer und Codebook-Regeltexte bleiben auf dem
normalen Responses-5.3.1-Peer. Studio behält seine bisherige eigene Engine-Semantik.
Die gemeinsame Bibliothek enthält keine Kodierbox-Kompatibilität und weiterhin
keine Jobsteuerung. Es gibt keine Datenmigration oder neue Statuszuordnung.

## Regressionen und unabhängiger Vergleich

Die drei neuen Service-Regressionen schlugen vor der Korrektur fehl und bestehen
nun über den echten Kodierbox-Namespace-/Aliasweg:

| Fall | Bisheriges und nun wiederhergestelltes Ergebnis |
| --- | --- |
| ceil(A), A=1e-15, passende 0/1-Regeln | Wert, Code und Score 1 |
| A==0 ? 1:0, A=1e-15, passende 0/1-Regeln | Wert, Code und Score 0 |
| NULL-Zweig, auch mit IS_NULL-Code | DERIVE_ERROR; keine abgeschlossene Kodierung |

Eine unabhängige Matrix vergleicht **11.760 Engine-Paare** mit dem unveränderten,
veröffentlichten Responses 5.2.0: sieben Ableitungsarten, 14 Statuswerte, 14
Wertformen, Aliasvarianten, Subforms und neun SOLVER-Ausdrücke. Weitere Fälle
prüfen bestehende Zielzustände, BASE_NO_VALUE, SUM_SCORE-Ketten, nicht endliche
Ergebnisse, Konfigurationsschutz und ausbleibende globale Nebenwirkungen.
Das alte Referenzpaket ist ausschließlich eine Entwicklungsabhängigkeit und
wird nicht für Produktionskodierung verwendet.

Der Builder `coding-box/scripts/build-autocoder-compat.mjs` bündelt die
installierten 5.3.1-Quellen, ohne sie manuell zu bearbeiten, und leitet genau einen
Math-Import um. Der Backend-Test baut das eingecheckte Artefakt erneut und
vergleicht es bytegenau; Version und Importanzahl sind geprüft. Details stehen
in `coding-box/docs/autocoder-solver-compatibility.md`.

## Gemeinsames installiertes Paket

Beide Hosts verwenden denselben neu gebauten 4.1.0-Tarball, SHA256:
`2df79a7b18196d7c25d7e02e15d5b148200d75ba2a315214ccfb8386536dd0a6`.
Root-Locks und Studios API-Runtime-Lock enthalten dessen passende Prüfsumme und
Peer-Mindestversion. Der Generator- und UI-Runtime-Code wurde dabei nicht geändert.

Die unveränderten unabhängigen Studio-Referenzen bleiben verbindlich; sie werden
nicht aus dem neuen Generator neu erzeugt. Der erneute Installationsvergleich
prüft JSON strukturell und alle normalisierten DOCX-Bestandteile einschließlich
Bildern, Formeln, Styles, Tabellen, Beziehungen, Fußzeilen und Seitenfeldern.
Die echten Anwendungsadapter verwenden Datenquellen im Speicher.

## Abschließende lokale Prüfung

| Bereich | Ergebnis |
| --- | --- |
| Bibliotheks-Angular | 552 Tests bestanden |
| Eigenständiger Schemer | 6 Tests und Build bestanden |
| Generator ESM/CommonJS | 1.285 Tests bestanden, keine übersprungen |
| Studio-Frontend | 178 Tests in 9 betroffenen Suites bestanden |
| Studio-API | 145 Tests in 4 betroffenen Suites bestanden |
| Kodierbox-Frontend vollständig | 2.516 Tests bestanden |
| Kodierbox-Zoneless | 750 Tests bestanden |
| Kodierbox-Paketkorrekturen | 19 Tests bestanden |
| Kodierbox-Backend vollständig | 2.682 bestanden, 17 bestehende Tests übersprungen |

Alle Hosttests liefen ohne Jest-/Nx-Cache. Bibliothek und alle vier Host-Builds
bestehen. Host-Lint und Lint der geänderten Bibliothekstestdatei bestehen;
Studio meldet bestehende Warnungen. Frontend- und Backend-Prüfungen wurden
getrennt und nacheinander ausgeführt. Die Studio-Testfixture verwendet einen
indexierten Statuszugriff, der auch bei frischer strikter Kompilierung gültig ist.

**4.694 installierte Exportpaare bestehen erneut.** Vor dem Export werden alle
20 Paketdateien gegen den frischen Bibliotheksbuild geprüft. Die 32 unabhängigen
Studio-Rohschema- und 20 Abstandsreferenzen wurden nicht neu erzeugt und bestehen
weiterhin. Die bereits dokumentierten gezielten Formatkorrekturen bleiben erhalten.
Der aktuelle maschinenlesbare Nachweis liegt in coding-components unter
`docs/codebook-solver-installation-comparison-2026-10-15.json`; er enthält nun
zusätzlich Peer-Mindestversion und den Nachweis gespeicherter Chemieformate.

Der gebaute Kodierbox-Backend-Code enthält die lokale SOLVER-Kompatibilität.
Sein Runtime-Manifest verlangt Responses 5.3.1 und mathjs 12.4.3 und enthält das
alte Referenzpaket nicht. Auch im Backend-Bundle kommt kein Referenzpaket-Import
vor. Studios Docker-Driftprüfung stimmt mit der frisch gebauten API überein;
Runtime-Lock und Tarball-Prüfsumme sind abgeglichen. Eine neue vollständige
Docker-Runtime-Installation wurde nicht durchgeführt.


## Erneute Prüfung nach Kodierbox-develop-Abgleich

Die Kodierbox wurde mit `develop` auf `ab8d6f250` (Angular-Zoneless-Grundlage,
PR #1048) zusammengeführt. Die vier Konflikte betrafen die beiden CI-Dateien,
`package.json` und `package-lock.json`. Die eingegangenen Sicherheitsupdates,
Paketkorrekturen und Zoneless-Änderungen bleiben erhalten; Responses 5.3.1,
der gemeinsame Tarball, mathjs 12.4.3 und die reine Entwicklungsreferenz wurden
beibehalten. Das vollständige Node-22-Bookworm-Image und die getrennten
Frontend-/Backend-Prüfungen bleiben in der CI erhalten.

Das aktualisierte esbuild 0.28.1 erfordert eine neue Erzeugung der eingecheckten
Kompatibilitätsengine. Die Änderung betrifft dessen Modulinitialisierungshelfer;
der bytegenaue Reproduzierbarkeitstest und die unabhängigen Engine-Vergleiche
bestehen mit dem neuen Artefakt. Der Codebook-Zoneless-Test verwendet jetzt
`whenStable()` und Jest-Timer anstelle des Zone.js-abhängigen `fakeAsync`.
Seine drei Fälle bestehen auch im normalen Frontend-Testlauf. Sie prüfen weiterhin
asynchrones Laden, sichtbaren Fortschritt, Downloadsperre und Polling-Abbruch.

Die Tabelle oben enthält die nach diesem Abgleich wiederholten Kodierbox-Prüfungen.
Die 19 Paketkorrekturtests sichern außerdem die aus `develop` übernommenen
Abhängigkeiten ab. Der Installationsvergleich wurde anschließend mit den
unveränderten installierten Studio-/Bibliothekspaketen erneut ausgeführt;
Bibliotheks- und Studio-Builds/Tests wurden durch diesen Kodierbox-Abgleich nicht
verändert. Die unabhängigen Studio-Referenzdateien bleiben unverändert.

## Nachweisgrenzen

Die ergänzte [Windows-Desktop-Word-Abnahme](codebook-word-windows-2026-10-15.md)
prüft den oben bezeichneten aktuellen Tarball: 16 synthetische Dokumente,
32 vollständig gesichtete Seiten, sieben pixelgleiche aktuelle Host-Paare und
zwei unveränderte alte Studio-Referenzen. Word LTSC 2024, Version 2408,
Build 16.0.17932.21000 (64 Bit), besteht auch den Wiederholungslauf der endgültigen
Prüfskriptfassung. Die vereinbarte Kennzeichnung und die dokumentierte
18pt-Korrektur bleiben die sichtbaren Unterschiede zur alten Rich-Text-Referenz.

Ein aktueller HTTP-/Browser-/Redis-Lauf wurde für diese Korrektur nicht erneut
ausgeführt; die Word-Abnahme ersetzt diese Anwendungsprüfungen nicht.
Bereits veröffentlichte Verona-Schemer-Module benötigen weiterhin eine separate Aktualisierung.
Es wurden kein npm-Release, kein PR-Merge, kein Deployment und keine Datenmigration ausgeführt.
Die CI der neuen PR-Heads ist ein separater Nachweis.
