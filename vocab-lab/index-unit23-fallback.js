(() => {
  'use strict';

  const path = location.pathname;
  const isCatalog = path.endsWith('/vocab-lab/') || path.endsWith('/vocab-lab/index.html');
  if (!isCatalog) return;

  function ensureUnit23Card() {
    const grid = document.querySelector('.grid');
    if (!grid) return;

    const existing = [...grid.querySelectorAll('a.card')]
      .some(card => String(card.getAttribute('href') || '').includes('unit23-vocab-lab'));
    if (existing) return;

    const card = document.createElement('a');
    card.className = 'card';
    card.href = '../unit23-vocab-lab/';
    card.innerHTML = `
      <span class="tag">Unit 23</span>
      <h2>第二十三課完整學習</h2>
      <p>microphone, microwave, nap, passport, pollute, rust, slippery, organic, rectangle, log 等。</p>
      <span class="btn">進入第二十三課</span>`;

    const mixed = grid.querySelector('a.card.dark');
    if (mixed) grid.insertBefore(card, mixed);
    else grid.appendChild(card);

    const intro = document.querySelector('.hero p');
    if (intro && !intro.textContent.includes('Unit 23')) {
      intro.textContent = intro.textContent.replace(
        'Unit 22，再進入',
        'Unit 22 → Unit 23，再進入'
      );
    }
  }

  document.addEventListener('DOMContentLoaded', ensureUnit23Card);
  window.addEventListener('load', ensureUnit23Card);
  ensureUnit23Card();
})();