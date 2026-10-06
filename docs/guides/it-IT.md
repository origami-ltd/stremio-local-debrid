# Stremio Local Debrid — Italiano

Il computer scarica e conserva i torrent dei tuoi addon Stremio, poi trasmette il video alla TV sulla rete locale.

## Perché esiste

Una TV lenta può faticare a cercare peer, scaricare parti di torrent e riprodurre video contemporaneamente. Stremio Local Debrid sposta download e archiviazione sul computer. La TV riceve un flusso video HTTP sulla rete domestica. Controlli la tua cache senza un account debrid a pagamento nel cloud.

## Come funziona

Il server consulta gli addon installati, conserva i loro indirizzi configurati e converte hash, magnet e link .torrent in fonti Cache locale. Selezionandone una, il computer avvia il download e trasmette il file alla TV. I duplicati condividono la cache e i tracker vengono uniti. Link video diretti e servizi esterni non vengono convertiti.

## Requisiti

Servono Node.js 24 o successivo, spazio libero su disco e computer e TV raggiungibili nella stessa rete. Il rilevamento automatico dell’account supporta Stremio 5 per macOS. Linux e Windows usano un elenco manuale di addon. Android TV, Google TV e Fire TV sono i dispositivi principali; altri client possono richiedere HTTPS e codec compatibili.

## Configurare il server

Esegui npm run setup per generare config.json e configurare l'avvio su macOS, Linux o Windows. Su macOS, accedi a Stremio 5 con l'account della TV; su Linux/Windows, inserisci gli URL degli addon nell'assistente. --yes accetta i valori predefiniti, --no-service salva solo la configurazione e --lang sceglie la lingua. Token e download esistenti vengono conservati.

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

## Collegare la TV

Apri l’indirizzo salvato in state/status-url.txt. Scegli la lingua e premi Installa in Stremio oppure incolla l’indirizzo dell’addon nel campo di installazione. Sulla TV usa lo stesso account e aggiorna gli addon o riavvia Stremio. Apri un film o un episodio e scegli Cache locale. Le fonti originali continuano a usare il dispositivo che le apre. L’elenco dell’account si sincronizza ogni 60 secondi.

## Cache e riproduzione

I download continuano quando chiudi il lettore e riprendono dopo il riavvio del server. Viene scaricato solo il file selezionato. I valori iniziali sono 100 GiB di cache e 10 GiB di spazio libero riservato; i torrent completati meno usati vengono eliminati quando serve spazio. L’avvio dipende dai peer e dalla rete. Non c’è transcodifica: la TV decodifica il video. Mantieni il computer attivo e raggiungibile. Se cambia l’IP, aggiorna baseUrl e reinstalla l’addon.

## Privacy e licenza

L’URL contiene un token privato: non pubblicarlo in segnalazioni o schermate. Il rilevamento macOS legge il profilo esistente e invia la chiave di sessione solo all’API ufficiale Stremio, senza salvarne una copia. Gli URL configurati sono conservati privatamente. Non ci sono cataloghi multimediali né telemetria. I peer possono vedere l’IP del computer. Usa contenuti ai quali hai diritto di accedere. MIT-PoU richiede registrazione dell’utilizzo e attribuzione per i sistemi automatizzati.

[Origami · GitHub](https://github.com/origami-ltd/stremio-local-debrid) · [MIT-PoU](../../LICENSE.md)
