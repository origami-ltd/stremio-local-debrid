# Stremio Local Debrid — Deutsch

Dein Computer lädt Torrents aus deinen Stremio-Addons herunter, speichert sie und streamt das Video über dein lokales Netzwerk zum Fernseher.

## Warum es dieses Projekt gibt

Ein langsamer Fernseher kann beim gleichzeitigen Finden von Peers, Herunterladen von Torrent-Teilen und Abspielen von Videos überfordert sein. Stremio Local Debrid verlagert Download und Speicherung auf deinen Computer. Der Fernseher empfängt einen HTTP-Videostream im Heimnetz. Du verwaltest deinen Cache ohne kostenpflichtiges Cloud-Debrid-Konto.

## So funktioniert es

Der Server fragt installierte Addons ab, behält ihre konfigurierten Adressen bei und wandelt Hashes, Magnets und .torrent-Links in Quellen des lokalen Caches um. Die Auswahl startet den Download auf dem Computer und streamt die Datei zum Fernseher. Doppelte Dateien teilen sich den Cache und ihre Tracker werden zusammengeführt. Direkte Videolinks und externe Dienste werden nicht umgewandelt.

## Voraussetzungen

Du brauchst Node.js 24 oder neuer, freien Speicher und einen Computer sowie Fernseher, die sich im selben Netzwerk erreichen können. Die automatische Kontenerkennung unterstützt Stremio 5 für macOS. Linux und Windows nutzen eine manuelle Addon-Liste. Android TV, Google TV und Fire TV sind die Hauptziele; andere Clients können HTTPS und passende Codecs benötigen.

## Server einrichten

Führe npm run setup aus, um config.json zu erstellen und den Start unter macOS, Linux oder Windows einzurichten. Melde Stremio 5 unter macOS mit dem TV-Konto an; gib unter Linux/Windows die Addon-URLs im Assistenten ein. --yes übernimmt die Vorgaben, --no-service speichert nur die Konfiguration und --lang wählt die Sprache. Vorhandene Tokens und Downloads bleiben erhalten.

```sh
git clone https://github.com/origami-ltd/stremio-local-debrid.git
cd stremio-local-debrid
npm ci
npm run setup
```

```sh
npm run setup -- --no-service
npm start
```

## Fernseher verbinden

Öffne die Adresse aus state/status-url.txt. Wähle die Sprache und In Stremio installieren oder füge die Addon-Adresse im Installationsfeld ein. Verwende am Fernseher dasselbe Konto und aktualisiere die Addons oder starte Stremio neu. Öffne einen Film oder eine Folge und wähle Lokaler Cache. Originalquellen nutzen weiterhin das Gerät, das sie öffnet. Kontoänderungen werden alle 60 Sekunden synchronisiert.

## Cache und Wiedergabe

Downloads laufen nach dem Schließen des Players weiter und werden nach einem Serverneustart fortgesetzt. Nur die ausgewählte Datei wird geladen. Standard sind 100 GiB Cache und 10 GiB freier Speicher als Reserve; abgeschlossene, selten genutzte Torrents werden bei Platzbedarf entfernt. Der erste Start hängt von Peers und Netzwerk ab. Es gibt keine Transkodierung: Der Fernseher decodiert das Video. Halte den Computer wach und erreichbar. Ändert sich die IP, passe baseUrl an und installiere das Addon erneut.

## Datenschutz und Lizenz

Die URL enthält ein privates Zugriffstoken: Veröffentliche es nicht in Issues oder Screenshots. Die macOS-Erkennung liest das vorhandene Profil und sendet den Sitzungsschlüssel nur an die offizielle Stremio-API, ohne ihn zusätzlich zu speichern. Konfigurierte URLs werden privat gespeichert. Es gibt keinen Medienkatalog und keine Telemetrie. Peers sehen die IP des Computers. Nutze Inhalte, auf die du zugreifen darfst. MIT-PoU verlangt Nutzungsnachweise und Quellenangaben für automatisierte Systeme.

[Origami · GitHub](https://github.com/origami-ltd/stremio-local-debrid) · [MIT-PoU](../../LICENSE.md)
