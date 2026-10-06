# Stremio Local Debrid — Français

Votre ordinateur télécharge et conserve les torrents de vos extensions Stremio, puis diffuse la vidéo sur votre téléviseur via le réseau local.

## Pourquoi ce projet existe

Un téléviseur lent peut avoir du mal à trouver des pairs, télécharger les fragments d’un torrent et lire la vidéo simultanément. Stremio Local Debrid confie le téléchargement et le stockage à votre ordinateur. Le téléviseur reçoit un flux HTTP sur le réseau domestique. Vous gérez votre cache sans compte de débridage payant dans le cloud.

## Fonctionnement

Le serveur consulte les extensions installées, conserve leurs adresses configurées et transforme les hashes, magnets et liens .torrent en sources Cache local. En sélectionner une lance le téléchargement sur l’ordinateur et diffuse le fichier au téléviseur. Les doublons partagent le cache et leurs trackers sont regroupés. Les liens vidéo directs et les services externes ne sont pas convertis.

## Prérequis

Utilisez Node.js 24 ou plus récent, suffisamment d’espace disque et un ordinateur et un téléviseur pouvant communiquer sur le même réseau. La découverte automatique fonctionne avec Stremio 5 pour macOS. Linux et Windows utilisent une liste manuelle d’extensions. Android TV, Google TV et Fire TV sont les appareils principalement visés ; d’autres clients peuvent nécessiter HTTPS et des codecs compatibles.

## Configurer le serveur

Sur macOS, connectez Stremio 5 au même compte que le téléviseur. Sur Linux ou Windows, lancez npm run setup, ajoutez les URL configurées des manifests à sources dans config.json et définissez autoDiscoverAddons sur false. Lancez npm run install:service sur les trois systèmes. L’installateur démarre le serveur et active son lancement automatique à l’ouverture de session via LaunchAgent, systemd ou le Planificateur de tâches. Stremio peut rester fermé.

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

## Connecter le téléviseur

Ouvrez l’adresse enregistrée dans state/status-url.txt. Choisissez la langue et cliquez sur Installer dans Stremio, ou collez l’adresse de l’extension dans le champ d’installation. Sur le téléviseur, utilisez le même compte et actualisez les extensions ou redémarrez Stremio. Ouvrez un film ou un épisode et choisissez Cache local. Les sources d’origine utilisent toujours l’appareil qui les ouvre. La liste du compte est synchronisée toutes les 60 secondes.

## Cache et lecture

Les téléchargements continuent après la fermeture du lecteur et reprennent après un redémarrage du serveur. Seul le fichier sélectionné est téléchargé. Les valeurs initiales sont 100 GiB de cache et 10 GiB d’espace libre réservé ; les torrents terminés les moins utilisés sont supprimés si nécessaire. Le démarrage dépend des pairs et du réseau. Aucun transcodage : le téléviseur décode la vidéo. Gardez l’ordinateur éveillé et accessible. Si son IP change, modifiez baseUrl et réinstallez l’extension.

## Confidentialité et licence

L’URL contient un jeton privé : ne le publiez pas dans les tickets ou captures d’écran. La découverte macOS lit le profil existant et transmet la clé de session uniquement à l’API officielle Stremio, sans en conserver de copie. Les URL configurées sont stockées de manière privée. Aucun catalogue de médias ni télémétrie n’est inclus. Les pairs peuvent voir l’IP de l’ordinateur. Utilisez des contenus auxquels vous avez droit. MIT-PoU impose un enregistrement d’utilisation et des crédits aux systèmes automatisés.

[Origami · GitHub](https://github.com/origami-ltd/stremio-local-debrid) · [MIT-PoU](../../LICENSE.md)
