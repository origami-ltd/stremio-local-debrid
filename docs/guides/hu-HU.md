# Stremio Local Debrid — Magyar

A számítógép letölti és tárolja a Stremio-bővítmények torrentjeit, majd a helyi hálózaton videót közvetít a tévének.

## Miért készült

Egy lassú tévé nehezen keres társakat, tölti le a torrentdarabokat és játssza le a videót egyszerre. A Stremio Local Debrid a számítógépre helyezi a letöltést és tárolást. A tévé HTTP-videót kap az otthoni hálózaton. Saját gyorsítótáradat kezeled fizetős felhős debrid-fiók nélkül.

## Működés

A kiszolgáló a telepített bővítményektől kér forrásokat, megtartva beállításaikat. Torrenthash-ek, magnetek és .torrent-hivatkozások Helyi gyorsítótár-forrássá válnak. A választás elindítja a letöltést a számítógépen és a kiválasztott fájl tévére továbbítását. A másolatok közös tárat és trackereket használnak. Közvetlen videólinkeket és külső szolgáltatásokat nem alakít át.

## Követelmények

Node.js 24 vagy újabb, szabad lemezterület és egymást elérő számítógép és tévé kell ugyanazon a hálózaton. Az automatikus fiókfelderítés a macOS Stremio 5-öt támogatja. Linux és Windows kézi bővítménylistát használ. Fő célok: Android TV, Google TV és Fire TV; más kliensek HTTPS-t és megfelelő kodekeket kérhetnek.

## Kiszolgáló telepítése

Futtassa az npm run setup parancsot a config.json létrehozásához és az indítás beállításához macOS, Linux vagy Windows rendszeren. macOS-en jelentkezzen be a Stremio 5-be a TV fiókjával; Linux/Windowson adja meg a bővítmények URL-jeit a varázslóban. A --yes elfogadja az alapértékeket, a --no-service csak a beállítást menti, a --lang pedig nyelvet választ. A meglévő tokenek és letöltések megmaradnak.

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

## Tévé csatlakoztatása

Nyisd meg a state/status-url.txt címét, válassz nyelvet és Telepítés a Stremióba lehetőséget, vagy illeszd be a címet a telepítési mezőbe. A tévén ugyanazt a fiókot használd, frissítsd a bővítményeket vagy indítsd újra a Stremiót. Filmnél vagy epizódnál válaszd a Helyi gyorsítótárat. Az eredeti források továbbra is az őket megnyitó eszközt használják. A fiók listája 60 másodpercenként szinkronizálódik.

## Gyorsítótár és lejátszás

A letöltések a lejátszó bezárása után folytatódnak és újraindítás után helyreállnak. Csak a kiválasztott fájl töltődik le. Alapérték: 100 GiB gyorsítótár és 10 GiB szabad hely tartalék. A kész, ritkán használt torrentek helyigény esetén törlődnek. Az indulás a társaktól és hálózattól függ. Nincs átkódolás: a tévé dekódolja a videót. Tartsd a számítógépet ébren és elérhetően. IP-változáskor módosítsd a baseUrl-t és telepítsd újra a bővítményt.

## Adatvédelem és licenc

A cím privát hozzáférési tokent tartalmaz: ne tedd közzé hibajegyekben vagy képernyőképeken. A macOS meglévő profilját olvassa, a munkamenetkulcsot csak a hivatalos Stremio API-nak küldi, másolat nélkül. A beállított URL-ek privát tárolásúak. Nincs médiakatalógus vagy telemetria. A társak láthatják a számítógép IP-jét. Jogosultan hozzáférhető tartalmat használj. A MIT-PoU automatizált rendszerektől használati nyilvántartást és forrásmegjelölést kér.

[Origami · GitHub](https://github.com/origami-ltd/stremio-local-debrid) · [MIT-PoU](../../LICENSE.md)
