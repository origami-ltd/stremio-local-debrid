# Stremio Local Debrid — Română

Calculatorul descarcă și păstrează torrentele din addonurile Stremio și transmite videoclipul către televizor prin rețeaua locală.

## De ce există

Un televizor lent poate avea dificultăți când caută peers, descarcă fragmente de torrent și redă video simultan. Stremio Local Debrid mută descărcarea și stocarea pe calculator. Televizorul primește video HTTP prin rețeaua de acasă. Controlezi propriul cache fără cont de debrid plătit în cloud.

## Cum funcționează

Serverul cere surse de la addonurile instalate și păstrează configurările lor. Hashurile, magneții și linkurile .torrent devin surse Cache local. Alegerea unei surse pornește descărcarea pe calculator și transmite fișierul selectat către TV. Duplicatele împart cache-ul și trackerele. Linkurile video directe și serviciile externe nu sunt convertite.

## Cerințe

Ai nevoie de Node.js 24 sau mai nou, spațiu liber și un calculator și televizor accesibile în aceeași rețea. Detectarea automată a contului acceptă Stremio 5 pentru macOS. Linux și Windows folosesc o listă manuală de addonuri. Android TV, Google TV și Fire TV sunt țintele principale; alți clienți pot necesita HTTPS și codecuri compatibile.

## Instalarea serverului

Pe macOS autentifică-te în Stremio 5 cu contul televizorului. Pe Linux sau Windows rulează npm run setup, adaugă URL-urile configurate ale manifestelor în sources din config.json și setează autoDiscoverAddons la false. Rulează npm run install:service pe toate cele trei sisteme. Serverul pornește și este înregistrat pentru pornire automată la autentificare prin LaunchAgent, systemd sau Task Scheduler. Stremio poate rămâne închis.

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

## Conectarea televizorului

Deschide adresa din state/status-url.txt, alege limba și Instalează în Stremio sau lipește adresa addonului în câmpul de instalare. Folosește același cont pe TV și actualizează addonurile sau repornește Stremio. Alege Cache local pentru film sau episod. Sursele originale folosesc în continuare dispozitivul care le deschide. Lista contului se sincronizează la fiecare 60 de secunde.

## Cache și redare

Descărcările continuă după închiderea playerului și se reiau după repornirea serverului. Este descărcat doar fișierul selectat. Implicit sunt 100 GiB de cache și 10 GiB de spațiu liber rezervat; torrentele complete rar utilizate sunt șterse când este nevoie de spațiu. Pornirea depinde de peers și rețea. Nu există transcodare: televizorul decodează video. Menține calculatorul activ și accesibil. Dacă IP-ul se schimbă, actualizează baseUrl și reinstalează addonul.

## Confidențialitate și licență

Adresa conține un token privat: nu îl publica în rapoarte sau capturi. macOS citește profilul existent și trimite cheia de sesiune doar API-ului oficial Stremio fără a salva o copie. Adresele configurate sunt păstrate privat. Nu există catalog media sau telemetrie. Peers pot vedea IP-ul calculatorului. Folosește conținut la care ai drept de acces. MIT-PoU cere înregistrarea utilizării și atribuirea sursei pentru sisteme automatizate.

[Origami · GitHub](https://github.com/origami-ltd/stremio-local-debrid) · [MIT-PoU](../../LICENSE.md)
