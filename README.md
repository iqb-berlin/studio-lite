# Studio Lite

Mit dieser Web-Anwendung werden Aufgaben und einzelne Seiten für die Verwendung in einem [Verona](https://verona-interfaces.github.io)-kompatiblen Testsystem erstellt. Die Dokumentation dazu finden Sie [in diesem Wiki](https://github.com/iqb-berlin/iqb-berlin.github.io/wiki).

# Installation
Um dieses Autorensystem zu verwenden, muss es auf einem Server installiert sein. Die technische Basis hierfür ist [Docker](https://www.docker.com/). Für die Installationsprozedur (s. u.) setzen wir das Programm `Make` voraus, das also installiert sein muss. Sie können aber auch die Befehle für Docker manuell aufrufen.

## Account
Sie benötigen auf dem Server einen Account mit dem Recht, Docker auszuführen.

## Kopieren von Dateien
Legen Sie im Home-Verzeichnis ein Unterverzeichnis `studio` an. Kopieren Sie folgende Dateien aus dem GitHub-Repository, in dem Sie gerade sind, in das Verzeichnis:

1. `docker-compose.yml`
2. `docker-compose.prod.yml`
3. `.env.prod`
4. `prod.mk`

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
