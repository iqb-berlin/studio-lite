# Studio: Codebook-Abnahme vom 13.10.2026

49 API- und 66 Frontendtests; direkte JSON-/DOCX-Downloads, Auswahl/Suche, Missing-Code 0, Schulungsfilter, Score-Abwahl, Fehleranzeige und Berechtigungen bestanden.

Beide Host-Builds und Backend-Lint erfolgreich. Identischer gepackter 4.1.0-Tarball in beiden Hosts; SHA256: `dcee6cc39436baf91cf2558afedfbc202e044ca14dbf72c7bfdf4b381e5c0ccd`. Der Installationsvergleich über die echten Adapter besteht für 4.654 JSON-/DOCX-Exportpaare.

Microsoft Office Web Viewer / Word hat die tatsächlichen Browser-Downloads gerendert: alle drei vollständigen Seiten sind zwischen Studio und Kodierbox pixelgleich. Sechs Seiteninhalte mit/ohne Scores sind außerdem mit dem ursprünglichen Studio pixelgleich, abgesehen von der gesondert geprüften Fußzeile „IQB Codebook“. Die zusätzliche Editor-Matrix prüft 384 Formatkombinationen über ESM und CommonJS; alle 48 gültigen Markierungskombinationen wurden auch in Word gerendert. Insgesamt 1.206 Generator-Tests und 20 Office-Seiten. Desktop-Word und ein vollständiger Aspect-Editor-/Player-Lauf wurden nicht ausgeführt.

Vollständige Bedingungen, Belege, CI-Grenzen und bestehende Layoutgrenzen: [gemeinsames Abnahmeprotokoll](https://github.com/iqb-berlin/coding-components/blob/shared-codebook/docs/codebook-acceptance-2026-10-13.md). Die vollständigen Host-Suiten wurden für diesen Fix nicht erneut ausgeführt. Lokale Abnahme ist kein Merge-/Release-/Deployment-Nachweis.
