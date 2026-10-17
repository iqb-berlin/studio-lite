# Codebook-Alpha in Studio

> Historischer Bericht vom 15.10.2026. Der Branch verwendet inzwischen den
> [korrigierten Entwicklungsbuild vom 17.10.2026](codebook-integration-2026-10-17.md).
> Die folgenden Paketangaben bleiben als Nachweis des damaligen Stands erhalten.

Studio verwendet das veröffentlichte Paket `@iqb/ngx-coding-components@4.1.0-alpha.1`
aus dem [GitHub-Prerelease](https://github.com/iqb-berlin/coding-components/releases/tag/Schemer_v2.9.0-alpha.1).
Der eingecheckte Tarball hat SHA-256
`cb85078662e8fe4490aa90001e369db059571da73ec73a1457a7ffb89d49f296`.
Root-Installation, API-Runtime-Lock und Dockerfile verweisen auf diese Datei.
Eine npm-Registry-Veröffentlichung ist für diese Installation nicht erforderlich.

Der Alpha-Tarball unterscheidet sich vom zuvor in diesem Branch geprüften
4.1.0-Tarball ausschließlich in `package/package.json` bei der Versionsnummer.
Alle übrigen Paketdateien sind bytegleich. Historische Abnahmeberichte behalten
ihre ursprünglichen Artefaktbezüge und werden nicht nachträglich umgeschrieben.

## Sicherheitskorrektur beim Einbinden

Der Host erzwingt `image-size@2.0.3`, auch für den Generator und die API-Runtime.
Die vorherige verschachtelte Version 1.2.1 ist von
[GHSA-5p2g-fcmc-qvqq](https://github.com/advisories/GHSA-5p2g-fcmc-qvqq) und
[GHSA-w3rx-r6r6-pgpr](https://github.com/advisories/GHSA-w3rx-r6r6-pgpr) betroffen.
Der zusätzliche API-Test prüft am tatsächlich vom Generator aufgelösten Parser,
dass ein ICNS-Eintrag ohne Fortschritt innerhalb eines begrenzten Kindprozesses
abgelehnt wird und ein gültiges PNG weiterhin seine Größe liefert.
Der Runtime-Generator übernimmt den gleichen Override.

## Fachlicher Test im Studio-Testsystem

1. Einen Testarbeitsbereich mit synthetischen Aufgaben und Kodierschemata öffnen.
2. Den Codebook-Export im Arbeitsbereich öffnen. Aufgabenliste, Suche,
   Vorauswahl und Gruppenspalte prüfen.
3. Manuelle und geschlossene Variablen einzeln und gemeinsam auswählen;
   Schulungsfilter sowie Missingprofil prüfen. Codes ohne sichtbare manuelle
   Instruktion dürfen in der rein manuellen Auswahl nicht erscheinen.
4. JSON und DOCX exportieren. Code 0, Missing 0, Bewertungen, Aliase,
   Itembeziehungen, allgemeine Hinweise, Listen, Bilder und Formeln prüfen.
5. Während einer Speichersperre und bei einem Exportfehler müssen Sperren und
   Fehlermeldungen sichtbar sein; danach muss ein erneuter Export möglich sein.

Das Codebook ist Teil der Studio-Integration. Das eigenständige Schemer-HTML
stellt keinen zusätzlichen Codebook-Dialog bereit. Die neue Partial-Credit-
Erweiterung für leere Teilantworten ist nicht Bestandteil dieser Alpha.

## Nachweisgrenzen

Die lokale Alpha-Prüfung umfasst vollständige Frontend-/API-Tests, Lint,
Produktionsbuilds und die bestehende Codebook-Referenzmatrix. Die exakten
Ergebnisse und entfernte CI stehen im PR. Lokale Prüfungen bestätigen keinen
Deployment-Stand. Vollständige Host-/Word-Abnahmen werden durch die
Versionierungsänderung nicht als erneut ausgeführt ausgewiesen.

Der vollständige npm-Audit enthält weiterhin bereits zuvor vorhandene Befunde.
Der Vergleich mit dem unmittelbaren Branch-Ausgangspunkt enthält keine neuen
hohen oder kritischen Befunde; der neue Image-Size-Befund ist behoben.
