# Stremio Local Debrid — Português (Brasil)

Seu computador baixa e armazena os torrents dos seus addons do Stremio e transmite o vídeo para a TV pela rede local.

## Por que existe

Uma TV lenta pode ter dificuldade para encontrar peers de torrent, baixar partes e reproduzir o vídeo ao mesmo tempo. O Stremio Local Debrid transfere o download e o armazenamento dos torrents para o computador. A TV recebe o vídeo por HTTP pela rede de casa. Você controla o próprio cache sem precisar de uma conta paga de debrid na nuvem.

## Como funciona

O servidor lê a lista de addons instalados, preserva o endereço configurado de cada um e consulta as fontes dos addons compatíveis. Hashes de torrent, magnets e links .torrent viram fontes Cache Local. Ao escolher uma, o computador inicia o download e transmite o arquivo solicitado para a TV. Arquivos repetidos compartilham o cache e seus trackers são reunidos. Links diretos de vídeo e serviços externos não são convertidos.

## Requisitos

Use Node.js 24 ou mais recente, espaço livre em disco e computador e TV na mesma rede, com comunicação entre eles. A descoberta automática da conta funciona com o Stremio 5 para macOS. Linux e Windows podem executar o servidor com uma lista manual de addons. Android TV, Google TV e Fire TV são os principais destinos; outros clientes podem exigir HTTPS e codecs compatíveis.

## Preparar o servidor

Execute npm run setup para gerar o config.json e configurar a inicialização no macOS, Linux ou Windows. No macOS, entre no Stremio 5 com a conta da TV; no Linux/Windows, informe as URLs dos addons no assistente. --yes aceita os padrões, --no-service apenas salva a configuração e --lang escolhe o idioma. Tokens e downloads existentes são preservados.

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

## Conectar a TV

Abra no computador o endereço salvo em state/status-url.txt. Escolha o idioma e clique em Instalar no Stremio, ou copie o endereço do addon para o campo de instalação de addons do Stremio. Atualize os addons ou reinicie o Stremio da TV usando a mesma conta. Abra um filme ou episódio e escolha uma fonte Cache Local. As fontes dos addons originais continuam usando o dispositivo que as abre. Addons novos ou removidos da conta são sincronizados a cada 60 segundos.

## Cache e reprodução

Os downloads continuam após fechar o player e retomam depois de reiniciar o servidor. Apenas o arquivo selecionado do torrent é baixado. O padrão é um cache de 100 GiB, com 10 GiB livres reservados; torrents completos menos usados são removidos quando falta espaço. O primeiro play depende dos peers disponíveis e da velocidade da rede. A TV continua decodificando o vídeo: não há transcodificação. Mantenha o computador acordado e acessível. Se o IP mudar, atualize baseUrl e reinstale o addon.

## Privacidade e licença

O endereço do addon contém um token de acesso: mantenha-o privado e não o publique em issues ou capturas de tela. A descoberta da conta no macOS lê o perfil local existente e envia a chave da sessão somente à API oficial do Stremio; o servidor não salva uma cópia dessa chave. Os endereços configurados dos addons são armazenados de forma privada. O projeto não inclui catálogo de mídia nem telemetria. Peers BitTorrent podem ver o IP do computador. Use conteúdo que você tem direito de acessar. O código usa MIT-PoU, com exigências adicionais de registro de uso e créditos para sistemas automatizados.

[Origami · GitHub](https://github.com/origami-ltd/stremio-local-debrid) · [MIT-PoU](../../LICENSE.md)
