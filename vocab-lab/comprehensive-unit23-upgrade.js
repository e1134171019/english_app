(() => {
  'use strict';

  if (window.__comprehensiveUnit23UpgradeLoaded) return;
  window.__comprehensiveUnit23UpgradeLoaded = true;

  const TOTAL = 23;
  const STORAGE_KEY = 'vocab_selected_units_v7';
  const LEGACY_KEYS = ['vocab_selected_units_v6', 'vocab_selected_units_v5', 'vocab_selected_units_v4', 'vocab_selected_units_v3', 'vocab_selected_units_v2', 'vocab_selected_units_v1'];
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
    return [23];
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
      <label class="unitToggle${units.includes(no) ? ' selected' : ''}${no === 23 ? ' unit23Featured' : ''}">
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
    if (!actions || actions.querySelector('#onlyUnit23')) return;

    const groups = [
      ['Unit 01–08', no => no >= 1 && no <= 8],
      ['Unit 09–16', no => no >= 9 && no <= 16],
      ['Unit 17–23', no => no >= 17 && no <= 23]
    ];

    const buttons = groups.map(([label, predicate]) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'smallBtn';
      button.textContent = label;
      button.onclick = () => setChecks(predicate);
      return button;
    });

    const only23 = document.createElement('button');
    only23.type = 'button';
    only23.id = 'onlyUnit23';
    only23.className = 'smallBtn unit23Button';
    only23.textContent = '只選 Unit 23';
    only23.onclick = () => setChecks(no => no === 23);

    actions.prepend(...buttons, only23);
  }

  function installUnit23Link() {
    const head = document.querySelector('.unitHead');
    if (!head || head.querySelector('.unit23CourseLink')) return;
    const link = document.createElement('a');
    link.className = 'unit23CourseLink';
    link.href = '../unit23-vocab-lab/';
    link.textContent = '查看 Unit 23 教材';
    head.appendChild(link);
  }

  function installCopy() {
    const intro = document.querySelector('.brand p');
    if (intro) intro.textContent = '自選 Unit 01～Unit 23；套用後，所有測驗模式只會從已選課別出題。';
    const hint = document.querySelector('.unitHead p');
    if (hint) hint.textContent = '可單選或複選；第一次開啟新版綜合頁時，預設只練 Unit 23。';
  }

  function installStyles() {
    const style = document.createElement('style');
    style.textContent = `
      .unitChoices{grid-template-columns:repeat(6,minmax(0,1fr))}
      .unit23Featured{box-shadow:inset 0 0 0 2px #2563eb}
      .unit23Button{background:#dbeafe;color:#1d4ed8}
      .unit23CourseLink{border-radius:13px;background:#2563eb;color:#fff;padding:10px 14px;text-decoration:none;font-weight:900;white-space:nowrap}
      @media(max-width:1100px){.unitChoices{grid-template-columns:repeat(5,1fr)}}
      @media(max-width:860px){.unitChoices{grid-template-columns:repeat(3,1fr)}.unitHead{align-items:center}}
      @media(max-width:520px){.unitChoices{grid-template-columns:repeat(2,1fr)}.unitHead{display:block}.unit23CourseLink{display:inline-block;margin-top:12px}.unitActions{grid-template-columns:1fr 1fr}.unitActions .primary{grid-column:1/-1}}
    `;
    document.head.appendChild(style);
  }

  const initialUnits = readUnits();
  selectedUnits = initialUnits;
  renderSelector(initialUnits);
  installCopy();
  installQuickButtons();
  installUnit23Link();
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