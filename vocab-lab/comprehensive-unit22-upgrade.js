(() => {
  'use strict';

  if (window.__comprehensiveUnit22UpgradeLoaded) return;
  window.__comprehensiveUnit22UpgradeLoaded = true;

  const TOTAL = 22;
  const STORAGE_KEY = 'vocab_selected_units_v6';
  const LEGACY_KEYS = ['vocab_selected_units_v5', 'vocab_selected_units_v4', 'vocab_selected_units_v3', 'vocab_selected_units_v2', 'vocab_selected_units_v1'];
  const originalApplyUnits = applyUnits;

  function normalizeUnits(value) {
    if (!Array.isArray(value)) return [];
    return [...new Set(value.map(Number).filter(no => Number.isInteger(no) && no >= 1 && no <= TOTAL))].sort((a, b) => a - b);
  }

  function readUnits() {
    for (const key of [STORAGE_KEY, ...LEGACY_KEYS]) {
      try {
        const valid = normalizeUnits(JSON.parse(localStorage.getItem(key) || 'null'));
        if (valid.length) return valid;
      } catch (error) {
        console.warn(`Unable to read ${key}`, error);
      }
    }
    return [22];
  }

  function saveUnits(units) {
    const valid = normalizeUnits(units);
    if (!valid.length) return;
    [STORAGE_KEY, ...LEGACY_KEYS].forEach(key => localStorage.setItem(key, JSON.stringify(valid)));
  }

  function unitText(no) {
    return `Unit ${String(no).padStart(2, '0')}`;
  }

  function renderSelector(units) {
    const container = document.querySelector('#unitChoices');
    if (!container) return;
    container.innerHTML = Array.from({ length: TOTAL }, (_, index) => index + 1).map(no => `
      <label class="unitToggle${units.includes(no) ? ' selected' : ''}${no === 22 ? ' unit22Featured' : ''}">
        <input type="checkbox" value="${no}" ${units.includes(no) ? 'checked' : ''}>
        ${unitText(no)}
      </label>`).join('');
  }

  checkedUnits = function upgradedCheckedUnits() {
    return [...document.querySelectorAll('#unitChoices input:checked')]
      .map(input => Number(input.value))
      .filter(no => Number.isInteger(no) && no >= 1 && no <= TOTAL)
      .sort((a, b) => a - b);
  };

  applyUnits = async function upgradedApplyUnits(units) {
    await originalApplyUnits(units);
    if (Array.isArray(selectedUnits) && selectedUnits.length) saveUnits(selectedUnits);
  };

  function setChecks(predicate) {
    document.querySelectorAll('#unitChoices input').forEach(input => {
      const checked = predicate(Number(input.value));
      input.checked = checked;
      input.closest('.unitToggle')?.classList.toggle('selected', checked);
    });
  }

  function installQuickButtons() {
    const actions = document.querySelector('.unitActions');
    if (!actions || actions.querySelector('#onlyUnit22')) return;

    const groups = [
      ['Unit 01–07', no => no >= 1 && no <= 7],
      ['Unit 08–14', no => no >= 8 && no <= 14],
      ['Unit 15–22', no => no >= 15 && no <= 22]
    ];

    const buttons = groups.map(([label, predicate]) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'smallBtn';
      button.textContent = label;
      button.onclick = () => setChecks(predicate);
      return button;
    });

    const only22 = document.createElement('button');
    only22.type = 'button';
    only22.id = 'onlyUnit22';
    only22.className = 'smallBtn unit22Button';
    only22.textContent = '只選 Unit 22';
    only22.onclick = () => setChecks(no => no === 22);

    actions.prepend(...buttons, only22);
  }

  function installUnit22Link() {
    const head = document.querySelector('.unitHead');
    if (!head || head.querySelector('.unit22CourseLink')) return;
    const link = document.createElement('a');
    link.className = 'unit22CourseLink';
    link.href = '../unit22-vocab-lab/';
    link.textContent = '查看 Unit 22 教材';
    head.appendChild(link);
  }

  function installCopy() {
    const intro = document.querySelector('.brand p');
    if (intro) intro.textContent = '自選 Unit 01～Unit 22；套用後，所有測驗模式只會從已選課別出題。';
    const hint = document.querySelector('.unitHead p');
    if (hint) hint.textContent = '可單選或複選；第一次開啟新版綜合頁時，預設只練 Unit 22。';
  }

  function installStyles() {
    const style = document.createElement('style');
    style.textContent = `
      .unitChoices{grid-template-columns:repeat(6,minmax(0,1fr))}
      .unit22Featured{box-shadow:inset 0 0 0 2px #2563eb}
      .unit22Button{background:#dbeafe;color:#1d4ed8}
      .unit22CourseLink{border-radius:13px;background:#2563eb;color:#fff;padding:10px 14px;text-decoration:none;font-weight:900;white-space:nowrap}
      @media(max-width:1100px){.unitChoices{grid-template-columns:repeat(5,1fr)}}
      @media(max-width:860px){.unitChoices{grid-template-columns:repeat(3,1fr)}.unitHead{align-items:center}}
      @media(max-width:520px){.unitChoices{grid-template-columns:repeat(2,1fr)}.unitHead{display:block}.unit22CourseLink{display:inline-block;margin-top:12px}.unitActions{grid-template-columns:1fr 1fr}.unitActions .primary{grid-column:1/-1}}
    `;
    document.head.appendChild(style);
  }

  const initialUnits = readUnits();
  selectedUnits = initialUnits;
  renderSelector(initialUnits);
  installCopy();
  installQuickButtons();
  installUnit22Link();
  installStyles();
  saveUnits(initialUnits);

  const loadSelection = () => {
    if (typeof loading !== 'undefined' && loading) {
      window.setTimeout(loadSelection, 80);
      return;
    }
    applyUnits(initialUnits);
  };
  loadSelection();
})();