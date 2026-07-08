(() => {
  'use strict';

  const path = location.pathname;
  const isCatalog = path.endsWith('/vocab-lab/') || path.endsWith('/vocab-lab/index.html');
  if (!isCatalog) return;

  function ensureUnit21Card() {
    const grid = document.querySelector('.grid');
    if (!grid) return;

    const existing = [...grid.querySelectorAll('a.card')]
      .some(card => String(card.getAttribute('href') || '').includes('unit21-vocab-lab'));
    if (existing) return;

    const card = document.createElement('a');
    card.className = 'card';
    card.href = '../unit21-vocab-lab/';
    card.innerHTML = `
      <span class="tag">Unit 21</span>
      <h2>第二十一課完整學習</h2>
      <p>luggage, excellence, spoil, invent, gossip, sticky, buffet, carpenter, zipper, cart 等。</p>
      <span class="btn">進入第二十一課</span>`;

    const mixed = grid.querySelector('a.card.dark');
    if (mixed) grid.insertBefore(card, mixed);
    else grid.appendChild(card);

    const intro = document.querySelector('.hero p');
    if (intro && !intro.textContent.includes('Unit 21')) {
      intro.textContent = intro.textContent.replace(
        'Unit 20，再進入',
        'Unit 20 → Unit 21，再進入'
      );
    }
  }

  document.addEventListener('DOMContentLoaded', ensureUnit21Card);
  window.addEventListener('load', ensureUnit21Card);
  ensureUnit21Card();
})();