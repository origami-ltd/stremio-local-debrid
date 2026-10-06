# Stremio Local Debrid — Hrvatski

Računalo preuzima i pohranjuje torrente iz vaših Stremio dodataka te šalje video televizoru preko lokalne mreže.

## Zašto postoji

Spor televizor može teško istodobno tražiti peerove, preuzimati dijelove torrenta i reproducirati video. Stremio Local Debrid premješta preuzimanje i pohranu na računalo. Televizor prima HTTP video preko kućne mreže. Upravljate vlastitom predmemorijom bez plaćenog debrid računa u oblaku.

## Kako radi

Poslužitelj traži izvore od instaliranih dodataka i čuva njihove postavke. Hashovi, magneti i .torrent poveznice postaju izvori lokalne predmemorije. Odabir pokreće preuzimanje na računalu i prijenos odabrane datoteke televizoru. Duplikati dijele predmemoriju i trackere. Izravne video poveznice i vanjske usluge ne pretvaraju se.

## Zahtjevi

Potrebni su Node.js 24 ili noviji, slobodan prostor te računalo i televizor dostupni u istoj mreži. Automatsko otkrivanje računa podržava Stremio 5 za macOS. Linux i Windows koriste ručni popis dodataka. Glavni uređaji su Android TV, Google TV i Fire TV; drugi klijenti mogu zahtijevati HTTPS i kompatibilne kodeke.

## Instalacija poslužitelja

Pokrenite npm run setup za izradu config.json i postavljanje pokretanja na macOS-u, Linuxu ili Windowsu. Na macOS-u prijavite se u Stremio 5 računom TV-a; na Linuxu/Windowsu unesite URL-ove dodataka u čarobnjaku. --yes prihvaća zadane vrijednosti, --no-service samo sprema konfiguraciju, a --lang bira jezik. Postojeći tokeni i preuzimanja ostaju sačuvani.

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

## Povezivanje televizora

Otvorite adresu iz state/status-url.txt, odaberite jezik i Instaliraj u Stremio ili zalijepite adresu dodatka u polje za instalaciju. Koristite isti račun na televizoru te osvježite dodatke ili ponovno pokrenite Stremio. Za film ili epizodu odaberite Lokalna predmemorija. Izvorni izvori i dalje koriste uređaj koji ih otvara. Popis računa sinkronizira se svakih 60 sekundi.

## Predmemorija i reprodukcija

Preuzimanja se nastavljaju nakon zatvaranja reproduktora i obnavljaju nakon ponovnog pokretanja poslužitelja. Preuzima se samo odabrana datoteka. Zadano je 100 GiB predmemorije i 10 GiB rezerviranog slobodnog prostora; završeni, rijetko korišteni torrenti brišu se po potrebi. Početak ovisi o peerovima i mreži. Nema transkodiranja: televizor dekodira video. Držite računalo budnim i dostupnim. Ako se IP promijeni, ažurirajte baseUrl i ponovno instalirajte dodatak.

## Privatnost i licenca

Adresa sadrži privatni token: ne objavljujte ga u prijavama ili snimkama zaslona. macOS čita postojeći profil i šalje ključ sesije samo službenom Stremio API-ju bez pohrane kopije. Konfigurirane adrese pohranjuju se privatno. Nema medijskog kataloga ni telemetrije. Peerovi mogu vidjeti IP računala. Koristite sadržaj kojem smijete pristupiti. MIT-PoU zahtijeva bilježenje uporabe i navođenje izvora za automatizirane sustave.

[Origami · GitHub](https://github.com/origami-ltd/stremio-local-debrid) · [MIT-PoU](../../LICENSE.md)
