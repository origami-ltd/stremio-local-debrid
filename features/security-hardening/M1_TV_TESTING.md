# M1 playback acceptance on a TV

Use an isolated candidate deployment with its own cache, state, token and backend port. Keep production state and tokens unchanged. Expose both the test manifest and every generated playback route through the same certificate-verified HTTPS base URL; proxy the complete namespace and preserve HEAD and Range requests. A loopback-only server address will not work from a TV. Keep the candidate running throughout the test.

## Install and synchronize

1. On the PC, sign into the same Stremio account used by the TV.
2. Install the candidate addon using its HTTPS manifest URL. A catalog checkpoint fixture needs its fixture catalog manifest, not the production service manifest or a stream-list endpoint. Keep credential-bearing URLs private.
3. Use the TV client's addon synchronization workflow. If the new catalog does not appear, close and reopen Stremio.
4. For the checkpoint fixture, open Discover, select Movies, change the Popular dropdown to M0 test video, then open M0 local playback checkpoint. The fixture name says M0 even when served through the M1 candidate.
5. Check playback, forward/backward seeking, then stop playback, return to the title page and play again. Reopening exercises a new session after cleanup; no TV restart is required.
6. Check ordinary production-addon playback separately. The fixture and production addon have distinct IDs and can coexist. Restore any removed production addon using its own original manifest URL.

## Expected response and result

Verify a valid HTTPS manifest and a successful ranged media response (normally 206 with Content-Range and Accept-Ranges). Playback must retain its controlled video Content-Type, X-Content-Type-Options: nosniff, Referrer-Policy: no-referrer and Content-Security-Policy: sandbox; default-src 'none'; media-src 'self'. Never disable certificate verification to make the test pass.

On 2026-11-20 the user reported successful HTTPS WebM playback, forward/backward seeking and stop/reopen on the TV after installing on the PC and syncing addons. Supplied HTTP headers confirmed 206 and the protections above. An independent Linux staging checkout passed its 17 packaged tests. Browser negative tests also passed in Edge 157. These observations cover the tested fixture and device; TV model/client version was not recorded. Production-addon playback after reinstall was not reported. No universal codec/device compatibility is claimed.

After testing, remove the temporary addon, stop the isolated candidate and remove only its proxy namespace. Validate proxy configuration before reload. Preserve production configuration and state.
