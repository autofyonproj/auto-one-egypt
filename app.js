(() => {
  const STORAGE_KEY = 'auto-one-egypt-social-prototype-v1';
  const platforms = [
    { id: 'facebook', label: 'Facebook' },
    { id: 'instagram', label: 'Instagram' },
    { id: 'youtube', label: 'YouTube' },
    { id: 'tiktok', label: 'TikTok' },
    { id: 'whatsapp', label: 'WhatsApp' },
    { id: 'telegram', label: 'Telegram' },
    { id: 'linkedin', label: 'LinkedIn' },
    { id: 'x', label: 'X' },
    { id: 'snapchat', label: 'Snapchat' },
    { id: 'threads', label: 'Threads' },
    { id: 'pinterest', label: 'Pinterest' },
  ];
  const cars = [
    { id: 'tucson-nx4-turbo', name: 'Hyundai Tucson NX4 Turbo' },
    { id: 'corolla-gr-sport', name: 'Toyota Corolla GR Sport' },
    { id: 'lexus-nx-350-f-sport', name: 'Lexus NX 350 F-Sport' },
  ];

  const blankLinks = () => Object.fromEntries(platforms.map(({ id }) => [id, { url: '', visible: false }]));
  const defaultState = () => ({
    main: blankLinks(),
    cars: Object.fromEntries(cars.map(({ id }) => [id, blankLinks()])),
    customPlatforms: [],
  });

  function readState() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (!saved) return defaultState();
      const parsed = JSON.parse(saved);
      const base = defaultState();
      return {
        ...base,
        ...parsed,
        main: { ...base.main, ...(parsed.main || {}) },
        cars: Object.fromEntries(cars.map(({ id }) => [id, { ...base.cars[id], ...(parsed.cars?.[id] || {}) }])),
        customPlatforms: Array.isArray(parsed.customPlatforms) ? parsed.customPlatforms : [],
      };
    } catch {
      return defaultState();
    }
  }

  let state = readState();
  let activeScope = 'main';
  let activeCar = cars[0].id;
  const mainEditor = document.querySelector('#main-editor');
  const carEditor = document.querySelector('#car-editor');
  const mainPreview = document.querySelector('#main-preview');
  const carPreview = document.querySelector('#car-preview');
  const previewCarSelect = document.querySelector('#preview-car');
  const editCarSelect = document.querySelector('#edit-car');
  const saveStatus = document.querySelector('#save-status');

  function allPlatforms() {
    return [...platforms, ...state.customPlatforms];
  }

  function save() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    saveStatus.textContent = 'Saved in this browser only. Not published to autonegypt.com.';
    renderPreviews();
  }

  function scopeLinks(scope) {
    return scope === 'main' ? state.main : state.cars[activeCar];
  }

  function makeLinkRow(platform, links) {
    const value = links[platform.id] || { url: '', visible: false };
    const row = document.createElement('div');
    row.className = 'link-row';

    const meta = document.createElement('div');
    meta.className = 'link-meta';
    const title = document.createElement('strong');
    title.textContent = platform.label;
    const hint = document.createElement('small');
    hint.textContent = 'Add a public profile or contact URL';
    meta.append(title, hint);

    const form = document.createElement('div');
    form.className = 'form-row';
    const input = document.createElement('input');
    input.type = 'url';
    input.placeholder = 'https://…';
    input.value = value.url || '';
    input.setAttribute('aria-label', `${platform.label} URL`);
    input.autocomplete = 'url';
    input.addEventListener('change', () => {
      links[platform.id] = { ...value, url: input.value.trim() };
      save();
    });

    const label = document.createElement('label');
    label.className = 'visibility';
    const toggle = document.createElement('input');
    toggle.type = 'checkbox';
    toggle.checked = Boolean(value.visible);
    toggle.addEventListener('change', () => {
      links[platform.id] = { ...value, url: input.value.trim(), visible: toggle.checked };
      save();
    });
    label.append(toggle, document.createTextNode('Show on page'));
    form.append(input, label);
    row.append(meta, form);
    return row;
  }

  function renderEditor() {
    const root = activeScope === 'main' ? mainEditor : carEditor;
    root.replaceChildren();
    const links = scopeLinks(activeScope);
    allPlatforms().forEach((platform) => root.append(makeLinkRow(platform, links)));

    const add = document.createElement('form');
    add.className = 'add-platform';
    const heading = document.createElement('strong');
    heading.textContent = 'Add another platform';
    const formRow = document.createElement('div');
    formRow.className = 'form-row';
    const name = document.createElement('input');
    name.type = 'text';
    name.placeholder = 'Platform name';
    name.maxLength = 40;
    name.required = true;
    name.setAttribute('aria-label', 'New platform name');
    const url = document.createElement('input');
    url.type = 'url';
    url.placeholder = 'https://…';
    url.setAttribute('aria-label', 'New platform URL');
    const addButton = document.createElement('button');
    addButton.type = 'submit';
    addButton.textContent = 'Add platform';
    formRow.append(name, url, addButton);
    add.append(heading, formRow);
    add.addEventListener('submit', (event) => {
      event.preventDefault();
      const label = name.value.trim();
      if (!label) return;
      const id = `custom-${label.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${Date.now()}`;
      state.customPlatforms.push({ id, label });
      links[id] = { url: url.value.trim(), visible: false };
      save();
      renderEditor();
    });
    root.append(add);
  }

  function renderOnePreview(target, links) {
    target.replaceChildren();
    const visible = allPlatforms()
      .filter(({ id }) => links[id]?.visible && links[id]?.url)
      .map(({ id, label }) => ({ id, label, url: links[id].url }));
    if (!visible.length) {
      const message = document.createElement('span');
      message.className = 'empty';
      message.textContent = 'No visible social links configured.';
      target.append(message);
      return;
    }
    visible.forEach(({ label, url }) => {
      const anchor = document.createElement('a');
      anchor.className = 'social-link';
      anchor.href = url;
      anchor.target = '_blank';
      anchor.rel = 'noopener noreferrer';
      anchor.textContent = label;
      target.append(anchor);
    });
  }

  function renderPreviews() {
    renderOnePreview(mainPreview, state.main);
    renderOnePreview(carPreview, state.cars[previewCarSelect.value] || {});
    document.querySelector('#car-preview-title').textContent =
      cars.find(({ id }) => id === previewCarSelect.value)?.name || 'Car';
  }

  function fillCarSelect(select) {
    select.replaceChildren();
    cars.forEach(({ id, name }) => {
      const option = document.createElement('option');
      option.value = id;
      option.textContent = name;
      select.append(option);
    });
  }

  fillCarSelect(previewCarSelect);
  fillCarSelect(editCarSelect);
  previewCarSelect.addEventListener('change', renderPreviews);
  editCarSelect.addEventListener('change', () => {
    activeCar = editCarSelect.value;
    renderEditor();
  });

  document.querySelectorAll('.tab').forEach((tab) => {
    tab.addEventListener('click', () => {
      activeScope = tab.dataset.scope;
      document.querySelectorAll('.tab').forEach((item) => {
        const selected = item === tab;
        item.classList.toggle('is-active', selected);
        item.setAttribute('aria-selected', String(selected));
      });
      document.querySelector('#main-panel').hidden = activeScope !== 'main';
      document.querySelector('#car-panel').hidden = activeScope !== 'car';
      renderEditor();
    });
  });

  renderEditor();
  renderPreviews();
})();
