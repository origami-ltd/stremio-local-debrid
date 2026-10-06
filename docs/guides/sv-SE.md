# Stremio Local Debrid — Svenska

Datorn laddar ner och sparar torrenter från dina Stremio-tillägg och strömmar videon till TV:n via det lokala nätverket.

## Varför projektet finns

En långsam TV kan ha svårt att hitta peers, ladda ner torrentdelar och spela video samtidigt. Stremio Local Debrid flyttar nedladdning och lagring till datorn. TV:n får HTTP-video via hemnätverket. Du styr din cache utan ett betalt debridkonto i molnet.

## Så fungerar det

Servern frågar installerade tillägg efter källor och behåller deras inställningar. Torrenthashar, magnets och .torrent-länkar blir Lokal cache-källor. När du väljer en källa laddar datorn ner och strömmar den valda filen till TV:n. Dubbletter delar cache och trackers. Direkta videolänkar och externa tjänster omvandlas inte.

## Krav

Du behöver Node.js 24 eller senare, ledigt diskutrymme och en dator och TV som når varandra i samma nätverk. Automatisk kontoupptäckt stöder Stremio 5 för macOS. Linux och Windows använder en manuell tilläggslista. Android TV, Google TV och Fire TV är huvudmålen; andra klienter kan kräva HTTPS och kompatibla kodekar.

## Installera servern

Logga in i Stremio 5 på macOS med TV:ns konto. Kör npm run setup på Linux eller Windows, lägg till konfigurerade manifestadresser i sources i config.json och sätt autoDiscoverAddons till false. Kör npm run install:service på alla tre systemen. Servern startas och aktiveras automatiskt vid inloggning via LaunchAgent, systemd eller Schemaläggaren. Stremio kan vara stängt.

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

## Anslut TV:n

Öppna adressen i state/status-url.txt, välj språk och klicka på Installera i Stremio eller klistra in tilläggsadressen i installationsfältet. Använd samma konto på TV:n och uppdatera tillägg eller starta om Stremio. Välj Lokal cache för en film eller ett avsnitt. Ursprungliga källor använder fortfarande enheten som öppnar dem. Kontots tillägg synkroniseras var 60:e sekund.

## Cache och uppspelning

Nedladdningar fortsätter när spelaren stängs och återupptas efter omstart. Bara vald fil laddas ner. Standard är 100 GiB cache och 10 GiB reserverat ledigt utrymme; färdiga, sällan använda torrenter raderas vid behov. Första starten beror på peers och nätverket. Ingen omkodning görs; TV:n avkodar videon. Håll datorn vaken och tillgänglig. Om IP-adressen ändras, uppdatera baseUrl och installera tillägget igen.

## Integritet och licens

Tilläggets URL innehåller en privat åtkomsttoken: publicera den inte i ärenden eller skärmbilder. macOS läser den befintliga profilen och skickar sessionsnyckeln endast till Stremios officiella API utan att spara en kopia. Konfigurerade adresser sparas privat. Ingen mediekatalog eller telemetri ingår. Peers kan se datorns IP. Använd innehåll du har rätt till. MIT-PoU kräver användningsregistrering och källangivelse för automatiserade system.

[Origami · GitHub](https://github.com/origami-ltd/stremio-local-debrid) · [MIT-PoU](../../LICENSE.md)
