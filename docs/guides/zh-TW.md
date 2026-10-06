# Stremio Local Debrid — 繁體中文（台灣）

電腦下載並快取 Stremio 附加元件中的種子，再透過區域網路將影片串流到電視。

## 為何開發此專案

較慢的電視可能無法順利同時下載種子與播放影片。Stremio Local Debrid 將下載與儲存移到電腦，電視透過家用網路接收 HTTP 影片串流。不需付費雲端 debrid 帳號，就能自行管理快取。

## 運作方式

伺服器保留已安裝附加元件的設定網址，向相容元件請求播放來源。種子雜湊、magnet 與 .torrent 連結轉為本機快取來源。選取來源便在電腦開始下載。重複檔案共用快取，tracker 會合併。直接影片連結與外部服務不會轉換。

## 需求

需要 Node.js 24 或更新版本、足夠的磁碟空間，以及在同一可互通網路中的電腦和電視。帳號自動偵測支援 macOS 的 Stremio 5。Linux 與 Windows 使用手動附加元件清單。主要支援 Android TV、Google TV 及 Fire TV；其他用戶端可能需要 HTTPS 和相容的編解碼器。

## 設定伺服器

在 macOS 以電視的同一帳號登入 Stremio 5。在 Linux 或 Windows 執行 npm run setup，將已設定元件的 manifest URL 加入 config.json 的 sources，並設定 autoDiscoverAddons 為 false。三個系統皆可執行 npm run install:service，啟動伺服器並登錄登入時自動啟動，分別使用 LaunchAgent、systemd 使用者服務與工作排程器。Stremio 可以關閉。請勿公開私人 config.json。

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

## 連接電視

開啟 state/status-url.txt 儲存的網址，選擇語言並按安裝至 Stremio，或將元件網址貼到安裝欄位。在電視以相同帳號重新整理附加元件或重開 Stremio。電影或影集請選本機快取來源。原始來源仍在開啟它們的裝置上運作。帳號元件每 60 秒同步一次。

## 快取與播放

關閉播放器後仍會繼續下載，伺服器重新啟動後會恢復未完成的下載。只下載所選檔案。預設快取上限 100 GiB，保留 10 GiB 可用空間；需要空間時，優先移除最少使用的已完成種子。首次播放速度取決於 peer 和網路。電視仍負責解碼，不進行轉碼。保持電腦喚醒且可連線。IP 改變時，更新 baseUrl 並重新安裝元件。

## 隱私權與授權

元件 URL 包含存取權杖，請保密。帳號偵測讀取現有本機 Stremio 設定，只向官方 API 傳送工作階段金鑰，不儲存副本。元件網址私下儲存。專案不含媒體目錄或遙測。BitTorrent peer 可看到電腦的 IP。請使用你有權存取的內容。MIT-PoU 要求自動化系統記錄使用情形及標明出處。

[Origami · GitHub](https://github.com/origami-ltd/stremio-local-debrid) · [MIT-PoU](../../LICENSE.md)
