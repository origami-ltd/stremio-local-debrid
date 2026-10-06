# Security

This server is designed for a trusted local network. HTTP LAN URLs are unencrypted. Keep the access token and configured addon URLs private; do not expose the listening port to the internet. Anyone with the private addon URL can access the cache and initiate downloads. Signed play descriptors prevent editing a stream's torrent metadata without the token; they do not turn the token into a per-device account system.

The server requests your configured upstream addons and can follow their torrent metadata and web seeds. Only configure addons you trust. It does not provide a sandbox for malicious upstream services. Torrent file paths are restricted to their cache directory; `.torrent` responses are bounded to 16 MiB. Requests to Stremio's account API send the existing session key only to that official endpoint. Cached addon descriptors can themselves contain credentials and are stored in the private state directory.

POSIX configuration and state files use mode `0600`, with private directories using `0700`. On Windows, files rely on the current user's profile ACLs; POSIX permission bits do not enforce Windows ACLs. No analytics are included. The public installation portal only loads static assets from its own origin and formats a pasted private URL in the browser. It does not contact that local server or upload the URL.

The pinned dependencies currently produce four high-severity audit findings inherited through `ip` and the tracker-server dependency tree. This application uses a BitTorrent client and does not instantiate a tracker server. That narrows exposure but does not establish that the dependency tree is vulnerability-free. Avoid the incompatible dependency downgrade proposed by `npm audit fix --force`; evaluate a compatible upstream fix before changing the pinned versions.

Do not post credentials or private addresses in an issue. Report vulnerabilities privately through the repository's GitHub Security Advisories when enabled. Ordinary bug reports can use the issue template with secrets removed.
