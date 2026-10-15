# Responses-Aktualisierung und Codebook-Prüfung vom 15.10.2026

## Versions- und Laufzeitvertrag

`npm view @iqb/responses version` lieferte beim Abgleich 5.3.1. Diese aktuelle
Patchversion der gewünschten 5.3-Reihe ist in allen drei Root-Manifests exakt
festgelegt. Studios API-Runtime-Manifest und -Lock verwenden ebenfalls 5.3.1.
Die gemeinsame Bibliothek bezieht Responses als Peer mit `^5.3.0`, statt eine
private 5.2.2-Version für alle Bibliotheksfunktionen mitzuliefern.

Damit lösen Schemer, Validierung und Codebook-Regeltextkonvertierung in beiden
Anwendungen dieselbe Responses-Installation wie ihr Host auf. Dies wird am
installierten Paket geprüft, nicht aus den Manifests angenommen. Der Generator
bleibt Angular-frei; Jobverarbeitung und Polling bleiben in der Kodierbox.

Studio wird von 5.3.0 auf 5.3.1 aktualisiert, die Kodierbox-Kodierengine von 5.2.0
auf 5.3.1. Kodierboxs Antwort- und Persistenzvertrag bleibt bei
`@iqbspecs/response` 1.5.1, einschließlich CODE_SELECTION_PENDING und alter
`codes`-Listen. Responses selbst benötigt intern Antwortformat 2.0. Der private
Typ für die Verarbeitung in CodingProcessService wird daher aus dem echten
Engine-Parameter abgeleitet. Die bestehende numerische Datenbank-Statusübergabe
wird nicht umgedeutet: Ein Regressionstest durch den realen Kodierbox-Adapter
und die echte 5.3.1-Engine erhält Status 13, Code/Score 0, alte Codeauswahl,
Alias und Subform. Keine Datenmigration und keine Status-Neuzuordnung.

## Ergänzte Regressionen

- 24 Bibliothekstests verwenden die echte Responses-Implementierung über
  Validierung und SchemerService. Sie prüfen beide NO_VALUE-Schreibweisen,
  sieben alte/neue Typbezeichnungen, elf alte/neue Formatbezeichnungen,
  zwei Chemieformate und eine tatsächlich unzulässige STRING/BASE_NO_VALUE-
  Kombination. Mit dem früheren privaten 5.2.2 scheiterten 22 dieser Tests;
  mit 5.3.1 bestehen alle 24. Die anderen beiden Tests bestanden bereits zuvor.
- Drei Studio-Tests erzeugen den tatsächlich installierten öffentlichen
  SchemerComponent, ohne Responses-Factory-Mock. NO_VALUE und no-value erhalten
  Status OK; STRING/BASE_NO_VALUE bleibt ein blockierender INVALID_SOURCE-Fehler.
  Der Großschreibungsfall scheiterte vor dem Paketwechsel.
- Vier Kodierbox-Tests prüfen die echte installierte Engine: beide NO_VALUE-
  Schreibweisen, echte Quellenfehler und automatische Kodierung mit Code/Score 0.
- Der bestehende Kodierbox-Kompatibilitätsfilter berücksichtigt beide
  NO_VALUE-Schreibweisen. Ein zusätzlicher Test verhindert, dass ein Fehler
  für eine eigentlich passende uppercase-NO_VALUE-Quelle fälschlich toleriert wird.
  Bestehende und ergänzte Tests prüfen den echten Validator in strict/compatible.
  BASE/no-value wird vom aktuellen Validator nativ akzeptiert; BASE_NO_VALUE/STRING
  bleibt tatsächlich unzulässig und wird nur nach der bestehenden ausdrücklich
  gewählten Legacy-Kompatibilität toleriert. Strict lässt diesen Fehler blockierend.
- Ein zusätzlicher Service-Test prüft die oben beschriebene alte Codeauswahl
  durch den echten aktuellen Autocoder einschließlich Alias-Routing.

Die bewussten Validator-Korrekturen der 5.3-Reihe werden somit ausdrücklich
übernommen; die Validierung wird nicht pauschal abgeschaltet. Der Runtime-Code
für JSON-/DOCX-Erstellung wurde bei diesem Paketwechsel nicht geändert.

## Lokale Prüfungen

