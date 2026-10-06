# Publishing the addon

Publish the repository and the `public/` directory through the GitHub Pages workflow. The public manifest is:

`https://origami-ltd.github.io/stremio-local-debrid/manifest.json`

This manifest identifies a **self-hosted server**, with `configurationRequired` and `configurable` enabled. Its `/configure` page explains server installation and prepares a user's private manifest URL. The public site does not implement torrent playback. It should not be presented as a ready-to-play hosted debrid service.

Validate public HTTPS availability, manifest fields, the `/configure` page, logo and translated assets before submitting. The standard Stremio central publishing API accepts:

```json
{
  "transportUrl": "https://origami-ltd.github.io/stremio-local-debrid/manifest.json",
  "transportName": "http"
}
```

Send this JSON to `https://api.strem.io/api/addonPublish`, following the [SDK publishing implementation](https://github.com/Stremio/stremio-addon-sdk/blob/master/src/publishToCentral.js). A successful API response records that submission; it does not guarantee every client immediately lists the addon.

For [stremio-addons.net](https://stremio-addons.net/submit-addon), submit the public manifest and repository, describe self-hosting requirements, and use multilingual content classification. This is an original addon, not a hosted instance or a fork. Select categories that match torrent-to-HTTP streaming. Their team reviews submissions before publication; report a pending review accurately.

Never submit an address containing a user's access token, LAN IP, addon configuration, session key or media files. The public website must contain none of these. See the directory's [submission rules](https://docs.stremio-addons.net/addons/submission-rules).

For a release, update package/lockfile and both runtime and discovery manifest versions, regenerate guides, pass CI, tag the version and publish release notes. Do not include ignored `config.json`, `state`, `node_modules`, logs or media in release assets.

## Publication status — 2026-10-06

The repository and installation portal are public under Origami Ltd. Version 1.2.0 was submitted to [stremio-addons.net](https://stremio-addons.net/addons/stremio-local-debrid?preview=true), developer ownership was verified, and the pending listing was updated with the built-in setup wizard instructions. The directory reports the manifest as reachable. Moderator review is pending.

The official Stremio central publishing API returned error 9903, `Invalid addon publish - cannot fetch addon's manifest`, on the initial submission and a later retry. The public manifest was independently fetched over HTTPS and accepted by the official addon SDK validator. Central publication is unconfirmed; the API's response does not establish the cause of its fetch failure.
