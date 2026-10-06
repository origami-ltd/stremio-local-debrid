# Stremio Local Debrid — Italiano

Il computer scarica e conserva i torrent dei tuoi addon Stremio, poi trasmette il video alla TV sulla rete locale.

## Perché esiste

Una TV lenta può faticare a cercare peer, scaricare parti di torrent e riprodurre video contemporaneamente. Stremio Local Debrid sposta download e archiviazione sul computer. La TV riceve un flusso video HTTP sulla rete domestica. Controlli la tua cache senza un account debrid a pagamento nel cloud.

## Come funziona

Il server consulta gli addon installati, conserva i loro indirizzi configurati e converte hash, magnet e link .torrent in fonti Cache locale. Selezionandone una, il computer avvia il download e trasmette il file alla TV. I duplicati condividono la cache e i tracker vengono uniti. Link video diretti e servizi esterni non vengono convertiti.

## Requisiti

Servono Node.js 24 o successivo, spazio libero su disco e computer e TV raggiungibili nella stessa rete. Il rilevamento automatico dell’account supporta Stremio 5 per macOS. Linux e Windows usano un elenco manuale di addon. Android TV, Google TV e Fire TV sono i dispositivi principali; altri client possono richiedere HTTPS e codec compatibili.

## Configurare il server

Su macOS accedi a Stremio 5 con l’account della TV. Su Linux o Windows esegui npm run setup, aggiungi gli URL configurati dei manifest a sources in config.json e imposta autoDiscoverAddons su false. Esegui npm run install:service su tutti e tre i sistemi. L’installer avvia il server e configura l’avvio automatico all’accesso con LaunchAgent, systemd o Utilità di pianificazione. Stremio può rimanere chiuso.

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

## Collegare la TV

Apri l’indirizzo salvato in state/status-url.txt. Scegli la lingua e premi Installa in Stremio oppure incolla l’indirizzo dell’addon nel campo di installazione. Sulla TV usa lo stesso account e aggiorna gli addon o riavvia Stremio. Apri un film o un episodio e scegli Cache locale. Le fonti originali continuano a usare il dispositivo che le apre. L’elenco dell’account si sincronizza ogni 60 secondi.

## Cache e riproduzione

I download continuano quando chiudi il lettore e riprendono dopo il riavvio del server. Viene scaricato solo il file selezionato. I valori iniziali sono 100 GiB di cache e 10 GiB di spazio libero riservato; i torrent completati meno usati vengono eliminati quando serve spazio. L’avvio dipende dai peer e dalla rete. Non c’è transcodifica: la TV decodifica il video. Mantieni il computer attivo e raggiungibile. Se cambia l’IP, aggiorna baseUrl e reinstalla l’addon.

## Privacy e licenza

L’URL contiene un token privato: non pubblicarlo in segnalazioni o schermate. Il rilevamento macOS legge il profilo esistente e invia la chiave di sessione solo all’API ufficiale Stremio, senza salvarne una copia. Gli URL configurati sono conservati privatamente. Non ci sono cataloghi multimediali né telemetria. I peer possono vedere l’IP del computer. Usa contenuti ai quali hai diritto di accedere. MIT-PoU richiede registrazione dell’utilizzo e attribuzione per i sistemi automatizzati.

[Origami · GitHub](https://github.com/origami-ltd/stremio-local-debrid) · [MIT-PoU](../../LICENSE.md)
