# Stremio Local Debrid — Čeština

Počítač stahuje a ukládá torrenty z vašich doplňků Stremio a přenáší video do televize přes místní síť.

## Proč projekt vznikl

Pomalá televize může mít potíže současně hledat peery, stahovat části torrentů a přehrávat video. Stremio Local Debrid přesouvá stahování a ukládání na počítač. Televize dostává HTTP video přes domácí síť. Mezipaměť ovládáte sami bez placeného cloudového účtu debrid.

## Jak to funguje

Server žádá nainstalované doplňky o zdroje a zachovává jejich nastavení. Hashe, magnety a odkazy .torrent se mění na zdroje Místní mezipaměť. Výběr spustí stahování na počítači a přenos zvoleného souboru do televize. Duplicity sdílejí mezipaměť a trackery. Přímé odkazy na video a externí služby se nepřevádějí.

## Požadavky

Použijte Node.js 24 nebo novější, volné místo na disku a počítač a televizi dostupné ve stejné síti. Automatické zjištění účtu podporuje Stremio 5 pro macOS. Linux a Windows používají ruční seznam doplňků. Hlavní cíle jsou Android TV, Google TV a Fire TV; jiné klienty mohou vyžadovat HTTPS a kompatibilní kodeky.

## Instalace serveru

V macOS se přihlaste do Stremio 5 účtem televize. V Linuxu nebo Windows spusťte npm run setup, přidejte nastavené adresy manifestů do sources v config.json a nastavte autoDiscoverAddons na false. Na všech třech systémech spusťte npm run install:service. Server se spustí a nastaví automatický start při přihlášení přes LaunchAgent, systemd nebo Plánovač úloh. Stremio může zůstat zavřené.

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

## Připojení televize

Otevřete adresu z state/status-url.txt, vyberte jazyk a Nainstalovat do Stremio nebo vložte adresu doplňku do instalačního pole. V televizi použijte stejný účet a obnovte doplňky nebo restartujte Stremio. U filmu či epizody zvolte Místní mezipaměť. Původní zdroje stále používají zařízení, které je otevře. Seznam účtu se synchronizuje každých 60 sekund.

## Mezipaměť a přehrávání

Stahování pokračuje po zavření přehrávače a obnoví se po restartu serveru. Stahuje se jen vybraný soubor. Výchozí limit je 100 GiB a rezerva 10 GiB volného místa; hotové, málo používané torrenty se podle potřeby mažou. Začátek závisí na peerech a síti. Video se nepřekóduje; dekóduje ho televize. Udržujte počítač vzhůru a dostupný. Při změně IP upravte baseUrl a doplněk znovu nainstalujte.

## Soukromí a licence

Adresa doplňku obsahuje soukromý token: nezveřejňujte ho v hlášeních ani snímcích. macOS čte existující profil a posílá klíč relace pouze oficiálnímu API Stremio bez ukládání kopie. Nastavené adresy se ukládají soukromě. Projekt nemá katalog médií ani telemetrii. Peeři mohou vidět IP počítače. Používejte obsah, ke kterému máte právo. MIT-PoU vyžaduje u automatických systémů záznam použití a uvedení zdroje.

[Origami · GitHub](https://github.com/origami-ltd/stremio-local-debrid) · [MIT-PoU](../../LICENSE.md)
