(() => {
  'use strict';

  if (window.__comprehensiveUnit18UpgradeLoaded) return;
  window.__comprehensiveUnit18UpgradeLoaded = true;

  const TOTAL = 18;
  const STORAGE_KEY = 'vocab_selected_units_v2';
  const originalApplyUnits = applyUnits;

  function readUnits() {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
      if (Array.isArray(saved)) {
        const valid = [...new Set(saved.map(Number).filter(no => Number.isInteger(no) && no >= 1 && no <= TOTAL))].sort((a, b) => a - b);
        if (valid.length) return valid;
      }
    } catch (error) {
      console.warn('Unable to read Unit 01–18 selection', error);
    }
    return [18];
  }

  function unitText(no) {
    return `Unit ${String(no).padStart(2, '0')}`;
  }

  function renderSelector(units) {
    const container = document.querySelector('#unitChoices');
    if (!container) return;
    container.innerHTML = Array.from({length: TOTAL}, (_, index) => index + 1).map(no => `
      <label class="unitToggle${units.includes(no) ? ' selected' : ''}${no === 18 ? ' unit18Featured' : ''}">
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
    if (Array.isArray(selectedUnits) && selectedUnits.length) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(selectedUnits));
    }
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
    if (!actions || actions.querySelector('#onlyUnit18')) return;

    const early = document.createElement('button');
    early.type = 'button';
    early.className = 'smallBtn';
    early.textContent = 'Unit 01–06';
    early.onclick = () => setChecks(no => no >= 1 && no <= 6);

    const middle = document.createElement('button');
    middle.type = 'button';
    middle.className = 'smallBtn';
    middle.textContent = 'Unit 07–12';
    middle.onclick = () => setChecks(no => no >= 7 && no <= 12);

    const late = document.createElement('button');
    late.type = 'button';
    late.className = 'smallBtn';
    late.textContent = 'Unit 13–18';
    late.onclick = () => setChecks(no => no >= 13 && no <= 18);

    const only18 = document.createElement('button');
    only18.type = 'button';
    only18.id = 'onlyUnit18';
    only18.className = 'smallBtn unit18Button';
    only18.textContent = '只選 Unit 18';
    only18.onclick = () => setChecks(no => no === 18);

    actions.prepend(early, middle, late, only18);
  }

  function installUnit18Link() {
    const head = document.querySelector('.unitHead');
    if (!head || head.querySelector('.unit18CourseLink')) return;
    const link = document.createElement('a');
    link.className = 'unit18CourseLink';
    link.href = '../unit18-vocab-lab/';
    link.textContent = '查看 Unit 18 教材';
    head.appendChild(link);
  }

  function installCopy() {
    const intro = document.querySelector('.brand p');
    if (intro) intro.textContent = '自選 Unit 01～Unit 18；套用後，所有測驗模式只會從已選課別出題。';
    const hint = document.querySelector('.unitHead p');
    if (hint) hint.textContent = '可單選或複選；第一次開啟新版綜合頁時，預設只練 Unit 18。';
  }

  function installStyles() {
    const style = document.createElement('style');
    style.textContent = `
      .unitChoices{grid-template-columns:repeat(6,1fr)}
      .unit18Featured{box-shadow:inset 0 0 0 2px #2563eb}
      .unit18Button{background:#dbeafe;color:#1d4ed8}
      .unit18CourseLink{border-radius:13px;background:#2563eb;color:#fff;padding:10px 14px;text-decoration:none;font-weight:900;white-space:nowrap}
      @media(max-width:860px){.unitChoices{grid-template-columns:repeat(3,1fr)}.unitHead{align-items:center}}
      @media(max-width:520px){.unitChoices{grid-template-columns:repeat(2,1fr)}.unitHead{display:block}.unit18CourseLink{display:inline-block;margin-top:12px}.unitActions{grid-template-columns:1fr 1fr}.unitActions .primary{grid-column:1/-1}}
    `;
    document.head.appendChild(style);
  }

  const initialUnits = readUnits();
  selectedUnits = initialUnits;
  renderSelector(initialUnits);
  installCopy();
  installQuickButtons();
  installUnit18Link();
  installStyles();

  const loadUnit18Selection = () => {
    if (typeof loading !== 'undefined' && loading) {
      window.setTimeout(loadUnit18Selection, 80);
      return;
    }
    applyUnits(initialUnits);
  };
  loadUnit18Selection();
})();
