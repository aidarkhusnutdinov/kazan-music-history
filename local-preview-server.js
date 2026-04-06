#!/usr/bin/env node
const http = require('http');
const fs = require('fs');
const path = require('path');
const { URL } = require('url');

const BASE_DIR = __dirname;
const HOST = '127.0.0.1';
const PORT = Number(process.env.KAZAN_PREVIEW_PORT || 8011);
const MEDIA_JSON = path.join(BASE_DIR, 'media-placement.json');
const MEDIA_MD = path.join(BASE_DIR, 'media-placement.md');
const TEXT_DRAFT_MD = path.join(BASE_DIR, 'text-draft.md');

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.md': 'text/markdown; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

function sendJson(res, status, payload) {
  const body = Buffer.from(JSON.stringify(payload, null, 2), 'utf8');
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Content-Length': body.length,
    'Cache-Control': 'no-store'
  });
  res.end(body);
}

function renderMd(data) {
  const chapters = data && typeof data === 'object' && data.chapters && typeof data.chapters === 'object'
    ? data.chapters
    : {};

  const out = [
    '# Media placement',
    '',
    'Этот файл описывает, какие медиа вставляются в страницу, где именно они стоят и зачем.',
    '',
    '---',
    ''
  ];

  for (const [chapter, items] of Object.entries(chapters)) {
    if (!Array.isArray(items) || items.length === 0) continue;
    out.push(`# ${chapter}`);
    out.push('');

    for (const item of items) {
      out.push(`- **position:** ${item.position || ''}`);
      if (item.block) out.push(`  - **block:** ${item.block}`);
      out.push(`  - **type:** ${item.type || ''}`);
      if (item.type === 'image-grid') {
        out.push('  - **items:**');
        for (const src of Array.isArray(item.items) ? item.items : []) {
          out.push(`    - \`${src}\``);
        }
      } else {
        out.push(`  - **src:** \`${item.src || ''}\``);
      }
      if (item.caption) out.push(`  - **caption:** ${item.caption}`);
      out.push('');
    }

    out.push('---');
    out.push('');
  }

  return `${out.join('\n').trim()}\n`;
}

function renderTextDraft(chapters) {
  const out = [];
  for (const chapter of Array.isArray(chapters) ? chapters : []) {
    out.push(`# ${chapter.title || ''}`);
    out.push('');
    for (const block of Array.isArray(chapter.blocks) ? chapter.blocks : []) {
      out.push(`## ${block.kicker || ''}`);
      if (block.title) {
        out.push(`### ${block.title}`);
      }
      if (block.main) {
        out.push(block.main.trim());
      }
      out.push('');
      if (block.expand) {
        out.push('**Разворот:**');
        out.push(block.expand.trim());
        out.push('');
      }
    }
    out.push('---');
    out.push('');
  }
  return `${out.join('\n').trim()}\n`;
}

function safeJoin(base, targetPath) {
  const resolved = path.resolve(base, `.${targetPath}`);
  if (!resolved.startsWith(path.resolve(base) + path.sep) && resolved !== path.resolve(base)) {
    return null;
  }
  return resolved;
}

function serveFile(res, filePath) {
  fs.stat(filePath, (statErr, stats) => {
    if (statErr || !stats.isFile()) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-store' });
      res.end('Not found');
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';
    res.writeHead(200, {
      'Content-Type': contentType,
      'Content-Length': stats.size,
      'Cache-Control': 'no-store'
    });
    fs.createReadStream(filePath).pipe(res);
  });
}

const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://${HOST}:${PORT}`);

  if (req.method === 'POST' && (url.pathname === '/save-media' || url.pathname === '/save-text-draft')) {
    let body = '';
    req.on('data', chunk => {
      body += chunk;
      if (body.length > 10 * 1024 * 1024) {
        req.destroy();
      }
    });
    req.on('end', () => {
      try {
        const data = JSON.parse(body || '{}');
        if (url.pathname === '/save-media') {
          fs.writeFileSync(MEDIA_MD, renderMd(data), 'utf8');
          sendJson(res, 200, { ok: true, target: 'media-placement.md' });
          return;
        }
        fs.writeFileSync(TEXT_DRAFT_MD, renderTextDraft(data.chapters), 'utf8');
        sendJson(res, 200, { ok: true, target: 'text-draft.md' });
      } catch (error) {
        sendJson(res, 500, { ok: false, error: String(error.message || error) });
      }
    });
    return;
  }

  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.writeHead(405, { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-store' });
    res.end('Method not allowed');
    return;
  }

  let pathname = url.pathname;
  if (pathname === '/') pathname = '/preview.html';
  const filePath = safeJoin(BASE_DIR, pathname);
  if (!filePath) {
    res.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-store' });
    res.end('Forbidden');
    return;
  }

  if (req.method === 'HEAD') {
    fs.stat(filePath, (err, stats) => {
      if (err || !stats.isFile()) {
        res.writeHead(404, { 'Cache-Control': 'no-store' });
        res.end();
        return;
      }
      const ext = path.extname(filePath).toLowerCase();
      const contentType = MIME_TYPES[ext] || 'application/octet-stream';
      res.writeHead(200, {
        'Content-Type': contentType,
        'Content-Length': stats.size,
        'Cache-Control': 'no-store'
      });
      res.end();
    });
    return;
  }

  serveFile(res, filePath);
});

server.listen(PORT, HOST, () => {
  console.log(`Serving ${BASE_DIR} at http://${HOST}:${PORT}`);
});
