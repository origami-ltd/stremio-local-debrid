# Stremio Local Debrid — Nederlands

Je computer downloadt en bewaart torrents van je Stremio-addons en streamt de video via je lokale netwerk naar de tv.

## Waarom dit bestaat

Een trage tv kan moeite hebben met peers zoeken, torrentdelen downloaden en video afspelen tegelijk. Stremio Local Debrid laat je computer downloaden en opslaan. De tv ontvangt HTTP-video via je thuisnetwerk. Je beheert je eigen cache zonder betaald cloud-debridaccount.

## Hoe het werkt

De server vraagt geïnstalleerde addons om bronnen en behoudt hun instellingen. Torrenthashes, magnets en .torrent-links worden Lokale cache-bronnen. Een bron kiezen start de download op de computer en streamt het gekozen bestand naar de tv. Duplicaten delen cache en trackers. Directe videolinks en externe diensten worden niet omgezet.

## Vereisten

Gebruik Node.js 24 of nieuwer, voldoende schijfruimte en een computer en tv die elkaar op hetzelfde netwerk kunnen bereiken. Automatische accountdetectie werkt met Stremio 5 voor macOS. Linux en Windows gebruiken een handmatige addonlijst. Android TV, Google TV en Fire TV zijn de voornaamste doelen; andere clients kunnen HTTPS en geschikte codecs vereisen.

## Server installeren

Voer npm run setup uit om config.json te maken en opstarten in macOS, Linux of Windows in te stellen. Meld Stremio 5 op macOS aan met het TV-account; voer op Linux/Windows de addon-URL's in de wizard in. --yes accepteert de standaardwaarden, --no-service slaat alleen de configuratie op en --lang kiest de taal. Bestaande tokens en downloads blijven behouden.

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

## Tv verbinden

Open het adres uit state/status-url.txt, kies een taal en klik op Installeren in Stremio of plak het addon-adres in het installatieveld. Gebruik hetzelfde account op de tv; vernieuw addons of herstart Stremio. Kies bij een film of aflevering Lokale cache. Originele bronnen gebruiken nog steeds het apparaat waarop je ze opent. Accountaddons worden elke 60 seconden gesynchroniseerd.

## Cache en afspelen

Downloads gaan door na het sluiten van de speler en hervatten na een herstart. Alleen het gekozen bestand wordt gedownload. Standaard is er 100 GiB cache met 10 GiB vrije ruimte als reserve. Voltooide, weinig gebruikte torrents worden verwijderd wanneer ruimte nodig is. De eerste start hangt af van peers en netwerk. Er is geen transcodering; de tv decodeert video. Houd de computer wakker en bereikbaar. Werk bij een nieuw IP baseUrl bij en installeer de addon opnieuw.

## Privacy en licentie

Het addon-adres bevat een privé-token: publiceer het niet in issues of screenshots. Op macOS wordt het bestaande profiel gelezen en de sessiesleutel alleen naar de officiële Stremio-API gestuurd, zonder extra kopie. Geconfigureerde URL's worden privé bewaard. Er is geen mediacatalogus of telemetrie. Peers kunnen het computer-IP zien. Gebruik toegestane inhoud. MIT-PoU vereist gebruiksregistratie en bronvermelding voor geautomatiseerde systemen.

[Origami · GitHub](https://github.com/origami-ltd/stremio-local-debrid) · [MIT-PoU](../../LICENSE.md)
