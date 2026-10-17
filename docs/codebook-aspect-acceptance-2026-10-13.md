# Browser- und Word-Abnahme der Codebooks

Die bestätigten Formatierungsfehler sind behoben. Der echte Aspect Editor und Player, der gemeinsame Instruktionseditor sowie Studio und Kodierbox wurden mit synthetischen Daten geprüft. Microsoft Office Web Viewer / Word hat 262 Seiten gerendert; die Aufnahmen jeder Seite sind mit deren tatsächlicher Fußzeile abgeglichen.

## Umfang und Ergebnisse

| Prüfung | Ergebnis |
| --- | --- |
| Aspect: HTML laden, Unit über die Oberfläche speichern, echter Verona-Player | 2.740 Formatfälle, 40 native Formeln |
| Gemeinsamer Editor: HTML laden, speichern und wiederöffnen | 2.738 unterstützte Formatfälle |
| Vollständige gültige Textmarkierungsmatrix je Editor | 2.496 = 16 Kombinationen aus fett/kursiv/unterstrichen/durchgestrichen × normal/tief/hoch × vier Ausrichtungen × 13 Schriftgrößen |
| Weitere Matrixfälle | 16 Farbgrenzen, neun Listenstile auf fünf Ebenen, 120 Absatzkombinationen, 16 Überschriften, Bildpositionen, Formeln, Sonderzeichen, Umbrüche und Zitate; Aspect zusätzlich Inlinebild und Trennlinien |
| Tatsächliche Toolbar-Bedienung | 57 Aspect- und 52 gemeinsame Editorfälle; jeweils alle 38 Sonderzeichen-Schaltflächen; gemeinsamer Formeldialog zusätzlich separat geprüft |
| HTML-Austausch in beiden Richtungen | Je 2.738 Fälle und 40 Formeln erhalten; Speichern/Wiederöffnen und echter Player erfolgreich |
| Austausch bis Word | In beiden Richtungen **alle normalisierten DOCX-Bestandteile identisch** zur tatsächlich in Word gerenderten Matrix |
| Generator | 1.245 Tests bestanden, keine übersprungen; ESM und CommonJS, mit und ohne Scores |
| Editor-Regressionsprüfungen | Gemeinsamer Editor 10 Tests; Aspect 16 Tests bestanden |
| Installationsvergleich | 4.654 Studio-/Kodierbox-Exportpaare: JSON und alle normalisierten DOCX-Bestandteile identisch |
| Host-Tests | Studio 49 API + 66 Frontend; Kodierbox 58 Backend + 60 Frontend bestanden |
| Builds | Bibliothek, frischer Aspect Editor/Player und alle vier Host-Builds erfolgreich |
| Installation | Identischer 4.1.0-Tarball in beiden Hosts; zusätzlich saubere Studio-Runtime-Installation mit 515 Paketen; alle 20 Paketdateien in allen drei Installationen bytegleich |

Die große Matrix läuft über die tatsächlichen Tiptap-Parser und Serialisierungen. Die Bedienfälle prüfen zusätzlich echte Schaltflächen, Auswahllisten, Bilddateiauswahl und Speicherdialoge. Der gemeinsame MathLive-Dialog wird über seinen öffentlichen Eingabewert und das reale Input-Ereignis bedient. Die erfolgreichen Editor-, Player-, Authentifizierungs-, API- und Queue-Abläufe verwenden ihre echten Implementierungen.

## Behobene Fehler

