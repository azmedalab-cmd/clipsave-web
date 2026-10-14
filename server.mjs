import { createServer } from 'node:http';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { createReadStream, existsSync, statSync } from 'node:fs';
import { extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('.', import.meta.url));
const port = Number(process.env.PORT || 8787);
const run = promisify(execFile);
const ytdlp = process.env.YTDLP_BIN || 'yt-dlp';
const mime = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8' };

function sendJson(res, status, body) {
  res.writeHead(status, { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' });
  res.end(JSON.stringify(body));
}

async function readJson(req) {
  let raw = '';
  for await (const chunk of req) raw += chunk;
  if (raw.length > 16_000) throw new Error('İstek çok büyük.');
  return JSON.parse(raw || '{}');
}

function isInstagramPage(value) {
  try {
    const url = new URL(value);
    return url.protocol === 'https:' && (url.hostname === 'instagram.com' || url.hostname.endsWith('.instagram.com')) && /^\/(reel|p)\//i.test(url.pathname);
  } catch { return false; }
}

async function resolvePublicVideo(url) {
  const { stdout } = await run(ytdlp, [
    '--no-playlist', '--no-warnings', '--quiet', '--no-check-certificates',
    '--format', 'best[ext=mp4]/best', '--get-url', url
  ], { timeout: 45_000, maxBuffer: 64_000 });
  const downloadUrl = stdout.trim().split(/\r?\n/).find((line) => /^https?:\/\//.test(line));
  if (!downloadUrl) throw new Error('İndirilebilir bir video URL’si bulunamadı.');
  return downloadUrl;
}

const server = createServer(async (req, res) => {
  if (req.method === 'POST' && req.url === '/api/reels/resolve') {
    try {
      const { url } = await readJson(req);
      if (!isInstagramPage(url)) return sendJson(res, 400, { error: 'Geçerli bir Instagram Reel veya gönderi bağlantısı gir.' });

      try {
        const downloadUrl = await resolvePublicVideo(url);
        return sendJson(res, 200, { downloadUrl, contentType: 'video/mp4', filename: 'clipsave-video.mp4' });
      } catch (error) {
        const message = error?.code === 'ENOENT'
          ? 'yt-dlp bulunamadı. Kurulumdan sonra sunucuyu yeniden başlat.'
          : 'Video çözülemedi. İçerik herkese açık olmayabilir veya bağlantı artık geçerli değildir.';
        return sendJson(res, 422, { error: message });
      }
    } catch (error) {
      return sendJson(res, 400, { error: error instanceof Error ? error.message : 'Geçersiz istek.' });
    }
  }

  if (req.method !== 'GET') return sendJson(res, 405, { error: 'Method not allowed' });
  const requested = req.url === '/' ? '/index.html' : req.url.split('?')[0];
  const file = normalize(join(root, requested));
  if (!file.startsWith(root) || !existsSync(file) || !statSync(file).isFile()) {
    res.writeHead(404); return res.end('Not found');
  }
  res.writeHead(200, { 'content-type': mime[extname(file)] || 'application/octet-stream' });
  createReadStream(file).pipe(res);
});

server.listen(port, () => console.log(`ClipSave local: http://localhost:${port}`));
