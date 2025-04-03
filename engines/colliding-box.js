(function () {
  const MATTER_JS_CDN = 'https://cdnjs.cloudflare.com/ajax/libs/matter-js/0.19.0/matter.min.js';

  function loadMatterJS(callback) {
    if (typeof Matter !== 'undefined') {
      callback();
    } else {
      const script = document.createElement('script');
      script.src = MATTER_JS_CDN;
      script.onload = callback;
      document.head.appendChild(script);
    }
  }

  loadMatterJS(() => {
    const { Engine, Render, Runner, Bodies, Composite, Mouse, MouseConstraint } = Matter;

    // Clear previous content
    const rendererContainer = document.getElementById('renderer-container');
    const controlPanel = document.getElementById('control');
    rendererContainer.innerHTML = '';
    controlPanel.innerHTML = '';

    // Engine setup
    const engine = Engine.create();
    const world = engine.world;
    engine.gravity.y = 1;

    const render = Render.create({
      element: rendererContainer,
      engine: engine,
      options: {
        width: 800,
        height: 600,
        wireframes: false,
        background: '#111'
      }
    });

    Render.run(render);
    const runner = Runner.create();
    Runner.run(runner, engine);

    // World boundaries
    const boundaries = [
      Bodies.rectangle(400, 0, 800, 40, { isStatic: true }),
      Bodies.rectangle(400, 600, 800, 40, { isStatic: true }),
      Bodies.rectangle(800, 300, 40, 600, { isStatic: true }),
      Bodies.rectangle(0, 300, 40, 600, { isStatic: true })
    ];
    Composite.add(world, boundaries);

    let boxSize = 40;
    let boxRestitution = 0.6;
    let boxFriction = 0.1;
    let gravityY = 1;
    let boxes = [];

    function addBox() {
      const size = boxSize;
      const box = Bodies.rectangle(
        Math.random() * 600 + 100,
        50,
        size,
        size,
        {
          restitution: boxRestitution,
          friction: boxFriction,
          render: {
            fillStyle: '#' + Math.floor(Math.random() * 16777215).toString(16)
          }
        }
      );
      Composite.add(world, box);
      boxes.push(box);
    }

    function clearBoxes() {
      for (let box of boxes) {
        Composite.remove(world, box);
      }
      boxes = [];
    }

    // === UI Controls ===
    controlPanel.innerHTML = `
      <label>Box Size: <input type="range" min="20" max="80" value="${boxSize}" id="sizeSlider"></label><br>
      <label>Restitution: <input type="range" min="0" max="1" step="0.05" value="${boxRestitution}" id="restitutionSlider"></label><br>
      <label>Friction: <input type="range" min="0" max="0.3" step="0.01" value="${boxFriction}" id="frictionSlider"></label><br>
      <label>Gravity Y: <input type="range" min="0" max="2" step="0.1" value="${gravityY}" id="gravitySlider"></label><br><br>
      <button id="add-box">Add Box</button>
      <button id="clear">Clear</button>
    `;

    document.getElementById('sizeSlider').addEventListener('input', e => boxSize = parseFloat(e.target.value));
    document.getElementById('restitutionSlider').addEventListener('input', e => boxRestitution = parseFloat(e.target.value));
    document.getElementById('frictionSlider').addEventListener('input', e => boxFriction = parseFloat(e.target.value));
    document.getElementById('gravitySlider').addEventListener('input', e => {
      gravityY = parseFloat(e.target.value);
      engine.gravity.y = gravityY;
    });

    document.getElementById('add-box').addEventListener('click', addBox);
    document.getElementById('clear').addEventListener('click', clearBoxes);

    const mouse = Mouse.create(render.canvas);
    const mouseConstraint = MouseConstraint.create(engine, {
      mouse,
      constraint: { stiffness: 0.2, render: { visible: false } }
    });
    Composite.add(world, mouseConstraint);
    render.mouse = mouse;
  });
})();
