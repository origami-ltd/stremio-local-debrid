# Stremio Local Debrid — Esperanto

Via komputilo elŝutas kaj konservas torentojn de viaj Stremio-aldonaĵoj kaj fluigas la videon al via televidilo tra la loka reto.

## Kial ĝi ekzistas

Malrapida televidilo povas malfacile serĉi kunulojn, elŝuti torentajn pecojn kaj ludi videon samtempe. Stremio Local Debrid transdonas elŝuton kaj konservadon al la komputilo. La televidilo ricevas HTTP-videon tra la hejma reto. Vi regas vian kaŝmemoron sen pagita nuba debrid-konto.

## Kiel ĝi funkcias

La servilo petas fontojn de instalitaj aldonaĵoj kaj konservas iliajn agordojn. Torentaj haketoj, magnetoj kaj .torrent-ligiloj fariĝas fontoj Loka kaŝmemoro. Elekto komencas elŝuton sur la komputilo kaj fluigas la elektitan dosieron al la televidilo. Duplikatoj dividas kaŝmemoron kaj spurilojn. Rektaj videoligiloj kaj eksteraj servoj ne estas konvertataj.

## Postuloj

Uzu Node.js 24 aŭ pli novan, liberan diskospacon kaj komputilon kaj televidilon atingeblajn en la sama reto. Aŭtomata kontodetekto subtenas Stremio 5 por macOS. Linux kaj Windows uzas permane agorditan aldonaĵliston. Android TV, Google TV kaj Fire TV estas la ĉefaj celoj; aliaj klientoj povas postuli HTTPS kaj kongruajn kodekojn.

## Instali la servilon

En macOS ensalutu al Stremio 5 per la televidila konto. En Linux aŭ Windows rulu npm run setup, aldonu agorditajn manifestajn URL-ojn al sources en config.json kaj agordu autoDiscoverAddons al false. Rulu npm run install:service en ĉiuj tri sistemoj. La servilo ekfunkcias kaj aŭtomate lanĉiĝas ĉe ensaluto per LaunchAgent, systemd aŭ Taskplanilo. Stremio povas resti fermita.

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

## Konekti la televidilon

Malfermu la adreson en state/status-url.txt, elektu lingvon kaj klaku Instali en Stremio aŭ algluu la aldonaĵadreson en la instalkampon. Uzu la saman konton en la televidilo kaj ĝisdatigu aldonaĵojn aŭ restartigu Stremio. Elektu Loka kaŝmemoro por filmo aŭ epizodo. Originalaj fontoj plu uzas la aparaton kiu malfermas ilin. La kontolisto sinkroniĝas ĉiun 60-an sekundon.

## Kaŝmemoro kaj ludado

Elŝutoj daŭras post fermo de la ludilo kaj rekomenciĝas post servila restarto. Nur la elektita dosiero estas elŝutata. Defaŭlte estas 100 GiB da kaŝmemoro kaj 10 GiB da rezervita libera spaco; finitaj, malofte uzataj torentoj estas forigitaj laŭ bezono. La unua ekstarto dependas de kunuloj kaj la reto. Ne estas transkodado: la televidilo malkodas la videon. Tenu la komputilon veka kaj atingebla. Se la IP ŝanĝiĝas, ĝisdatigu baseUrl kaj reinstalu la aldonaĵon.

## Privateco kaj permesilo

La aldonaĵa URL enhavas privatan alirĵetonon: ne publikigu ĝin en problemoj aŭ ekrankopioj. macOS legas la ekzistantan profilon kaj sendas la seancan ŝlosilon nur al la oficiala Stremio-API sen konservi kopion. Agorditaj adresoj estas konservataj private. Ne estas amaskomunikila katalogo aŭ telemetrio. Kunuloj povas vidi la komputilan IP. Uzu enhavon kiun vi rajtas aliri. MIT-PoU postulas uzoregistradon kaj fontomencion por aŭtomataj sistemoj.

[Origami · GitHub](https://github.com/origami-ltd/stremio-local-debrid) · [MIT-PoU](../../LICENSE.md)
