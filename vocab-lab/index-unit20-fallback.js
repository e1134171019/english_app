(() => {
  'use strict';

  const path = location.pathname;
  const isCatalog = path.endsWith('/vocab-lab/') || path.endsWith('/vocab-lab/index.html');
  if (!isCatalog) return;

  function ensureUnit20Card() {
    const grid = document.querySelector('.grid');
    if (!grid) return;

    const existing = [...grid.querySelectorAll('a.card')]
      .some(card => String(card.getAttribute('href') || '').includes('unit20-vocab-lab'));
    if (existing) return;

    const card = document.createElement('a');
    card.className = 'card';
    card.href = '../unit20-vocab-lab/';
    card.innerHTML = `
      <span class="tag">Unit 20</span>
      <h2>第二十課完整學習</h2>
      <p>import, tribe, leisure, awake, stubborn, chill, headline, heal, dive, violet 等。</p>
      <span class="btn">進入第二十課</span>`;

    const mixed = grid.querySelector('a.card.dark');
    if (mixed) grid.insertBefore(card, mixed);
    else grid.appendChild(card);

    const intro = document.querySelector('.hero p');
    if (intro && !intro.textContent.includes('Unit 20')) {
      intro.textContent = intro.textContent.replace(
        'Unit 19，再進入',
        'Unit 19 → Unit 20，再進入'
      );
    }
  }

  document.addEventListener('DOMContentLoaded', ensureUnit20Card);
  window.addEventListener('load', ensureUnit20Card);
  ensureUnit20Card();
})();