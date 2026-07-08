(() => {
  'use strict';

  const path = location.pathname;
  const isCatalog = path.endsWith('/vocab-lab/') || path.endsWith('/vocab-lab/index.html');
  if (!isCatalog) return;

  function ensureUnit24Card() {
    const grid = document.querySelector('.grid');
    if (!grid) return;

    const existing = [...grid.querySelectorAll('a.card')]
      .some(card => String(card.getAttribute('href') || '').includes('unit24-vocab-lab'));
    if (existing) return;

    const card = document.createElement('a');
    card.className = 'card';
    card.href = '../unit24-vocab-lab/';
    card.innerHTML = `
      <span class="tag">Unit 24</span>
      <h2>第二十四課完整學習</h2>
      <p>chimney, clip, countable, energetic, fireworks, hatch, leak, spice, bacteria, magnet 等。</p>
      <span class="btn">進入第二十四課</span>`;

    const mixed = grid.querySelector('a.card.dark');
    if (mixed) grid.insertBefore(card, mixed);
    else grid.appendChild(card);

    const intro = document.querySelector('.hero p');
    if (intro && !intro.textContent.includes('Unit 24')) {
      intro.textContent = intro.textContent.replace(
        'Unit 23，再進入',
        'Unit 23 → Unit 24，再進入'
      );
    }
  }

  document.addEventListener('DOMContentLoaded', ensureUnit24Card);
  window.addEventListener('load', ensureUnit24Card);
  ensureUnit24Card();
})();