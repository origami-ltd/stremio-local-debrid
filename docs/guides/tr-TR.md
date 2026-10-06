# Stremio Local Debrid — Türkçe

Bilgisayarınız Stremio eklentilerinizdeki torrentleri indirip saklar ve videoyu yerel ağ üzerinden televizyonunuza aktarır.

## Neden var

Yavaş bir televizyon aynı anda eşleri aramak, torrent parçalarını indirmek ve video oynatmakta zorlanabilir. Stremio Local Debrid indirmeyi ve depolamayı bilgisayara taşır. Televizyon ev ağından HTTP video alır. Ücretli bulut debrid hesabı olmadan kendi önbelleğinizi yönetirsiniz.

## Nasıl çalışır

Sunucu yüklü eklentilerden kaynak ister ve yapılandırmalarını korur. Torrent hashleri, magnet ve .torrent bağlantıları Yerel Önbellek kaynaklarına dönüşür. Seçim bilgisayarda indirmeyi başlatır ve seçilen dosyayı televizyona aktarır. Yinelenenler önbelleği ve birleştirilmiş trackerları paylaşır. Doğrudan video bağlantıları ve harici hizmetler dönüştürülmez.

## Gereksinimler

Node.js 24 veya üzeri, boş disk alanı ve aynı ağda birbirine erişebilen bilgisayar ile televizyon gerekir. Otomatik hesap keşfi macOS için Stremio 5'i destekler. Linux ve Windows elle girilen eklenti listesi kullanır. Başlıca cihazlar Android TV, Google TV ve Fire TV'dir; diğer istemciler HTTPS ve uyumlu kodek isteyebilir.

## Sunucuyu kurma

macOS'ta Stremio 5'e televizyon hesabıyla giriş yapın. Linux veya Windows'ta npm run setup çalıştırın, yapılandırılmış manifest URL'lerini config.json içindeki sources alanına ekleyin ve autoDiscoverAddons değerini false yapın. Üç sistemde de npm run install:service çalıştırın. Sunucu başlar ve LaunchAgent, systemd veya Görev Zamanlayıcı ile oturum açıldığında otomatik başlar. Stremio kapalı kalabilir.

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

## Televizyonu bağlama

state/status-url.txt adresini açın, dili seçin ve Stremio'ya yükle düğmesini kullanın veya eklenti adresini yükleme alanına yapıştırın. Televizyonda aynı hesabı kullanıp eklentileri yenileyin ya da Stremio'yu yeniden başlatın. Film veya bölüm için Yerel Önbellek seçin. Asıl kaynaklar hâlâ onları açan cihazı kullanır. Hesap listesi her 60 saniyede eşitlenir.

## Önbellek ve oynatma

İndirmeler oynatıcı kapanınca sürer ve sunucu yeniden başlayınca devam eder. Yalnız seçilen dosya indirilir. Varsayılan önbellek 100 GiB, boş alan rezervi 10 GiB'dir; tamamlanmış, az kullanılan torrentler yer gerektiğinde silinir. İlk başlangıç eşlere ve ağa bağlıdır. Kod dönüştürme yoktur: videoyu televizyon çözer. Bilgisayarı uyanık ve erişilebilir tutun. IP değişirse baseUrl değerini güncelleyip eklentiyi yeniden yükleyin.

## Gizlilik ve lisans

Eklenti adresi özel erişim tokenı içerir: sorun bildirimlerinde veya ekran görüntülerinde paylaşmayın. macOS mevcut profili okur ve oturum anahtarını yalnız resmi Stremio API'sine gönderir; kopyasını saklamaz. Yapılandırılmış adresler özel tutulur. Medya kataloğu ve telemetri yoktur. Eşler bilgisayarın IP'sini görebilir. Erişim hakkınız olan içerikleri kullanın. MIT-PoU otomatik sistemler için kullanım kaydı ve kaynak belirtme gerektirir.

[Origami · GitHub](https://github.com/origami-ltd/stremio-local-debrid) · [MIT-PoU](../../LICENSE.md)
