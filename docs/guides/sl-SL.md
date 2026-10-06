# Stremio Local Debrid — Slovenščina

Računalnik prenaša in shranjuje torrente iz vaših dodatkov Stremio ter po lokalnem omrežju pošilja video televizorju.

## Zakaj obstaja

Počasen televizor lahko težko hkrati išče vrstnike, prenaša dele torrentov in predvaja video. Stremio Local Debrid prenese prenašanje in shranjevanje na računalnik. Televizor prejema HTTP video po domačem omrežju. Upravljate svoj predpomnilnik brez plačanega računa debrid v oblaku.

## Kako deluje

Strežnik zahteva vire od nameščenih dodatkov in ohrani njihove nastavitve. Hashi, magneti in povezave .torrent postanejo viri lokalnega predpomnilnika. Izbira zažene prenos na računalniku in pošilja izbrano datoteko televizorju. Dvojniki si delijo predpomnilnik in sledilnike. Neposredne video povezave in zunanje storitve se ne pretvarjajo.

## Zahteve

Potrebujete Node.js 24 ali novejši, prosti prostor ter računalnik in televizor, ki sta dosegljiva v istem omrežju. Samodejno odkrivanje računa podpira Stremio 5 za macOS. Linux in Windows uporabljata ročni seznam dodatkov. Glavne naprave so Android TV, Google TV in Fire TV; drugi odjemalci lahko zahtevajo HTTPS in združljive kodeke.

## Namestitev strežnika

V macOS se prijavite v Stremio 5 z računom televizorja. V Linuxu ali Windows zaženite npm run setup, dodajte nastavljene naslove manifestov v sources v config.json in nastavite autoDiscoverAddons na false. V vseh treh sistemih zaženite npm run install:service. Strežnik se zažene in samodejno starta ob prijavi prek LaunchAgenta, systemd ali razporejevalnika opravil. Stremio je lahko zaprt.

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

## Povezava televizorja

Odprite naslov iz state/status-url.txt, izberite jezik in Namesti v Stremio ali prilepite naslov v namestitveno polje. Na televizorju uporabite isti račun ter osvežite dodatke ali ponovno zaženite Stremio. Za film ali epizodo izberite Lokalni predpomnilnik. Izvirni viri še vedno uporabljajo napravo, ki jih odpre. Seznam računa se sinhronizira vsakih 60 sekund.

## Predpomnilnik in predvajanje

Prenosi se nadaljujejo po zaprtju predvajalnika in obnovijo po ponovnem zagonu strežnika. Prenese se samo izbrana datoteka. Privzeto je 100 GiB predpomnilnika in 10 GiB rezerviranega prostega prostora; končani, redko uporabljeni torrenti se po potrebi izbrišejo. Začetek je odvisen od vrstnikov in omrežja. Prekodiranja ni: televizor dekodira video. Računalnik naj ostane buden in dosegljiv. Ob spremembi IP posodobite baseUrl in znova namestite dodatek.

## Zasebnost in licenca

Naslov vsebuje zasebni žeton: ne objavljajte ga v prijavah ali posnetkih zaslona. macOS bere obstoječi profil in pošlje ključ seje samo uradnemu API-ju Stremio, ne da bi shranil kopijo. Nastavljeni naslovi so shranjeni zasebno. Ni medijskega kataloga ali telemetrije. Vrstniki lahko vidijo IP računalnika. Uporabljajte vsebino, do katere imate pravico. MIT-PoU zahteva beleženje uporabe in navedbo vira za avtomatizirane sisteme.

[Origami · GitHub](https://github.com/origami-ltd/stremio-local-debrid) · [MIT-PoU](../../LICENSE.md)
