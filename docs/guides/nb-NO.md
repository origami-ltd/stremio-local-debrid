# Stremio Local Debrid — Norsk bokmål

Datamaskinen laster ned og lagrer torrenter fra Stremio-tilleggene dine og strømmer videoen til TV-en over lokalnettet.

## Hvorfor prosjektet finnes

En treg TV kan slite med å finne peers, laste ned torrentdeler og spille video samtidig. Stremio Local Debrid flytter nedlasting og lagring til datamaskinen. TV-en mottar HTTP-video over hjemmenettet. Du styrer hurtigbufferen uten en betalt debridkonto i skyen.

## Slik fungerer det

Serveren ber installerte tillegg om kilder og bevarer innstillingene deres. Torrenthasher, magnets og .torrent-lenker blir kilder fra Lokal hurtigbuffer. En valgt kilde starter nedlasting på datamaskinen og strømmer filen til TV-en. Duplikater deler buffer og trackere. Direkte videolenker og eksterne tjenester konverteres ikke.

## Krav

Bruk Node.js 24 eller nyere, ledig diskplass og en datamaskin og TV som når hverandre på samme nettverk. Automatisk kontooppdagelse støtter Stremio 5 for macOS. Linux og Windows bruker en manuell tilleggsliste. Android TV, Google TV og Fire TV er hovedmålene; andre klienter kan kreve HTTPS og kompatible kodeker.

## Installer serveren

Logg inn i Stremio 5 på macOS med TV-kontoen. Kjør npm run setup på Linux eller Windows, legg konfigurerte manifestadresser til sources i config.json og sett autoDiscoverAddons til false. Kjør npm run install:service på alle tre systemer. Serveren starter og settes til automatisk oppstart ved innlogging via LaunchAgent, systemd eller Oppgaveplanlegging. Stremio kan være lukket.

```sh
git clone https://github.com/origami-ltd/stremio-local-debrid.git
cd stremio-local-debrid
npm ci
npm run install:service
```

```sh
npm run setup
npm start
```

## Koble til TV-en

Åpne adressen i state/status-url.txt, velg språk og klikk Installer i Stremio eller lim tilleggsadressen inn i installasjonsfeltet. Bruk samme konto på TV-en og oppdater tillegg eller start Stremio på nytt. Velg Lokal hurtigbuffer for en film eller episode. Originalkilder bruker fortsatt enheten som åpner dem. Kontolisten synkroniseres hvert 60. sekund.

## Buffer og avspilling

Nedlastinger fortsetter når spilleren lukkes og gjenopptas etter omstart. Bare valgt fil lastes ned. Standard er 100 GiB hurtigbuffer og 10 GiB reservert ledig plass; ferdige, lite brukte torrenter slettes ved behov. Første start avhenger av peers og nettverket. Ingen transkoding utføres; TV-en dekoder videoen. Hold datamaskinen våken og tilgjengelig. Endres IP-adressen, oppdater baseUrl og installer tillegget på nytt.

## Personvern og lisens

Tilleggsadressen inneholder et privat tilgangstoken: ikke publiser det i saker eller skjermbilder. macOS leser den eksisterende profilen og sender øktnøkkelen bare til Stremios offisielle API uten å lagre en kopi. Konfigurerte adresser lagres privat. Ingen mediekatalog eller telemetri inngår. Peers kan se datamaskinens IP. Bruk innhold du har rett til. MIT-PoU krever bruksregistrering og kildeangivelse for automatiserte systemer.

[Origami · GitHub](https://github.com/origami-ltd/stremio-local-debrid) · [MIT-PoU](../../LICENSE.md)
