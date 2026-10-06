# Stremio Local Debrid — 繁體中文（香港）

電腦下載並快取 Stremio 附加元件的種子，再經本地網絡將影片串流到電視。

## 為何有這個項目

速度較慢的電視可能難以同時下載種子及播放影片。Stremio Local Debrid 將下載和儲存交給電腦，電視經家居網絡接收 HTTP 影片串流。毋須付費雲端 debrid 帳戶，你亦能自行管理快取。

## 運作方式

伺服器保留已安裝附加元件的設定地址，向相容元件查詢播放來源。種子雜湊、magnet 及 .torrent 連結轉為本地快取來源。選取來源後，電腦便開始下載。重複檔案共用快取，tracker 會合併。直接影片連結及外部服務不會轉換。

## 系統需求

需要 Node.js 24 或更新版本、足夠的磁碟空間，以及在同一可互通網絡的電腦和電視。自動偵測帳戶支援 macOS 的 Stremio 5。Linux 和 Windows 使用手動附加元件清單。主要對象為 Android TV、Google TV 及 Fire TV；其他用戶端可能需要 HTTPS 和相容編解碼器。

## 設定伺服器

執行 npm run setup 產生 config.json 並設定 macOS、Linux 或 Windows 的啟動方式。在 macOS 上用電視的帳戶登入 Stremio 5；在 Linux/Windows 上將附加元件 URL 輸入精靈。--yes 接受預設值，--no-service 只儲存設定，--lang 選擇語言。現有權杖和下載內容會保留。

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

## 連接電視

開啟 state/status-url.txt 儲存的地址，選擇語言後按安裝到 Stremio，或將元件地址貼到安裝欄。在電視以相同帳戶重新整理附加元件或重開 Stremio。播放電影或集數時選本地快取來源。原有來源仍由開啟它們的裝置處理。帳戶元件每 60 秒同步一次。

## 快取及播放

關閉播放器後仍繼續下載，伺服器重啟後會恢復未完成下載。只下載所選檔案。預設快取為 100 GiB，保留 10 GiB 空間；需要空間時，先刪除最少使用的已完成種子。開始播放速度視乎 peer 及網絡。電視仍負責解碼，沒有轉碼功能。保持電腦喚醒且可連接。IP 改變時，更新 baseUrl 並重新安裝元件。

## 私隱及授權

元件 URL 包含存取權杖，請保密。帳戶偵測讀取現有本地 Stremio 設定，只將工作階段金鑰傳送至官方 API，不儲存金鑰副本。元件地址以私人方式儲存。項目沒有媒體目錄或遙測。BitTorrent peer 可以看到電腦 IP。請使用你有權存取的內容。MIT-PoU 要求自動化系統記錄使用及註明來源。

[Origami · GitHub](https://github.com/origami-ltd/stremio-local-debrid) · [MIT-PoU](../../LICENSE.md)
