const SPEECH_SCRIPT = '/english_app/speech-upgrade.js';

self.addEventListener('install', event => {
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', event => {
  const request = event.request;
  const url = new URL(request.url);

  if (request.method !== 'GET') return;
  if (url.origin !== location.origin) return;
  if (!url.pathname.startsWith('/english_app/')) return;
  if (!url.pathname.endsWith('/') && !url.pathname.endsWith('.html')) return;

  event.respondWith((async () => {
    const response = await fetch(request);
    const type = response.headers.get('content-type') || '';
    if (!type.includes('text/html')) return response;

    let html = await response.text();
    if (!html.includes(SPEECH_SCRIPT)) {
      html = html.replace('</body>', `<script src="${SPEECH_SCRIPT}"></script></body>`);
    }

    return new Response(html, {
      status: response.status,
      statusText: response.statusText,
      headers: { 'content-type': 'text/html; charset=utf-8' }
    });
  })());
});