| Bereich | Ergebnis |
| --- | --- |
| coding-components Angular | 550 Tests bestanden |
| Generator, ESM und CommonJS | 1.285 Tests bestanden, keine übersprungen |
| Eigenständiger Schemer | 6 Tests und Build bestanden |
| Studio-Frontend, betroffener Bereich | 178 Tests in 9 Suites bestanden |
| Studio-API, betroffener Bereich | 145 Tests in 4 Suites bestanden |
| Kodierbox-Frontend, vollständige Suite | 2.102 Tests in 207 Suites bestanden |
| Kodierbox-Backend, vollständige Suite | 2.643 Tests bestanden, 17 bestehende Tests übersprungen |

Bibliothek und alle vier Anwendungsbuilds bestanden. Frontend- und Backend-
Prüfungen liefen in getrennten, aufeinanderfolgenden Phasen. Host-Lint bestand;
Studio meldet bestehende Warnungen. Die neue Bibliotheks-Testdatei besteht ESLint.
Studios Docker-Versionsprüfung stimmt mit der frisch gebauten API überein;
Runtime-Lock, Root-Locks und Tarball-Prüfsummen sind abgeglichen. Eine neue
vollständige Docker-Runtime-Installation wurde für diesen Stand nicht ausgeführt.

## Erneuter Installationsvergleich

Beide Anwendungen enthalten dasselbe frisch gebaute und installierte 4.1.0-Artefakt:

- SHA256: `9a0e75158dcc70e821c6a481d431ec6a0429e248afb85bd27991b1ae1af22d7a`.
- Alle 20 installierten Paketdateien entsprechen dem frischen Bibliotheksbuild.
- Beide Hosts und die Bibliothek lösen Responses auf denselben lokalen Pfad auf;
  die installierte Version ist jeweils 5.3.1. Eine private Responses-Abhängigkeit
  wird vom Vergleich explizit abgelehnt.
- Der installierte Validator akzeptiert uppercase NO_VALUE; die installierte
  Regeltextdarstellung erkennt das neue Chemieformat.

**4.694 Exportpaare bestehen:** 4.608 synthetische Matrixpaare, 6 ergänzende
Vertragsfälle, 40 Exporte gegen die 20 unabhängigen Studio-Leerzeichenreferenzen
und 40 Inlinebildfehler-Paare. Die Matrix umfasst alle 256 Kombinationen der acht
Ja/Nein-Optionen, drei Schulungsfilter, drei Missingkonstellationen und beide Formate.
Der Vergleich verwendet Studios DownloadWorkspacesClass und Kodierboxs echten
Generation-Service mit ihren Anwendungsadaptern. Datenquellen liegen im Speicher.
JSON wird strukturell verglichen, DOCX in allen normalisierten Paketbestandteilen:
Text, Tabellen, Styles, Fußzeilen, Seitenfelder, Medien, Beziehungen und Formeln.
Die neuen Versions-/Auflösungsprüfungen laufen vor diesen Exporten.

Die 32 ursprünglichen Studio-Rohschema-Referenzen und 20 Leerzeichenreferenzen
wurden nicht neu erzeugt. Die Generator-Suite prüft sie weiterhin; gezielt
vereinbarte Normalisierungen wie die frühere 18pt-Korrektur bleiben unverändert.
Die Tests belegen die abgedeckten Fälle, keine allgemeine Fehlerfreiheit beliebiger
Daten. Die künstlichen Aufgaben sind weiterhin von den Beispiel-ZIPs unabhängig.

Maschinenlesbarer aktueller Nachweis in coding-components:
`docs/codebook-responses-installation-comparison-2026-10-15.json`.

## Grenzen und Einführung

Für diesen Paketwechsel wurden kein neuer HTTP-/Browser-/Redis-Durchlauf und
kein neuer Microsoft-Word-Renderinglauf ausgeführt. Die frühere Word-Web-Abnahme
bezieht sich auf das damalige Artefakt. Desktop-Word unter Windows bleibt offen;
DOCX-XML-Gleichheit allein ist kein Nachweis identischer Windows-Word-Darstellung.
Die verpflichtende visuelle Abnahme und Prüfung beider realer Anwendungsabläufe
bleiben vor dem Ausrollen bestehen.

Der eigenständige Schemer wurde mit 5.3.1 gebaut und getestet. Studios produktiv
über Verona geladene Schemer-Module erhalten diese Version erst durch ihre
separate Veröffentlichung und Einbindung; der Anwendungspaketwechsel ersetzt
keine bereits hochgeladenen Module.

Dies ist eine lokale Prüfung des Release-Kandidaten. CI auf den gepushten
PR-Ständen ist ein separater Nachweis. Keine npm-Veröffentlichung, kein Merge,
kein Deployment und keine Produktionsabnahme wurden durchgeführt.
