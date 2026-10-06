# Stremio Local Debrid — Lietuvių

Kompiuteris atsisiunčia ir saugo jūsų Stremio priedų torrentus, tada vietiniu tinklu siunčia vaizdo įrašą į televizorių.

## Kodėl šis projektas sukurtas

Lėtam televizoriui gali būti sunku vienu metu rasti tinklo dalyvius, atsisiųsti torrento dalis ir rodyti vaizdą. Stremio Local Debrid perkelia atsisiuntimą ir saugojimą į kompiuterį. Televizorius gauna HTTP vaizdą namų tinklu. Valdote savo talpyklą be mokamos debesijos debrid paskyros.

## Kaip tai veikia

Serveris prašo šaltinių iš įdiegtų priedų ir išlaiko jų nuostatas. Torrento maišos, magnet ir .torrent nuorodos tampa Vietinės talpyklos šaltiniais. Pasirinkus šaltinį kompiuteris pradeda atsisiuntimą ir siunčia pasirinktą failą televizoriui. Dublikatai dalijasi talpykla ir sekikliais. Tiesioginės vaizdo nuorodos ir išorinės paslaugos nekeičiamos.

## Reikalavimai

Reikia Node.js 24 ar naujesnės versijos, laisvos vietos diske bei tame pačiame tinkle pasiekiamų kompiuterio ir televizoriaus. Automatinis paskyros aptikimas veikia su Stremio 5 macOS sistemoje. Linux ir Windows naudoja rankinį priedų sąrašą. Pagrindiniai įrenginiai: Android TV, Google TV ir Fire TV; kitiems klientams gali reikėti HTTPS ir suderinamų kodekų.

## Serverio diegimas

Paleiskite npm run setup, kad sukurtumėte config.json ir nustatytumėte paleidimą macOS, Linux arba Windows. macOS prisijunkite prie Stremio 5 TV paskyra; Linux/Windows vedlyje įveskite priedų URL. --yes priima numatytąsias reikšmes, --no-service tik išsaugo konfigūraciją, o --lang pasirenka kalbą. Esami prieigos raktai ir atsisiuntimai išsaugomi.

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

## Televizoriaus prijungimas

Atverkite state/status-url.txt adresą, pasirinkite kalbą ir Įdiegti į Stremio arba įklijuokite priedo adresą į diegimo lauką. Televizoriuje naudokite tą pačią paskyrą ir atnaujinkite priedus arba paleiskite Stremio iš naujo. Filmui ar serijai pasirinkite Vietinę talpyklą. Pradiniai šaltiniai vis dar naudoja juos atveriantį įrenginį. Paskyros sąrašas sinchronizuojamas kas 60 sekundžių.

## Talpykla ir peržiūra

Atsisiuntimai tęsiasi uždarius grotuvą ir atnaujinami po serverio paleidimo iš naujo. Atsisiunčiamas tik pasirinktas failas. Numatytos vertės: 100 GiB talpykla ir 10 GiB laisvos vietos rezervas; užbaigti, retai naudojami torrentai šalinami prireikus vietos. Pradžia priklauso nuo dalyvių ir tinklo. Vaizdas neperkoduojamas, jį dekoduoja televizorius. Laikykite kompiuterį budrų ir pasiekiamą. Pasikeitus IP atnaujinkite baseUrl ir įdiekite priedą iš naujo.

## Privatumas ir licencija

Adrese yra privatus prieigos raktas: neviešinkite jo problemų pranešimuose ar ekrano kopijose. macOS skaito esamą profilį ir siunčia seanso raktą tik oficialiai Stremio API, nesaugodamas kopijos. Priedų adresai saugomi privačiai. Nėra medijos katalogo ar telemetrijos. Tinklo dalyviai gali matyti kompiuterio IP. Naudokite turinį, kurį galite teisėtai pasiekti. MIT-PoU automatizuotoms sistemoms reikalauja naudojimo registravimo ir šaltinio nurodymo.

[Origami · GitHub](https://github.com/origami-ltd/stremio-local-debrid) · [MIT-PoU](../../LICENSE.md)
