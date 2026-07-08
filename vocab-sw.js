const ASSET_VERSION = '20260708-mixed-toeic-v4';
const SPEECH_SCRIPT = `/english_app/speech-upgrade.js?v=${ASSET_VERSION}`;
const TOEIC_SCRIPT = `/english_app/vocab-lab/toeic-part5-upgrade.js?v=${ASSET_VERSION}`;
const UNIT11_SCRIPT = `/english_app/vocab-lab/unit11-upgrade.js?v=${ASSET_VERSION}`;
const UNIT18_SCRIPT = `/english_app/unit18-v2.js?v=${ASSET_VERSION}`;
const COMPREHENSIVE_18_SCRIPT = `/english_app/vocab-lab/comprehensive-unit18-upgrade.js?v=${ASSET_VERSION}`;

self.addEventListener('install', event => {
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.map(key => caches.delete(key)));
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', event => {
  const request = event.request;
  const url = new URL(request.url);

  if (request.method !== 'GET') return;
  if (url.origin !== location.origin) return;
  if (!url.pathname.startsWith('/english_app/')) return;
  if (!url.pathname.endsWith('/') && !url.pathname.endsWith('.html')) return;

  event.respondWith((async () => {
    const freshRequest = new Request(request, {cache: 'reload'});
    const response = await fetch(freshRequest);
    const type = response.headers.get('content-type') || '';
    if (!type.includes('text/html')) return response;

    let html = await response.text();

    if (!html.includes('/english_app/speech-upgrade.js')) {
      html = html.replace('</body>', `<script src="${SPEECH_SCRIPT}"></script></body>`);
    }

    const isUnit18 = url.pathname.endsWith('/unit18-vocab-lab/') || url.pathname.endsWith('/unit18-vocab-lab/index.html');
    if (isUnit18 && !html.includes('/english_app/unit18-v2.js')) {
      html = html.replace('</body>', `<script src="${UNIT18_SCRIPT}"></script></body>`);
    }

    if (url.pathname.endsWith('/vocab-lab/comprehensive.html')) {
      if (!html.includes('/english_app/vocab-lab/toeic-part5-upgrade.js')) {
        html = html.replace('</body>', `<script src="${TOEIC_SCRIPT}"></script></body>`);
      }
      if (!html.includes('/english_app/vocab-lab/unit11-upgrade.js')) {
        html = html.replace('</body>', `<script src="${UNIT11_SCRIPT}"></script></body>`);
      }
      if (!html.includes('/english_app/vocab-lab/comprehensive-unit18-upgrade.js')) {
        html = html.replace('</body>', `<script src="${COMPREHENSIVE_18_SCRIPT}"></script></body>`);
      }
    }

    if (url.pathname.endsWith('/vocab-lab/grammar.html')) {
      if (!html.includes('/english_app/vocab-lab/unit11-upgrade.js')) {
        html = html.replace('</body>', `<script src="${UNIT11_SCRIPT}"></script></body>`);
      }
    }

    return new Response(html, {
      status: response.status,
      statusText: response.statusText,
      headers: {
        'content-type': 'text/html; charset=utf-8',
        'cache-control': 'no-store'
      }
    });
  })());
});
