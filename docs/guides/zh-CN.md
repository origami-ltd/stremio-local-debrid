# Stremio Local Debrid — 简体中文

电脑下载并缓存 Stremio 插件中的种子，再通过局域网将视频传输到电视。

## 为什么开发这个项目

较慢的电视可能难以同时下载种子和播放视频。Stremio Local Debrid 把下载和存储移到电脑上，电视通过家庭网络接收 HTTP 视频流。无需付费云端 debrid 账户，你就能自己管理缓存。

## 工作原理

服务器保留已安装插件的配置地址，向兼容插件请求播放源。种子哈希、magnet 和 .torrent 链接转换为本地缓存播放源。选择播放源后，电脑开始下载。重复文件共享缓存，并合并 tracker。直接视频链接及外部服务不会转换。

## 运行要求

需要 Node.js 24 或更新版本、足够的磁盘空间，以及在同一可互通网络中的电脑和电视。账户自动发现支持 macOS 上的 Stremio 5。Linux 和 Windows 使用手动插件列表。主要面向 Android TV、Google TV 和 Fire TV；其他客户端可能要求 HTTPS 和兼容的编解码器。

## 设置服务器

运行 npm run setup 生成 config.json 并配置 macOS、Linux 或 Windows 的启动方式。在 macOS 上用电视的账号登录 Stremio 5；在 Linux/Windows 上将插件 URL 输入向导。--yes 接受默认值，--no-service 仅保存配置，--lang 选择语言。现有令牌和下载内容会保留。

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

## 连接电视

打开 state/status-url.txt 中保存的地址，选择语言并点击安装到 Stremio，或把插件地址粘贴到安装栏。电视使用同一账户，刷新插件或重新打开 Stremio。播放电影或剧集时选择本地缓存播放源。原始播放源仍在打开它们的设备上处理。账户插件每 60 秒同步一次。

## 缓存与播放

关闭播放器后下载继续，服务器重启后未完成的下载会恢复。只下载选中的文件。默认缓存上限 100 GiB，并保留 10 GiB 空闲空间；需要空间时，优先删除最少使用的已完成种子。首次播放速度取决于 peer 和网络。电视仍负责解码视频，不进行转码。保持电脑唤醒且可访问。如果 IP 改变，请更新 baseUrl 并重新安装插件。

## 隐私与许可证

插件 URL 包含访问令牌，请保密。账户发现读取已有的本地 Stremio 配置，只向官方 API 发送会话密钥，不保存密钥副本。插件地址私下保存。项目不包含媒体目录或遥测。BitTorrent peer 可以看到电脑的 IP。请使用你有权访问的内容。MIT-PoU 要求自动化系统记录使用情况并注明来源。

[Origami · GitHub](https://github.com/origami-ltd/stremio-local-debrid) · [MIT-PoU](../../LICENSE.md)
