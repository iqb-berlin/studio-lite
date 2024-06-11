![GitHub Release (latest SemVer)](https://img.shields.io/github/v/release/iqb-berlin/studio-lite)
[![pipeline status](https://scm.cms.hu-berlin.de/iqb/studio-lite/badges/main/pipeline.svg)](https://scm.cms.hu-berlin.de/iqb/studio-lite/-/commits/main)

# Studio Lite

Mit dieser Web-Anwendung werden Aufgaben und einzelne Seiten für die Verwendung in einem [Verona](https://verona-interfaces.github.io)-kompatiblen
Testsystem erstellt.
Die Dokumentation dazu finden Sie [in diesem Wiki](https://github.com/iqb-berlin/iqb-berlin.github.io/wiki).

# Installation
Um dieses Autorensystem zu verwenden, muss es auf einem Server installiert sein.
Die technische Basis hierfür ist [Docker](https://www.docker.com/).
Die Installation, Aktualisierung und Bedienung des Servers kann durch die Ansteuerung sogenannter Make-Targets erfolgen,
die die dazu notwendigen Docker-Befehle kapseln.
Dies setzt das Programm `Make` voraus, das zuvor ebenfalls installiert sein sollte.
Sie können aber auch alle Befehle für Docker manuell aufrufen.

## Account
Sie benötigen auf dem Server einen Account mit dem Recht, Docker auszuführen.

## Automatische Installation
Laden Sie bitte die Skript-Datei `install.sh` in der gewünschten Version herunter
(zu finden beim jeweiligen Release bzw. im Projektverzeichnis `scripts/`) und
starten Sie sie mit dem Befehl `bash install.sh` auf der Kommandozeile.
Folgen Sie danach den Anweisungen des Skripts.

Zu Beginn der Installation wird u.a. geprüft, ob bereits IQB-Infrastruktur auf dem Server installiert wurde.
Falls dies noch nicht geschehen sein sollte empfehlen wir diese zu installieren. Sie enthält den Edge-Router
[Traefik](https://traefik.io/), der alle Anfragen an Anwendung entgegennimmt und an die passenden Stellen weiterleitet,
und die Monitoring-Dienste [Prometheus](https://prometheus.io/) und [Grafana](https://grafana.com/) zur Überwachung der
Anwendung.
Studio-Lite wurde für die Verwendung dieser Infrastruktur vorkonfiguriert. Die Install- und Update-Skripte führen alle
notwendigen Konfigurationsschritte automatisch durch.
Studio-Lite kann aber auch ohne die IQB-Infrastruktur verwendet werden. Es müssen dann weitere Konfigurationsschritte,
die das Routing oder die Freigabe von Ports betreffen manuell in den Docker-Compose-Dateien und der Konfigurationsdatei
`default.conf.template` des Nginx-Servers, die Sie im Installationsverzeichnis unter dem Pfad `config/frontend` finden,
vorgenommen werden.

Die IQB-Infrastruktur sorgt auch dafür das eingehende HTTP-Anfragen automatisch auf HTTPS umgeleitet werden.
Falls Sie eine Zertifikats- und Schlüsseldatei besitzen,
legen Sie in diese bitte im Installationsverzeichnis der IQB-Infrastruktur unter `secrets/traefik` ab.
Benennen Sie dann den Schlüssel in `privkey.pem` und das Zertifikat in `certificate.pem` um.
Sollten Sie kein Zertifikat besitzen, kann mithilfe der Install- und Update-Skripte ein selbst-signiertes Zertifikat
erzeugt werden.
Sollte ein Zertifikat ungültig (geworden) sein, stellt Traefik automatisch ein neues selbst-signierte Zertifikat bereit.
Bitte beachten Sie hierbei, dass selbst-signierte Zertifikate nur eine Notlösung sind und höchstwahrscheinlich zu einer
**Sicherheitswarnung** in Ihrem Browser führen werden.

## Automatische Updates
Um weiterentwickelte Software-Versionen von Studio-Lite oder der IQB-Infrastruktur zu installieren,
ein abgelaufenes selbst-signiertes TLS-Zertifikat zu erneuern
oder die Login-Daten für die Infrastruktur zu ändern,
rufen Sie bitte das Update-Skript aus dem Installationsverzeichnis mit `make studio-lite-update` auf.

## Starten und Stoppen der Anwendung mit  `make`
Zur Steuerung der Anwendungslandschaft existieren eine Reihe von Make-Targets,
die das Arbeiten mit Docker auf dem Server angenehmer machen.
Sie befinden sich im Verzeichnis `scripts` in Dateien mit dem Typ 'mk' und
werden in Datei `Makefile` des Anwendungsverzeichnisses gebündelt.
Die Ansteuerung eines Make-Targets erfolgt im Installationsverzeichnis der Anwendung mit `make <cmd>`,
wobei jedes 'cmd' bzgl. der IQB-Infrastruktur mit dem Präfix 'traefik-' beginnt und
alle 'cmd' bzgl. der Studio-Lite-Anwendung mit 'studio-lite-' anfangen.

Um die Studio-Lite-Webanwendung hochzufahren, starten Sie zunächst die IQB-Infrastruktur,
falls dies noch nicht geschehen sein sollte, mit
```
make traefik-up
```
und geben Sie danach folgenden Befehl zum Hochfahren der Webanwendung ein:
```
make studio-lite-up
```

Nachdem die Prozesse dieser Befehle beendet sind, ist der Edge-Router und das Monitoring aktiv, die Studio-Lite
Datenbank eingerichtet, das Studio-Lite API und Web-Site ansprechbar.
Ein Zugriff auf den Server über einen Browser sollte dann sofort möglich sein.

Falls Sie die aktuellen Log-Informationen der Anwendungslandschaft einsehen möchten,
führen Sie folgenden Befehl aus:
````
make studio-lite-logs
````

Und wenn Sie die Webanwendung vollständig herunterzufahren und alle alten Docker Container der Anwendung löschen möchten,
verwenden Sie bitte*:

````
make studio-lite-down
````
_(*) die IQB-Infrastruktur-Container brauchen in der Regel nicht gestoppt zu werden und können auch für weitere
Anwendungen außer dem Studio-Lite verwendet werden._

Nun haben Sie die drei wichtigsten Befehle der Anwendungssteuerung kennengelernt.
Alle weiteren Befehle, mit kurzen Erläuterungen finden Sie in den im `Makefile` inkludierten 'MK'-Dateien.

# Erste Schritte
Nach der Installation ist kein User-Account angelegt. Sie bekommen beim Aufruf der Webanwendung die Aufforderung,
einen solchen Account anzulegen.
Bitte notieren Sie sich die Daten, da dieser Account über besondere Rechte verfügt.
Bitte nehmen Sie folgende globale Einstellungen vor:

1. Anlegen von Nutzern: Jede Person, die mit dem System Aufgaben entwickeln soll, benötigt einen Account.
2. Anlegen von Gruppen für Arbeitsbereiche und Zuweisen von Zugriffsrechten hierfür
3. Hochladen von Verona-Modulen - zumindest ein Editor- und ein Playermodul
4. Ändern von Texten: Startseite und Impressum/Datenschutz.
Sie sind dazu verpflichtet, wenn Ihr Server öffentlich erreichbar ist.

Gehen Sie dann zur Startseite zurück (Klick auf das Logo links oben) und
rufen Sie die Admin-Funktion einer Arbeitsbereichsgruppe auf (Zahnrad-Symbol neben dem Gruppennamen).

5. Fügen Sie einen Arbeitsbereich hinzu.
6. Weisen Sie vorhandenen Nutzern Zugriffsrechte dafür zu.

Jetzt (zurück zur Startseite) ist man in der Lage, einen Arbeitsbereich aufzurufen und Aufgaben zu definieren.

# Update/Anpassen
Achtung: Sorgen Sie vor einem Update stets für ein Backup (z. B. Snapshot-Funktion des Servers).
Sie sollten das Zurückspielen eines Backups (sog. Restore) zumindest einmal erprobt haben,
um auf diese Situation vorbereitet zu sein.

Die Steuerung der Installation erfolgt vor allem durch die Einstellungen der Datei `.env.studio-lite`.
Hier finden Sie z.B. den Servernamen oder die Ports, mit denen das Frontend arbeitet.

Für die Festlegung, welche Version installiert werden soll, ist in dieser Datei der Eintrag `TAG` verantwortlich.
Bei der Erstinstallation ist hier `latest` eingetragen.
Das bedeutet, dass die jeweils letzte stabile Version installiert wird.
Man kann aber auch manuell eine andere Version eintragen.
Darüber ist es möglich, eine Vorversion im Entwicklungsstadium (sog. Pre-release) festzulegen.
Die Liste aller Releases finden Sie [hier](https://github.com/iqb-berlin/studio-lite/releases).

Für das Update ist dann erneut `make studio-lite-up` aufzurufen.
Die vorhandenen Docker-Container werden gestoppt,
neue Docker-Images eingespielt und dann wieder gestartet.
Dieser Prozess sollte nicht länger als eine Minute dauern.
Da die Daten nicht Teil der Container sind,
sondern dauerhaft auf dem Server in speziellen Verzeichnissen gespeichert sind (z.B. die Datenbank),
wird hierdurch nur die Programmierung ausgetauscht.
Die Arbeit kann unmittelbar fortgesetzt werden.

**Achtung:** Sollten bei einem Update Änderungen an der Datenbankstruktur nötig sein,
erfolgt dies automatisch.
Allerdings trifft dies nur zu, wenn Sie zu einer neueren Version wechseln.
Wenn Sie eine ältere Programmierung als die aktuell installierte abrufen,
kann die alte Datenbankstruktur eventuell nicht mehr hergestellt werden.
