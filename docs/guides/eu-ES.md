# Stremio Local Debrid — Euskara

Ordenagailuak zure Stremio gehigarrien torrentak deskargatu eta gordetzen ditu, eta bideoa telebistara bidaltzen du sare lokalaren bidez.

## Zergatik sortu den

Telebista motel batek zailtasunak izan ditzake pareak bilatzeko, torrent zatiak deskargatzeko eta bideoa aldi berean erreproduzitzeko. Stremio Local Debrid-ek deskarga eta biltegiratzea ordenagailura eramaten ditu. Telebistak HTTP bideoa jasotzen du etxeko sarean. Zure cachea kudeatzen duzu, hodeiko debrid kontu ordaindurik gabe.

## Nola dabil

Zerbitzariak instalatutako gehigarriei iturriak eskatzen dizkie eta haien konfigurazioa mantentzen du. Hashak, magnet estekak eta .torrent estekak Cache lokala iturri bihurtzen dira. Bat hautatzeak deskarga hasten du ordenagailuan eta hautatutako fitxategia telebistara bidaltzen du. Bikoiztuek cachea eta tracker-ak partekatzen dituzte. Bideo-esteka zuzenak eta kanpoko zerbitzuak ez dira bihurtzen.

## Eskakizunak

Node.js 24 edo berriagoa, diskoan leku librea eta sare berean elkarri iristeko gai diren ordenagailua eta telebista behar dira. Kontuaren detekzio automatikoak macOS-erako Stremio 5 onartzen du. Linux eta Windows-ek eskuzko gehigarri-zerrenda erabiltzen dute. Helburu nagusiak Android TV, Google TV eta Fire TV dira; beste bezeroek HTTPS eta codec bateragarriak eska ditzakete.

## Zerbitzaria instalatu

Exekutatu npm run setup config.json sortzeko eta macOS, Linux edo Windowsen abioa konfiguratzeko. macOSen, hasi saioa Stremio 5en telebistako kontuarekin; Linux/Windowsen, sartu gehigarrien URLak morroian. --yes aukerak lehenetsiak onartzen ditu, --no-service aukerak konfigurazioa bakarrik gordetzen du eta --lang aukerak hizkuntza hautatzen du. Dauden tokenak eta deskargak mantentzen dira.

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

## Telebista konektatu

Ireki state/status-url.txt-ko helbidea, hautatu hizkuntza eta Instalatu Stremion, edo itsatsi helbidea instalazio-eremuan. Erabili kontu bera telebistan eta eguneratu gehigarriak edo berrabiarazi Stremio. Filma edo atala irekitzean hautatu Cache lokala. Jatorrizko iturriek irekitzen dituen gailua erabiltzen jarraitzen dute. Kontuaren zerrenda 60 segundoan behin sinkronizatzen da.

## Cachea eta erreprodukzioa

Deskargek erreproduzitzailea itxi ondoren jarraitzen dute eta zerbitzaria berrabiaraztean berrekiten dira. Hautatutako fitxategia soilik deskargatzen da. Lehenetsita 100 GiB cache eta 10 GiB leku libre erreserbatua daude; amaitutako eta gutxi erabilitako torrentak ezabatzen dira leku behar denean. Hasiera pareen eta sarearen araberakoa da. Ez dago transkodetzerik: telebistak bideoa deskodetzen du. Mantendu ordenagailua esna eta erabilgarri. IPa aldatzen bada, eguneratu baseUrl eta berrinstalatu gehigarria.

## Pribatutasuna eta lizentzia

Helbideak sarbide-token pribatua dauka: ez argitaratu arazoetan edo pantaila-argazkietan. macOS-ek lehendik dagoen profila irakurtzen du eta saio-gakoa Stremioren API ofizialera soilik bidaltzen du, kopiarik gorde gabe. Konfiguratutako helbideak pribatuki gordetzen dira. Ez dago media-katalogorik edo telemetriarik. Pareek ordenagailuaren IPa ikus dezakete. Erabili atzitzeko eskubidea duzun edukia. MIT-PoU-k erabilera-erregistroa eta iturriaren aipamena eskatzen dizkie sistema automatizatuei.

[Origami · GitHub](https://github.com/origami-ltd/stremio-local-debrid) · [MIT-PoU](../../LICENSE.md)