- Normale Mehrfachabstände wurden beim Laden und Wiederöffnen reduziert. Normale, geschützte und schmale geschützte Leerzeichen bleiben erhalten; JSON-Inhalte und ausdrücklich gesetzte Parseroptionen funktionieren weiter.
- Farben, Schriftgrößen und Hervorhebungen wurden auf den ganzen Absatz ausgedehnt. Sie gelten jetzt nur für die jeweilige markierte Textstelle. CSS-Pixel und Punktangaben werden korrekt in Word-Halbpunkte umgerechnet.
- Absatzabstände, Einzüge, hängende Einzüge und formatierte Listen gingen im Word-Export verloren. Die gesetzten Attribute und Listenmarker bleiben erhalten.
- Einrückung und hängender Einzug funktionierten nach „Alles auswählen“ nicht; im gemeinsamen Editor scheiterte Absatzabstand an Textknoten. Beide Bedienpfade sind repariert.
- Inlinebilder wurden aus dem Text herausgezogen oder doppelt ausgegeben; gesetzte linke/rechte Bildpositionen gingen verloren. Word erhält die Platzierung einschließlich Textumlauf-Ankern.
- Aspect-Formeln wurden aus veraltetem MathLive-Anzeige-HTML gelesen; reine Formelinstruktionen konnten herausgefiltert werden. Beide Formel-HTML-Formate werden aus ihrem LaTeX verarbeitet, und der Instruktionsfilter erkennt reine Aspect-Formeln.
- Die Editoren erkannten beim HTML-Austausch jeweils nur ihren eigenen Formelknoten. Beide lesen nun beide Formate und speichern im eigenen kanonischen Format weiter.
- Über- und Unterstriche wurden als kurzer Akzent und teils an der falschen Position dargestellt. Native Word-Balken umfassen jetzt den ganzen Ausdruck. Bruchstriche, Wurzelzeichen und große Operatoren erhalten dieselbe Farbe und Größe wie die Formelzeichen; der Vorher-/Nachher-Nachweis wurde in Word tatsächlich geprüft.
- Schriftgröße, Farbe und Textmarkierungen um Formeln gingen im nativen Word-Mathematikformat verloren. Die umgebenden Eigenschaften werden auf native Mathematikläufe übertragen; der Formelcache bleibt unverändert und überträgt keine fremde Formatierung.
- Formelabsätze wurden immer links ausgerichtet; die gewählte Ausrichtung bleibt erhalten. Zeilenumbrüche innerhalb von LaTeX-Attributen werden nicht mehr in HTML-Break-Tags umgewandelt.
- Aspect erlaubte keine erneute Auswahl derselben Bilddatei. Das Dateifeld wird nach dem Auslesen geleert; die vier Bildpositionen wurden mit derselben Datei tatsächlich eingefügt.

## Erhalt der bisherigen Studio-Ausgabe

Die unabhängigen Referenzen stammen weiterhin vom ursprünglichen Studio-Commit `2504265721a59c7c65425072951ce82ab16f0fb8`. Die 32 bestehenden Rohschema-Referenzen und 20 Leerzeichenfälle wurden nicht aus der neuen Implementierung neu erzeugt.

Grundlayout, Auswahlregeln, Scores, Missing-Codes, Beziehungen, Bilder und unveränderte Formatfälle bleiben gegen die alten vollständigen JSON-/DOCX-Referenzen abgesichert. Eine **bewusste Korrektur** betrifft den alten `Farbe`-Referenzabsatz: explizite `18pt` wurden früher als 18 Word-Halbpunkte, also 9pt, behandelt; nun werden korrekt 36 Halbpunkte ausgegeben. Der Vergleich normalisiert ausschließlich diesen streng geprüften Unterschied und die gleichwertige Hex-Schreibweise der Hervorhebung zurück. Alle anderen Dokumentbestandteile bleiben Gegenstand des ursprünglichen Hashvergleichs. Neue Tests prüfen die korrigierten Werte unmittelbar.

Die frühere pixelgleiche Abnahme des Pakets `dcee6cc…` ist ein historischer Nachweis. Für das jetzige Paket gelten die oben beschriebenen gezielten Darstellungsfixes und die neue Word-Abnahme; eine pauschale Pixelgleichheit zu allen alten Fehlformatierungen wird nicht behauptet.

## Microsoft Word

| Dokument | Seiten |
| --- | ---: |
| Aspect: vollständige Formatmatrix | 114 |
| Gemeinsamer Editor: vollständige Formatmatrix | 114 |
| Aspect: Übersicht aller unterschiedlichen Formatmerkmale | 12 |
| Gemeinsamer Editor: Formatübersicht | 12 |
| Tatsächlich bediente Toolbarfälle und 13 kombinierte Formelschriftgrößen | 6 |
| Aktuelle Studio-Referenz mit korrigierter expliziter Schriftgröße | 3 |
| Farbige zusammengesetzte Formeln, breite Über-/Unterstriche | 1 |
| **Gesamt** | **262** |

