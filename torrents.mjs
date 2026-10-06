import { writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import parseTorrent from 'parse-torrent';

export async function torrentDescriptor(stream, stateDir) {
  if (!stream || stream.fileIdx != null && (!Number.isInteger(stream.fileIdx) || stream.fileIdx < 0)) return null;
  let parsed;
  let metadata;
  try {
    if (/^[a-f0-9]{40}$|^[a-z2-7]{32}$/i.test(stream.infoHash || '')) parsed = await parseTorrent(stream.infoHash);
    else if (typeof stream.url === 'string' && /^(stream-)?magnet:/i.test(stream.url)) parsed = await parseTorrent(stream.url);
    else {
      const link = stream.torrentUrl || stream.url;
      if (typeof link !== 'string') return null;
      const url = new URL(link);
      if (!['http:', 'https:'].includes(url.protocol) || !stream.torrentUrl && !/\.torrent$/i.test(url.pathname)) return null;
      const response = await fetch(url, { signal: AbortSignal.timeout(8000), headers: stream.behaviorHints?.proxyHeaders?.request });
      if (!response.ok) return null;
      const chunks = [];
      let length = 0;
      for await (const chunk of response.body) {
        length += chunk.length;
        if (length > 16 * 1024 * 1024) return null;
        chunks.push(chunk);
      }
      metadata = Buffer.concat(chunks);
      parsed = await parseTorrent(metadata);
    }
    if (!/^[a-f0-9]{40}$/i.test(parsed.infoHash || '')) return null;
  } catch { return null; }
  if (metadata) await writeFile(join(stateDir, 'torrents', `${parsed.infoHash}.torrent`), metadata, { mode: 0o600 });
  return { infoHash: parsed.infoHash.toLowerCase(), fileIdx: stream.fileIdx, sources: [...new Set([...(Array.isArray(stream.sources) ? stream.sources.filter(source => typeof source === 'string') : []), ...(parsed.announce || []).map(tracker => `tracker:${tracker}`)])], webSeeds: parsed.urlList?.length ? parsed.urlList : undefined, private: parsed.private || undefined, filename: stream.behaviorHints?.filename || parsed.name };
}
