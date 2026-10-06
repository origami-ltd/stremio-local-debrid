# Stremio Local Debrid — Dansk

Computeren downloader og gemmer torrents fra dine Stremio-tilføjelser og streamer videoen til TV'et via dit lokale netværk.

## Hvorfor projektet findes

Et langsomt TV kan have svært ved at finde peers, downloade torrentdele og afspille video samtidig. Stremio Local Debrid flytter download og lagring til computeren. TV'et modtager HTTP-video over hjemmenetværket. Du styrer cachen uden en betalt cloud-debridkonto.

## Sådan virker det

Serveren henter kilder fra installerede tilføjelser og bevarer deres indstillinger. Torrenthashes, magnets og .torrent-links bliver Lokal cache-kilder. Valg af en kilde starter download på computeren og streamer den valgte fil til TV'et. Dubletter deler cache og trackers. Direkte videolinks og eksterne tjenester konverteres ikke.

## Krav

Brug Node.js 24 eller nyere, ledig diskplads og en computer og et TV, der kan nå hinanden på samme netværk. Automatisk kontoopdagelse understøtter Stremio 5 til macOS. Linux og Windows bruger en manuel liste over tilføjelser. Android TV, Google TV og Fire TV er de primære mål; andre klienter kan kræve HTTPS og kompatible codecs.

## Installer serveren

Kør npm run setup for at oprette config.json og konfigurere opstart på macOS, Linux eller Windows. Log ind i Stremio 5 på macOS med TV'ets konto; indtast addon-URL'er i guiden på Linux/Windows. --yes accepterer standardværdier, --no-service gemmer kun konfigurationen, og --lang vælger sprog. Eksisterende tokens og downloads bevares.

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

## Tilslut TV'et

Åbn adressen i state/status-url.txt, vælg sprog, og klik på Installer i Stremio eller indsæt tilføjelsens adresse i installationsfeltet. Brug samme konto på TV'et, og opdater tilføjelserne eller genstart Stremio. Vælg Lokal cache til filmen eller episoden. Oprindelige kilder bruger stadig den enhed, som åbner dem. Kontolisten synkroniseres hvert 60. sekund.

## Cache og afspilning

Downloads fortsætter efter afspillerens lukning og genoptages efter genstart. Kun den valgte fil downloades. Standard er 100 GiB cache og 10 GiB reserveret ledig plads; færdige, sjældent brugte torrents slettes, når der mangler plads. Første start afhænger af peers og netværket. Der er ingen transkodning; TV'et afkoder videoen. Hold computeren vågen og tilgængelig. Opdater baseUrl, og geninstaller tilføjelsen, hvis IP-adressen ændres.

## Privatliv og licens

URL'en indeholder et privat adgangstoken: offentliggør det ikke i fejlrapporter eller skærmbilleder. macOS læser den eksisterende profil og sender kun sessionsnøglen til Stremios officielle API uden at gemme en kopi. Konfigurerede adresser gemmes privat. Der er intet mediekatalog eller telemetri. Peers kan se computerens IP. Brug indhold, du har ret til. MIT-PoU kræver registrering af brug og kreditering for automatiserede systemer.

[Origami · GitHub](https://github.com/origami-ltd/stremio-local-debrid) · [MIT-PoU](../../LICENSE.md)
