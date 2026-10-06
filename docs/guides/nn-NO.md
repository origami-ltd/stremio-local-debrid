# Stremio Local Debrid — Norsk nynorsk

Datamaskina lastar ned og lagrar torrentar frå Stremio-tillegga dine og strøymer videoen til TV-en over lokalnettet.

## Kvifor prosjektet finst

Ein treg TV kan slite med å finne peers, laste ned torrentdelar og spele video samstundes. Stremio Local Debrid flyttar nedlasting og lagring til datamaskina. TV-en får HTTP-video over heimenettet. Du styrer mellomlagringa utan ein betalt debridkonto i skya.

## Slik fungerer det

Tenaren spør installerte tillegg om kjelder og tek vare på innstillingane deira. Torrenthashar, magnets og .torrent-lenkjer blir kjelder frå Lokal mellomlagring. Ei vald kjelde startar nedlasting på datamaskina og strøymer fila til TV-en. Duplikat deler mellomlager og trackarar. Direkte videolenkjer og eksterne tenester blir ikkje omforma.

## Krav

Bruk Node.js 24 eller nyare, ledig diskplass og ei datamaskin og ein TV som når kvarandre på same nettverk. Automatisk kontooppdaging støttar Stremio 5 for macOS. Linux og Windows brukar ei manuell tilleggsliste. Android TV, Google TV og Fire TV er hovudmåla; andre klientar kan krevje HTTPS og kompatible kodekar.

## Installer tenaren

Køyr npm run setup for å lage config.json og setje opp oppstart på macOS, Linux eller Windows. Logg inn i Stremio 5 på macOS med TV-kontoen; skriv tilleggsadressene i vegvisaren på Linux/Windows. --yes godtek standardverdiane, --no-service lagrar berre konfigurasjonen, og --lang vel språk. Eksisterande token og nedlastingar vert tekne vare på.

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

## Kople til TV-en

Opne adressa i state/status-url.txt, vel språk og klikk Installer i Stremio eller lim tilleggsadressa inn i installasjonsfeltet. Bruk same konto på TV-en og oppdater tillegg eller start Stremio på nytt. Vel Lokal mellomlagring for ein film eller episode. Originalkjelder brukar framleis eininga som opnar dei. Kontolista blir synkronisert kvart 60. sekund.

## Mellomlager og avspeling

Nedlastingar held fram når spelaren blir lukka og blir tekne opp att etter omstart. Berre vald fil blir lasta ned. Standard er 100 GiB mellomlager og 10 GiB reservert ledig plass; ferdige, lite brukte torrentar blir sletta ved behov. Første start avheng av peers og nettet. Inga transkoding blir utført; TV-en dekodar videoen. Hald datamaskina vaken og tilgjengeleg. Endrar IP-adressa seg, oppdater baseUrl og installer tillegget på nytt.

## Personvern og lisens

Tilleggsadressa har eit privat tilgangstoken: ikkje publiser det i saker eller skjermbilete. macOS les den eksisterande profilen og sender øktnøkkelen berre til Stremio sitt offisielle API utan å lagre ein kopi. Konfigurerte adresser blir lagra privat. Ingen mediekatalog eller telemetri er inkludert. Peers kan sjå IP-en til datamaskina. Bruk innhald du har rett til. MIT-PoU krev bruksregistrering og kjeldetilvising for automatiserte system.

[Origami · GitHub](https://github.com/origami-ltd/stremio-local-debrid) · [MIT-PoU](../../LICENSE.md)
