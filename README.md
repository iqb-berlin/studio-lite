# Studio Lite

Mit dieser Web-Anwendung werden Aufgaben und einzelne Seiten für die Verwendung in einem [Verona](https://verona-interfaces.github.io)-kompatiblen Testsystem erstellt. Die Dokumentation dazu finden Sie [in diesem Wiki](https://github.com/iqb-berlin/iqb-berlin.github.io/wiki).

# Installation
Um dieses Autorensystem zu verwenden, muss es auf einem Server installiert sein. Die technische Basis hierfür ist [Docker](https://www.docker.com/). Für die Installationsprozedur (s. u.) setzen wir das Programm `Make` voraus, das also installiert sein muss. Sie können aber auch die Befehle für Docker manuell aufrufen.

## Account
Sie benötigen auf dem Server einen Account mit dem Recht, Docker auszuführen.

## Automatische Installation
Falls Sie eine HTTPS-Kommunikation des Webservers wünschen, halten Sie bitte eine Zertifikats- und eine Schlüsseldatei bereit.
Laden Sie die Skriptdatei `install.sh` in der gewünschten Version herunter (zu finden beim jeweiligen Release bzw. im Projektverzeichnis `scripts/`) und
starten Sie sie mit dem Befehl `bash install.sh` auf der Kommandozeile.
Folgen Sie danach den Anweisungen des Skripts.

Während der Installation wird u.a. eine Basiskonfiguration des Nginx-Webservers erzeugt.
Die Konfiguration erfolgt über die Konfigurationsdatei `default.conf.template`,
die Sie im Installationsverzeichnis unter dem Pfad `config/frontend` finden und nachträglich anpassen können.

## Automatische Updates
Um weiterentwickelte Software-Versionen zu installieren oder um zwischen HTTP- und HTTPS-Betrieb des Webservers zu wechseln,
rufen Sie bitte das Update-Skript aus dem Installationsverzeichnis mit `bash update.sh` auf.

## Manuelle Installation
### Basis-Installation
Legen Sie im Home-Verzeichnis ein Unterverzeichnis `studio` an.
Kopieren Sie folgende Dateien aus dem GitHub-Repository, in dem Sie gerade sind, in das Verzeichnis:

1. `docker-compose.yml` (zu finden im Projektwurzelverzeichnis)
2. `docker-compose.prod.yml` (zu finden im Projektwurzelverzeichnis)
3. `.env.prod.template` (zu finden im Projektwurzelverzeichnis)
4. `prod.mk` (zu finden im Projektverzeichnis unter `scripts/make/`)

Editieren Sie passgenau für Ihr System und zu Ihrer Sicherheit ggf. einige oder alle Umgebungsvariablen in der `.env.prod.template`-Datei und
benennen Sie die Datei danach in `.env.prod` um.
Ändern Sie bitte gleichfalls in der Datei `prod.mk` die Zeile `BASE_DIR := $(shell git rev-parse --show-toplevel)` zu `BASE_DIR := .` und
ändern Sie danach den Dateinamen von `prod.mk` zu `Makefile`.

Wenn Sie in der Datei `docker-compose.prod.yml` alle Frontend-Volumes (die letzten vier Zeilen der Datei) löschen, haben Sie nun bereits ein lauffähiges System und
könnten es im `studio`-Verzeichnis mit dem Befehl `make production-ramp-up` starten.

Wenn Sie die Frontend-Volumes nicht löschen, haben Sie die Möglichkeit,
den in einem Docker Container laufenden Nginx-Webserver von außerhalb des Containers zu konfigurieren.
Dies ist insbesondere dann notwendig, wenn der Webserver über HTTPS kommunizieren soll.

### Konfiguration des Web-Servers
Der in einem Docker Container laufende Nginx-Webserver wird bereits mit einer Basiskonfiguration für die Kommunikation mit HTTP ausgeliefert.
Sie finden die Konfigurationsdatei im Projektverzeichnis unter `/config/frontend/default.conf.http-template`.

Wenn Sie nichts an dieser Konfiguration ändern möchten, können Sie einfach die Frontend-Volumes in der `docker-compose.prod.yml`-Datei löschen,
wie unter [Basis-Installation](#Basis-Installation) beschrieben.

Wenn Sie jedoch HTTPS oder ihre eigene Konfiguration verwenden möchten, verändern Sie die Datei `docker-compose.prod.yml` bitte **nicht**.
Kopieren Sie stattdessen in Ihr `studio`-Verzeichnis folgende Dateien:
1. `https_on.sh` (zu finden im Projektverzeichnis unter `/scripts/`)
2. `https_off.sh` (zu finden im Projektverzeichnis unter `/scripts/`)

Legen Sie dann das Unterverzeichnis `config/frontend/tls` an und kopieren Sie in das Verzeichnis `config/frontend` die Dateien:

1. `default.conf.http-template` (zu finden im Projektverzeichnis unter `/config/frontend/`)
2. `default.conf.https-template` (zu finden im Projektverzeichnis unter `/config/frontend/`)

Wenn Sie HTTP verwenden möchten, rufen Sie bitte im `studio`-Verzeichnis `bash https_off.sh` auf, um eine funktionsfähige HTTP-Konfiguration zu erzeugen.

Falls Sie satt dessen HTTPS verwenden möchten, legen Sie Zertifikat und Schlüssel bitte in das Unterverzeichnis `config/frontend/tls`.
Benennen Sie Ihren Schlüssel in `studio.key` und Ihr Zertifikat in `studio.crt` um.
Rufen Sie dann im `studio`-Verzeichnis `bash https_on.sh` auf, um eine funktionsfähige HTTPS-Konfiguration für den Nginx-Webserver zu erhalten.

Die jeweils generierte Konfigurationsdatei finden Sie im `studio`-Verzeichnis unter `config/frontend/default.conf.template`.
Sie können sie nach Belieben weiter anpassen.
Bitte beachten Sie aber, dass bei einem Aufruf von `bash https_on.sh` oder von `bash https_off.sh` diese Datei überschrieben wird und
nur von der letzten Version eine Sicherheitskopie unter `config/frontend/default.conf.template.bkp` erzeugt wird.  

## Manuelle Updates
Wenn Sie Ihre Installation auf weiterentwickelte Softwareversionen aktualisieren möchten,
können Sie im einfachsten Fall die Umgebungsvariable `TAG` in Ihrer `.env.prod`-Datei auf `latest` setzen und
durch den Aufruf von `make production-ramp-up` während des laufenden Betriebs aktualisieren.
Diese Einstellung sollte aber nur unter größter Vorsicht verwendet werden,
da sie bei unvorhergesehenen Neustarts des Systems zu nicht gewünschten Updates führen kann.

Um Überraschungen zu vermeiden, wird für Umgebungsvariable `TAG` die Verwendung einer expliziten (Pre-)Release-Version empfohlen.
Wenn Sie ein Update wüschen, tragen Sie dort eine neuere Version ein.
Durch den Aufruf von `make production-ramp-up` wird das Update wirksam.

Die beiden oben beschrieben Verfahren greifen aber nur, wenn sich keine Änderungen an den Installationsdateien selbst ergeben haben oder
sich sogar die Struktur des Installationsverzeichnisses geändert hat (bpw. durch das Hinzukommen neuer Dateien oder Verzeichnisse).
Für diesen Fall bietet die Verwendung des automatischen Update-Skriptes `update.sh` mehr Sicherheit (siehe: [Automatische Updates](#Automatische Updates)),
dass Sie im Projektverzeichnis unter `scripts/` finden können.

## Aufruf `Make`
Wir haben eine Reihe von Make-Befehlen vorbereitet, die das Arbeiten mit Docker auf dem Server angenehmer machen. Diese befinden sich in der obigen vierten Datei. Um die Webanwendung zu installieren, geben Sie folgenden Befehl ein:

```
make production-ramp-up
```
Nachdem die Prozesse dieses Befehls beendet sind, ist die Datenbank eingerichtet und die Programmierung installiert. Ein Zugriff auf den Server über einen Browser sollte sofort möglich sein.

## Erste Schritte
Nach der Installation ist kein User-Account angelegt. Sie bekommen beim Aufruf der Webanwendung die Aufforderung, einen solchen Account anzulegen. Bitte notieren Sie sich die Daten, da dieser Account über besondere Rechte verfügt. Bitte nehmen Sie folgende globale Einstellungen vor:

1. Anlegen von Nutzern: Jede Person, die mit dem System Aufgaben entwickeln soll, benötigt einen Account.
2. Anlegen von Gruppen für Arbeitsbereiche und Zuweisen von Zugriffsrechten hierfür
3. Hochladen von Verona-Modulen - zumindest ein Editor- und ein Playermodul
4. Ändern von Texten: Startseite und Impressum/Datenschutz. Sie sind dazu verpflichtet, wenn Ihr Server öffentlich erreichbar ist.

Gehen Sie dann zur Startseite zurück (Klick auf das Logo links oben) und rufen Sie die Admin-Funktion einer Arbeitsbereichsgruppe auf (Zahnrad-Symbol neben dem Gruppennamen).

5. Fügen Sie einen Arbeitsbereich hinzu.
6. Weisen Sie vorhandenen Nutzern Zugriffsrechte dafür zu.

Jetzt (zurück zur Startseite) ist man in der Lage, einen Arbeitsbereich aufzurufen und Aufgaben zu definieren.

# Update/Anpassen
Achtung: Sorgen Sie vor einem Update stets für ein Backup (z. B. Snapshot-Funktion des Servers). Sie sollten das Zurückspielen eines Backups (sog. Restore) zumindest einmal erprobt haben, um auf diese Situation vorbereitet zu sein.

Die Steuerung der Installation erfolgt vor allem durch die Einstellungen der Datei `.env.prod`. Hier finden Sie z. B. die Ports, auf denen Frontend antwortet.

Für die Festlegung, welche Version installiert werden soll, ist in dieser Datei der Eintrag `TAG` verantwortlich. Bei der Erstinstallation ist hier `latest` eingetragen. Das bedeutet, dass die jeweils letzte stabile Version installiert wird. Man kann aber auch manuell eine andere Version eintragen. Darüber ist es möglich, eine Vorversion im Entwicklungsstadium (sog. Pre-release) festzulegen. Die Liste aller Releases finden Sie [hier](https://github.com/iqb-berlin/studio-lite/releases).

Für das Update ist dann erneut `make production-ramp-up` aufzurufen. Die vorhandenen Docker-Container werden gestoppt, neue Docker-Images eingespielt und dann wieder gestartet. Dieser Prozess sollte nicht länger als eine Minute dauern. Da die Daten nicht Teil der Container sind, sondern dauerhaft auf dem Server in speziellen Verzeichnissen gespeichert sind (z. B. die Datenbank), wird hierdurch nur die Programmierung ausgetauscht. Die Arbeit kann unmittelbar fortgesetzt werden.  

Achtung: Sollten bei einem Update Änderungen an der Datenbankstruktur nötig sein, erfolgt dies automatisch. Allerdings trifft dies nur zu, wenn Sie zu einer neueren Version wechseln. Wenn Sie eine ältere Programmierung als die aktuell installierte abrufen, kann die alte Datenbankstruktur eventuell nicht mehr hergestellt werden.
