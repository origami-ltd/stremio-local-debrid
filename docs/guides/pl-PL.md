# Stremio Local Debrid — Polski

Komputer pobiera i przechowuje torrenty z dodatków Stremio, a następnie przesyła wideo do telewizora przez sieć lokalną.

## Dlaczego powstał ten projekt

Wolny telewizor może mieć trudności z jednoczesnym wyszukiwaniem peerów, pobieraniem części torrentów i odtwarzaniem filmu. Stremio Local Debrid przenosi pobieranie i przechowywanie na komputer. Telewizor odbiera wideo HTTP przez domową sieć. Kontrolujesz własny bufor bez płatnego konta debrid w chmurze.

## Jak to działa

Serwer pyta zainstalowane dodatki o źródła, zachowując ich konfigurację. Hashe, magnety i linki .torrent stają się źródłami lokalnej pamięci podręcznej. Wybór źródła rozpoczyna pobieranie na komputerze i przesyła wybrany plik do telewizora. Duplikaty współdzielą bufor i trackery. Bezpośrednie linki wideo i zewnętrzne serwisy nie są konwertowane.

## Wymagania

Potrzebujesz Node.js 24 lub nowszego, wolnego miejsca oraz komputera i telewizora osiągalnych w tej samej sieci. Automatyczne wykrywanie konta obsługuje Stremio 5 na macOS. Linux i Windows używają ręcznej listy dodatków. Główne urządzenia to Android TV, Google TV i Fire TV; inne klienty mogą wymagać HTTPS i odpowiednich kodeków.

## Instalacja serwera

Uruchom npm run setup, aby utworzyć config.json i skonfigurować uruchamianie w macOS, Linux lub Windows. W macOS zaloguj się do Stremio 5 kontem telewizora; w Linux/Windows wpisz adresy URL dodatków w kreatorze. --yes akceptuje ustawienia domyślne, --no-service zapisuje tylko konfigurację, a --lang wybiera język. Istniejące tokeny i pobrane pliki zostają zachowane.

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

## Podłączenie telewizora

Otwórz adres z state/status-url.txt, wybierz język i Zainstaluj w Stremio albo wklej adres dodatku do pola instalacji. Na telewizorze użyj tego samego konta, odśwież dodatki lub uruchom Stremio ponownie. Wybierz Lokalną pamięć podręczną dla filmu lub odcinka. Oryginalne źródła nadal używają urządzenia, które je otwiera. Lista konta synchronizuje się co 60 sekund.

## Bufor i odtwarzanie

Pobieranie trwa po zamknięciu odtwarzacza i wznawia się po restarcie serwera. Pobierany jest tylko wybrany plik. Domyślnie bufor ma 100 GiB, a rezerwa wolnego miejsca 10 GiB; ukończone, rzadko używane torrenty są usuwane w razie potrzeby. Start zależy od peerów i sieci. Nie ma transkodowania: telewizor dekoduje wideo. Utrzymuj komputer aktywny i dostępny. Po zmianie IP zaktualizuj baseUrl i ponownie zainstaluj dodatek.

## Prywatność i licencja

Adres dodatku zawiera prywatny token: nie publikuj go w zgłoszeniach ani zrzutach ekranu. macOS odczytuje istniejący profil i wysyła klucz sesji wyłącznie do oficjalnego API Stremio, bez zapisywania kopii. Skonfigurowane adresy są przechowywane prywatnie. Nie ma katalogu mediów ani telemetrii. Peery widzą IP komputera. Korzystaj z treści, do których masz prawo. MIT-PoU wymaga rejestrowania użycia i uznania autorstwa przez systemy automatyczne.

[Origami · GitHub](https://github.com/origami-ltd/stremio-local-debrid) · [MIT-PoU](../../LICENSE.md)
