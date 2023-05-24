# Studio Lite

Mit dieser Web-Anwendung werden Aufgaben und einzelne Seiten für die Verwendung in einem [Verona](https://verona-interfaces.github.io)-kompatiblen Testsystem erstellt. Die Dokumentation dazu finden Sie [in diesem Wiki](https://github.com/iqb-berlin/iqb-berlin.github.io/wiki).

# Installation
Um dieses Autorensystem zu verwenden, muss es auf einem Server installiert sein. Die technische Basis hierfür ist [Docker](https://www.docker.com/). Für die Installationsprozedur (s. u.) setzen wir das Programm `Make` voraus, das also installiert sein muss. Sie können aber auch die Befehle für Docker manuell aufrufen.

## Account
Sie benötigen auf dem Server einen Account mit dem Recht, Docker auszuführen.

## Automatische Installation
Falls Sie eine HTTPS-Kommunikation des Webservers wünschen, halten Sie bitte eine Zertifikats- und eine Schlüsseldatei bereit.

Laden Sie bitte die Skriptdatei `install.sh` in der gewünschten Version herunter (zu finden beim jeweiligen Release bzw. im Projektverzeichnis `scripts/`) und
starten Sie sie mit dem Befehl `bash install.sh` auf der Kommandozeile.
Folgen Sie danach den Anweisungen des Skripts.

Während der Installation wird u.a. ein Egde-Router konfiguriert, der alle Anfragen an Anwendung entgegennimmt und an die passenden Stellen weiterleitet.
Die Kommunikation wird von ihm automatisch von HTTP auf HTTPS umgeleitet.
Falls Sie eine Zertifikats- und Schlüsseldatei besitzen, legen Sie in diese bitte im Verzeichnis `secrets/traefik` ab.
Benennen Sie dann den Schlüssel in `studio-lite.key` und das Zertifikat in `studio-lite.crt` um.
Wenn Sie diese Dateien nicht besitzen sollten oder sie ungültig (geworden) sind,
verwendet der Edge-Router ein selbst signiertes Zertifikat,
das zu einer **Sicherheitswarnung** in Ihrem Browser führen könnte.

Des Weiteren wird für Auslieferung der HTTP-Seiten die Basiskonfiguration eines Nginx-Webservers erzeugt.
Die Konfiguration des Web-Servers erfolgt über die Konfigurationsdatei `default.conf.template`,
die Sie im Installationsverzeichnis unter dem Pfad `config/frontend` finden und nachträglich anpassen können.

## Automatische Updates
Um weiterentwickelte Software-Versionen zu installieren,
ein abgelaufenes selbst-signiertes TLS-Zertifikat zu erneuern
oder die Login-Daten des Edge-Routers zu ändern,
rufen Sie bitte das Update-Skript aus dem Installationsverzeichnis mit `bash update_studio-lite.sh` auf.

## Starten und Stoppen der Anwendung mit  `make`
Zur Steuerung der Anwendungslandschaft haben eine Reihe von Make-Befehlen vorbereitet,
die das Arbeiten mit Docker auf dem Server angenehmer machen.
Sie befinden sich in der Datei `Makefile`.
Der Aufruf eines Befehls erfolgt im Installationsverzeichnis der Anwendung mit `make <cmd>`,
wobei jedes 'cmd' mit dem Präfix 'studio-lite-' beginnt.

Um die Webanwendung hochzufahren, geben Sie folgenden Befehl ein:
```
make studio-lite-up
```

Nachdem die Prozesse dieses Befehls beendet sind,
ist die Datenbank eingerichtet und die Programmierung installiert.
Ein Zugriff auf den Server über einen Browser sollte dann sofort möglich sein.

Falls Sie die aktuellen Log-Informationen der Anwendungslandschaft einsehen möchten,
führen Sie folgenden Befehl aus:
````
make studio-lite-logs
````

Und wenn die Webanwendung vollständig herunterzufahren und alle alten Docker Container zu löschen möchten,
verwenden Sie bitte:

````
make studio-lite-down
````

Nun haben Sie die drei wichtigsten Befehle der Anwendungssteuerung kennengelernt.
Alle weiteren Befehle, mit kurzen Erläuterungen finden Sie im `Makefile`.

# Erste Schritte
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
Achtung: Sorgen Sie vor einem Update stets für ein Backup (z. B. Snapshot-Funktion des Servers).
Sie sollten das Zurückspielen eines Backups (sog. Restore) zumindest einmal erprobt haben, um auf diese Situation vorbereitet zu sein.

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
