# Stremio Local Debrid — Slovenčina

Počítač sťahuje a ukladá torrenty z vašich doplnkov Stremio a prenáša video do televízora cez lokálnu sieť.

## Prečo projekt vznikol

Pomalý televízor môže mať problém zároveň hľadať peerov, sťahovať časti torrentu a prehrávať video. Stremio Local Debrid presúva sťahovanie a ukladanie do počítača. Televízor dostáva HTTP video cez domácu sieť. Pamäť ovládate sami bez plateného cloudového účtu debrid.

## Ako funguje

Server žiada nainštalované doplnky o zdroje a zachováva ich nastavenia. Hashe, magnety a odkazy .torrent sa menia na zdroje lokálnej pamäte. Výber spustí sťahovanie na počítači a prenos vybraného súboru do televízora. Duplicity zdieľajú pamäť a trackery. Priame video odkazy a externé služby sa nekonvertujú.

## Požiadavky

Použite Node.js 24 alebo novší, voľné miesto na disku a počítač a televízor dostupné v rovnakej sieti. Automatické zistenie účtu podporuje Stremio 5 pre macOS. Linux a Windows používajú ručný zoznam doplnkov. Hlavné zariadenia sú Android TV, Google TV a Fire TV; iné klienty môžu vyžadovať HTTPS a kompatibilné kodeky.

## Inštalácia servera

Spustite npm run setup na vytvorenie config.json a nastavenie spúšťania v macOS, Linuxe alebo Windows. V macOS sa prihláste do Stremio 5 účtom TV; v Linuxe/Windows zadajte URL doplnkov v sprievodcovi. --yes prijme predvolené hodnoty, --no-service iba uloží konfiguráciu a --lang zvolí jazyk. Existujúce tokeny a stiahnuté súbory zostávajú zachované.

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

## Pripojenie televízora

Otvorte adresu zo state/status-url.txt, vyberte jazyk a Nainštalovať do Stremio alebo vložte adresu doplnku do inštalačného poľa. V televízore použite rovnaký účet a obnovte doplnky alebo reštartujte Stremio. Pri filme či epizóde vyberte lokálnu pamäť. Pôvodné zdroje stále používajú zariadenie, ktoré ich otvorí. Zoznam účtu sa synchronizuje každých 60 sekúnd.

## Pamäť a prehrávanie

Sťahovanie pokračuje po zatvorení prehrávača a obnoví sa po reštarte servera. Sťahuje sa len vybraný súbor. Predvolený limit je 100 GiB a rezerva 10 GiB voľného miesta; dokončené, málo používané torrenty sa podľa potreby mažú. Začiatok závisí od peerov a siete. Nie je tu transkódovanie: video dekóduje televízor. Udržujte počítač bdelý a dostupný. Po zmene IP upravte baseUrl a doplnok znovu nainštalujte.

## Súkromie a licencia

Adresa doplnku obsahuje súkromný token: nezverejňujte ho v hláseniach ani snímkach. macOS číta existujúci profil a posiela kľúč relácie len oficiálnemu API Stremio bez uloženia kópie. Nastavené adresy sa ukladajú súkromne. Projekt nemá katalóg médií ani telemetriu. Peeri môžu vidieť IP počítača. Používajte obsah, na ktorý máte právo. MIT-PoU vyžaduje pri automatizovaných systémoch záznam použitia a uvedenie zdroja.

[Origami · GitHub](https://github.com/origami-ltd/stremio-local-debrid) · [MIT-PoU](../../LICENSE.md)