Alle Seiten wurden aus dem echten Microsoft-Viewer erfasst. Dessen wiederverwendete Bildkacheln wurden anhand ihrer Seitenposition erfasst; ein zusätzlicher OCR-Abgleich bestätigt die erwartete Seitennummer jeder Aufnahme. Die Formatübersichten und repräsentative Matrixseiten wurden visuell geprüft. Die vollständigen Matrixinhalte, Markierungen, Größen und Ausrichtungen sind zusätzlich im DOCX geprüft. Beide Richtungen des Editor-Austauschs ergeben exakt dieselben Word-Dokumentbestandteile wie die gerenderte gemeinsame Matrix.

Die Galerie enthält sämtliche Seiten in Originalauflösung. Verwendet wurden ausschließlich erfundene, versionierte Abnahmedokumente; kein Office-Konto und keine Nutzerdaten waren nötig. Dies ist eine Microsoft-Word-Web-Abnahme. Desktop-Word unter Windows oder macOS wurde nicht ausgeführt.

## Echte Host-Downloads

Studio und Kodierbox exportieren drei synthetische Aufgaben mit insgesamt 5.479 Code-Instruktionen: beide vollständigen Editor-Matrizen und eine kombinierte formatierte Aspect-Formel. Beide gebauten Frontends laufen mit den produktiven NestJS-Bundles. Studio verwendet eine frisch migrierte PostgreSQL-Datenbank; Kodierbox zusätzlich echtes Redis/Bull und Keycloak.

Studio prüft JSON/DOCX, leere Auswahl, Auswahl während der Suche, Dialogabschluss, 401/403 sowie sichtbare Fehler und erneuten Versuch. Kodierbox prüft echte Jobanlage, Status und Download, doppelte Auslösung, Anlage-/Status-/Downloadfehler, erneuten Versuch und das Ende des Pollings beim Schließen. Ausschließlich Fehlerzweige werden gezielt im Browsernetzwerk injiziert. Erfolgreiche Downloads sind in JSON und jedem normalisierten DOCX-Bestandteil identisch; geschützte und wiederholte Leerzeichen bleiben erhalten.

Testdienste: PostgreSQL 16.11 mit Repository-Migrationen, Studio Liquibase 4.33 und Kodierbox 4.28, Redis 7.4 und Keycloak 26.7.3. Die vorhandene Keycloak-JS-Version 23.0.7 benötigt im isolierten Testrealm den Nonce-Kompatibilitätsmapper. Die Prüfung ist lokal; sie bestätigt keine Produktion oder Bereitstellung. Die vollständigen Host-Testsuiten wurden nicht erneut ausgeführt.

Der Dokumentvergleich normalisiert ausschließlich die Datumsausgabe in der Fußzeile, unabhängig vom Ausführungstag. Ein eigener Test stellt sicher, dass Datumsangaben und Markenbezeichnungen im eigentlichen Nutzerinhalt erhalten bleiben. Zusätzlich sind explizite Listenstarts bei 0 und 7 abgesichert.

## Paket und Abgrenzung

Paket-SHA256: `0e355c3896799ae765cb6e90b00147da0359c56f5fdc90d36b7caf40fbe59ab8`.

Die Abnahme betrifft Rich Text in Textinhalten und manuellen Kodieranweisungen. Interaktive Antwortfelder sind eigenständige Player-Elemente. Farben wurden über repräsentative Hex-/RGB-/Namenswerte, Bildpositionen mit synthetischen PNG-Dateien geprüft. Formatierte Listen erhalten im statischen Word-Codebook explizite Marker; sie werden dort nicht automatisch neu nummeriert.

Lokale Tests, Browser-/Word-Abnahme, Push und entfernte CI sind getrennte Nachweise. Der aktuelle CI-Stand wird bei den Pull Requests dokumentiert; aus lokalen Erfolgen wird keine grüne GitLab-Pipeline abgeleitet.

Versionierte synthetische Word-Dateien: `scripts/fixtures/word-acceptance/` im coding-components-Repository. Reproduzierbare Generator- und Formatprüfungen: `npm run build_cc && npm run test:codebook`; Host-Vergleich: `scripts/compare-codebook-installations.mjs`. Die vollständige lokale Galerie und maschinenlesbaren Ausführungsnachweise ergänzen diese Zusammenfassung.
