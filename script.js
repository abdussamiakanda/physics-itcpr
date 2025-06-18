const engines = [
    'solar-system',
    'orbital-gravity',
    'magnetic-fields',
    'electric-field-visualizer',
    'two-balls',
    // 'soap-bubbles',
    'car-collision',
    'launch-projectile',
    'colliding-box',
    'gravity-balls',
    'spring-system',
    'rope-chain',
    'domino-fall',
    'fluid-particles',
    'inverted-gravity',
];

const select = document.getElementById('componentSelect');
let currentScript = null;

// Populate the dropdown
engines.forEach(engine => {
  const option = document.createElement('option');
  option.value = engine;
  option.textContent = engine.replace(/-/g, ' ');
  select.appendChild(option);
});

// Load the selected engine
select.addEventListener('change', () => {
  if (currentScript) {
    currentScript.remove(); // remove old engine
  }

  // Clear renderer and control container
  document.getElementById('renderer-container').innerHTML = '';
  document.getElementById('control').innerHTML = '';

  const selectedEngine = select.value;
  const script = document.createElement('script');
  script.src = `engines/${selectedEngine}.js`;
  script.id = 'dynamicEngineScript';
  document.body.appendChild(script);
  currentScript = script;
});

// Optional: load first engine by default
select.value = engines[0];
select.dispatchEvent(new Event('change'));
