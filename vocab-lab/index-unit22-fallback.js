(() => {
  'use strict';

  const path = location.pathname;
  const isCatalog = path.endsWith('/vocab-lab/') || path.endsWith('/vocab-lab/index.html');
  if (!isCatalog) return;

  function ensureUnit22Card() {
    const grid = document.querySelector('.grid');
    if (!grid) return;

    const existing = [...grid.querySelectorAll('a.card')]
      .some(card => String(card.getAttribute('href') || '').includes('unit22-vocab-lab'));
    if (existing) return;

    const card = document.createElement('a');
    card.className = 'card';
    card.href = '../unit22-vocab-lab/';
    card.innerHTML = `
      <span class="tag">Unit 22</span>
      <h2>第二十二課完整學習</h2>
      <p>bravery, cradle, dam, deepen, fancy, arrest, flock, jewelry, lifetime, snap 等。</p>
      <span class="btn">進入第二十二課</span>`;

    const mixed = grid.querySelector('a.card.dark');
    if (mixed) grid.insertBefore(card, mixed);
    else grid.appendChild(card);

    const intro = document.querySelector('.hero p');
    if (intro && !intro.textContent.includes('Unit 22')) {
      intro.textContent = intro.textContent.replace(
        'Unit 21，再進入',
        'Unit 21 → Unit 22，再進入'
      );
    }
  }

  document.addEventListener('DOMContentLoaded', ensureUnit22Card);
  window.addEventListener('load', ensureUnit22Card);
  ensureUnit22Card();
})();