# Stremio Local Debrid — Català

L'ordinador baixa i desa els torrents dels teus complements de Stremio i transmet el vídeo al televisor per la xarxa local.

## Per què existeix

Un televisor lent pot tenir dificultats per trobar peers, baixar peces de torrents i reproduir vídeo alhora. Stremio Local Debrid trasllada la baixada i l'emmagatzematge a l'ordinador. El televisor rep vídeo HTTP per la xarxa de casa. Controles la teva memòria cau sense un compte de debrid de pagament al núvol.

## Com funciona

El servidor demana fonts als complements instal·lats i manté la seva configuració. Hashes, magnets i enllaços .torrent es converteixen en fonts de memòria cau local. Escollir-ne una inicia la baixada a l'ordinador i transmet el fitxer triat al televisor. Els duplicats comparteixen cau i trackers. Els enllaços directes de vídeo i serveis externs no es converteixen.

## Requisits

Cal Node.js 24 o posterior, espai lliure i un ordinador i televisor accessibles a la mateixa xarxa. La descoberta automàtica del compte funciona amb Stremio 5 per a macOS. Linux i Windows fan servir una llista manual de complements. Android TV, Google TV i Fire TV són els dispositius principals; altres clients poden requerir HTTPS i còdecs compatibles.

## Instal·lar el servidor

Executeu npm run setup per generar config.json i configurar l'inici a macOS, Linux o Windows. A macOS, inicieu sessió a Stremio 5 amb el compte de la TV; a Linux/Windows, introduïu els URL dels complements a l'assistent. --yes accepta els valors predeterminats, --no-service només desa la configuració i --lang tria l'idioma. Es conserven els tokens i les baixades existents.

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

## Connectar el televisor

Obre l'adreça de state/status-url.txt, tria l'idioma i Instal·la a Stremio, o enganxa l'adreça al camp d'instal·lació. Fes servir el mateix compte al televisor i actualitza els complements o reinicia Stremio. Tria Memòria cau local per al film o episodi. Les fonts originals encara fan servir el dispositiu que les obre. La llista del compte se sincronitza cada 60 segons.

## Cau i reproducció

Les baixades continuen en tancar el reproductor i es reprenen després de reiniciar el servidor. Només es baixa el fitxer triat. Per defecte hi ha 100 GiB de cau i 10 GiB lliures reservats; els torrents complets menys usats s'eliminen quan falta espai. L'inici depèn dels peers i la xarxa. No hi ha transcodificació: el televisor descodifica el vídeo. Mantén l'ordinador despert i accessible. Si canvia la IP, actualitza baseUrl i reinstal·la el complement.

## Privadesa i llicència

L'adreça conté un token privat: no el publiquis en incidències ni captures. A macOS es llegeix el perfil existent i la clau de sessió només s'envia a l'API oficial de Stremio, sense desar-ne una còpia. Els URL configurats es guarden de forma privada. No hi ha catàleg de mitjans ni telemetria. Els peers poden veure la IP de l'ordinador. Fes servir contingut al qual tens dret d'accés. MIT-PoU exigeix registre d'ús i atribució per als sistemes automatitzats.

[Origami · GitHub](https://github.com/origami-ltd/stremio-local-debrid) · [MIT-PoU](../../LICENSE.md)
