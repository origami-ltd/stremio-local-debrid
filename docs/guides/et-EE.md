# Stremio Local Debrid — Eesti

Arvuti laadib alla ja salvestab sinu Stremio lisade torrentid ning edastab video telerisse kohaliku võrgu kaudu.

## Miks projekt olemas on

Aeglasel teleril võib olla raske korraga partnereid otsida, torrenti osi alla laadida ja videot esitada. Stremio Local Debrid viib allalaadimise ja salvestamise arvutisse. Teler saab HTTP-video koduvõrgu kaudu. Haldad oma vahemälu ilma tasulise pilve-debrid-kontota.

## Kuidas see töötab

Server küsib allikaid paigaldatud lisadelt ja säilitab nende seadistused. Torrenti räsid, magnetid ja .torrent-lingid muutuvad Kohaliku vahemälu allikateks. Allika valimine käivitab arvutis allalaadimise ja saadab valitud faili telerisse. Duplikaadid jagavad vahemälu ja jälgijaid. Otseseid videolinke ja väliseid teenuseid ei teisendata.

## Nõuded

Vaja on Node.js 24 või uuemat, vaba kettaruumi ning samas võrgus teineteist kättesaadavaid arvutit ja telerit. Konto automaatne tuvastus toetab macOS-i Stremio 5. Linux ja Windows kasutavad käsitsi määratud lisade loendit. Peamised sihtseadmed on Android TV, Google TV ja Fire TV; muud kliendid võivad vajada HTTPS-i ja sobivaid koodekeid.

## Serveri paigaldamine

Käivita npm run setup, et luua config.json ja seadistada käivitumine macOS-is, Linuxis või Windowsis. macOS-is logi Stremio 5-sse TV kontoga; Linuxis/Windowsis sisesta lisade URL-id viisardis. --yes nõustub vaikeväärtustega, --no-service salvestab ainult seadistuse ja --lang valib keele. Olemasolevad tokenid ja allalaadimised säilivad.

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

## Teleri ühendamine

Ava state/status-url.txt-s salvestatud aadress, vali keel ja klõpsa Paigalda Stremiosse või kleebi lisa aadress paigaldusväljale. Kasuta teleris sama kontot ning värskenda lisasid või taaskäivita Stremio. Vali filmi või episoodi jaoks Kohalik vahemälu. Algsed allikad kasutavad endiselt neid avavat seadet. Konto lisasid sünkroonitakse iga 60 sekundi järel.

## Vahemälu ja esitamine

Allalaadimised jätkuvad pärast pleieri sulgemist ja taastuvad serveri taaskäivitamisel. Alla laaditakse ainult valitud fail. Vaikimisi on vahemälu 100 GiB ja vaba ruumi reserv 10 GiB; valmis, harva kasutatud torrentid eemaldatakse ruumivajadusel. Käivitumine sõltub partneritest ja võrgust. Ümberkodeerimist pole: teler dekodeerib video. Hoia arvuti ärkvel ja kättesaadav. IP muutumisel uuenda baseUrl ja paigalda lisa uuesti.

## Privaatsus ja litsents

Lisa URL sisaldab privaatset pääsutokenit: ära avalda seda probleemides või kuvatõmmistes. macOS loeb olemasolevat profiili ja saadab seansivõtme ainult Stremio ametlikule API-le, koopiat salvestamata. Seadistatud aadresse hoitakse privaatselt. Meediakataloogi ega telemeetriat pole. Partnerid võivad näha arvuti IP-d. Kasuta sisu, millele sul on õigus. MIT-PoU nõuab automatiseeritud süsteemidelt kasutuse registreerimist ja viitamist.

[Origami · GitHub](https://github.com/origami-ltd/stremio-local-debrid) · [MIT-PoU](../../LICENSE.md)
