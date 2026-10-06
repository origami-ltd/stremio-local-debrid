# Stremio Local Debrid — Español

Tu ordenador descarga y guarda los torrents de tus complementos de Stremio y transmite el vídeo al televisor por la red local.

## Por qué existe

Un televisor lento puede tener dificultades para encontrar pares, descargar partes de torrents y reproducir vídeo a la vez. Stremio Local Debrid traslada las descargas y el almacenamiento al ordenador. El televisor recibe vídeo HTTP por la red doméstica. Tú controlas la caché sin una cuenta de debrid de pago en la nube.

## Cómo funciona

El servidor consulta los complementos instalados, conserva sus direcciones configuradas y convierte hashes, magnets y enlaces .torrent en fuentes Caché local. Elegir una inicia la descarga en el ordenador y transmite el archivo al televisor. Los duplicados comparten caché y trackers. Los enlaces directos de vídeo y los servicios externos no se convierten.

## Requisitos

Necesitas Node.js 24 o posterior, espacio libre en disco y un ordenador y un televisor que puedan comunicarse en la misma red. El descubrimiento automático funciona con Stremio 5 para macOS. Linux y Windows utilizan una lista manual de complementos. Android TV, Google TV y Fire TV son los destinos principales; otros clientes pueden exigir HTTPS y códecs compatibles.

## Preparar el servidor

Ejecuta npm run setup para generar config.json y configurar el inicio en macOS, Linux o Windows. En macOS, inicia sesión en Stremio 5 con la cuenta de la TV; en Linux/Windows, introduce las URL de los addons en el asistente. --yes acepta los valores predeterminados, --no-service solo guarda la configuración y --lang elige el idioma. Se conservan los tokens y las descargas existentes.

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

## Conectar el televisor

Abre la dirección guardada en state/status-url.txt. Elige un idioma y pulsa Instalar en Stremio, o pega la dirección del complemento en el campo de instalación. Usa la misma cuenta en el televisor y actualiza los complementos o reinicia Stremio. Abre una película o un episodio y elige Caché local. Las fuentes originales siguen usando el dispositivo que las abre. Los cambios de complementos se sincronizan cada 60 segundos.

## Caché y reproducción

Las descargas continúan al cerrar el reproductor y se reanudan al reiniciar el servidor. Solo se descarga el archivo seleccionado. Los valores iniciales son 100 GiB de caché y 10 GiB libres reservados; se eliminan los torrents completos menos usados cuando falta espacio. El inicio depende de los pares y de la red. No hay transcodificación: el televisor decodifica el vídeo. Mantén el ordenador despierto y accesible. Si cambia la IP, actualiza baseUrl y reinstala el complemento.

## Privacidad y licencia

La URL contiene un token de acceso privado: no lo publiques en incidencias ni capturas. En macOS se lee el perfil existente y la clave de sesión se envía solo a la API oficial de Stremio, sin guardar una copia. Las URL configuradas se almacenan de forma privada. No hay catálogo de contenidos ni telemetría. Los pares pueden ver la IP del ordenador. Usa contenido al que tengas derecho a acceder. MIT-PoU añade requisitos de registro de uso y créditos para sistemas automatizados.

[Origami · GitHub](https://github.com/origami-ltd/stremio-local-debrid) · [MIT-PoU](../../LICENSE.md)
