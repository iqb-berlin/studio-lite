# Abgleich mit Studio develop vom 15.10.2026

`develop` bis `156f4269` wurde in `shared-codebook` integriert. Die fünf Konflikte
betrafen Root-Paket/Lock, API-Runtime-Paket/Lock und den Codebook-Wrapper.

- Studios Version `21.0.0-beta.1`, Angular-Werkzeuge `21.2.26` und Anwendungsversion
  `@iqb/responses` 5.3.0 bleiben aus develop erhalten.
- Der gemeinsame Codebook-Tarball bleibt unverändert. Sein Generator verwendet
  weiterhin seine eigene festgelegte `@iqb/responses`-Version 5.2.2. Beide Locks
  enthalten die nötige getrennte Auflösung; beide Versionen wurden tatsächlich
  in der Installation geprüft.
- Die Speichersperre verwendet jetzt das aktuelle Signal aus `UnitStoresService`.
  Sie bleibt im geöffneten Dialog reaktiv. Ein neuer Test prüft Änderungen nach
  dem Öffnen, die Exportsperre und die erneute Freigabe nach dem Speichern.
- Der Studio-Wrapper behält den direkten Export. Es werden keine Jobs eingeführt.

## Erneut geprüft nach der Konfliktauflösung

- 171 Frontend-Tests in sieben betroffenen Suiten bestanden.
- 145 API-Tests in vier betroffenen Suiten bestanden, einschließlich des
  Codebook-Adapters, Controllers und Unit-Service.
- Frontend-/API-Lint ohne Fehler (64 beziehungsweise sieben Warnungen).
- Frontend- und API-Build bestanden; getrennt und nacheinander ausgeführt.
- Der Drift-Guard des API-Dockerfiles bestätigt alle 67 erzeugten Abhängigkeiten
  gegenüber dem Runtime-Paket. Root- und Runtime-Lock stimmen mit den Tarball-
  Bytes überein. Es wurde kein neues Docker-Image gebaut.
- 4.694 installierte Exportpaare nach dem Merge erneut identisch: JSON strukturell
  und alle normalisierten DOCX-Bestandteile. Die 20 installierten Paketdateien
  stimmen mit dem frischen Bibliotheksbuild überein; auch die ursprünglichen
  Studio-Referenzen und die neuen Inlinebild-Fälle bestehen weiter.

Paket-SHA256 bleibt
`1340db41e6493cca3d4395426c14f156319c3bbbf0b81d01f84c233a56a5091a`.
Die Aussage zur identischen Ausgabe umfasst den geprüften Generatorvergleich;
Browser-/Redis-Abläufe und Word-Rendering wurden hierbei nicht erneut ausgeführt.
Desktop-Word unter Windows bleibt offen. Kein Merge des Feature-PRs, Release oder
Deployment wurde ausgeführt.
