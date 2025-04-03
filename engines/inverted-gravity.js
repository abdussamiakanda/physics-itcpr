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
      const { Engine, Render, Runner, Bodies, Composite, Body, Events, Mouse, MouseConstraint } = Matter;
  
      const rendererContainer = document.getElementById('renderer-container');
      const controlPanel = document.getElementById('control');
      rendererContainer.innerHTML = '';
      controlPanel.innerHTML = '';
  
      const engine = Engine.create();
      const world = engine.world;
  
      const render = Render.create({
        element: rendererContainer,
        engine: engine,
        options: {
          width: 800,
          height: 600,
          wireframes: false,
          background: '#0c0c0c'
        }
      });
  
      Render.run(render);
      const runner = Runner.create();
      Runner.run(runner, engine);
  
      // Boundaries
      const walls = [
        Bodies.rectangle(400, 0, 800, 40, { isStatic: true }),   // top
        Bodies.rectangle(400, 600, 800, 40, { isStatic: true }), // bottom
        Bodies.rectangle(0, 300, 40, 600, { isStatic: true }),   // left
        Bodies.rectangle(800, 300, 40, 600, { isStatic: true })  // right
      ];
      Composite.add(world, walls);
  
      // Defaults
      let gravityX = 0;
      let gravityY = 1;
      let friction = 0.1;
      let restitution = 0.6;
      let boxes = [];
  
      function addBox() {
        const size = Math.random() * 40 + 20;
        const box = Bodies.rectangle(
          Math.random() * 600 + 100,
          Math.random() * 300 + 100,
          size,
          size,
          {
            friction,
            restitution,
            render: {
              fillStyle: '#' + Math.floor(Math.random() * 16777215).toString(16)
            }
          }
        );
        Composite.add(world, box);
        boxes.push(box);
      }
  
      function clearBoxes() {
        for (const b of boxes) {
          Composite.remove(world, b);
        }
        boxes = [];
      }
  
      Events.on(engine, 'beforeUpdate', () => {
        engine.gravity.x = gravityX;
        engine.gravity.y = gravityY;
      });
  
      // UI
      controlPanel.innerHTML = `
        <label>Gravity X: <input type="range" min="-1" max="1" step="0.1" value="${gravityX}" id="gravityX"></label><br>
        <label>Gravity Y: <input type="range" min="-1" max="1" step="0.1" value="${gravityY}" id="gravityY"></label><br>
        <label>Friction: <input type="range" min="0" max="1" step="0.05" value="${friction}" id="frictionSlider"></label><br>
        <label>Restitution: <input type="range" min="0" max="1" step="0.05" value="${restitution}" id="restitutionSlider"></label><br><br>
        <button id="add-box">Add Box</button>
        <button id="clear">Clear</button>
      `;
  
      document.getElementById('gravityX').addEventListener('input', e => gravityX = parseFloat(e.target.value));
      document.getElementById('gravityY').addEventListener('input', e => gravityY = parseFloat(e.target.value));
      document.getElementById('frictionSlider').addEventListener('input', e => friction = parseFloat(e.target.value));
      document.getElementById('restitutionSlider').addEventListener('input', e => restitution = parseFloat(e.target.value));
  
      document.getElementById('add-box').addEventListener('click', addBox);
      document.getElementById('clear').addEventListener('click', clearBoxes);
  
      const mouse = Mouse.create(render.canvas);
      const mouseConstraint = MouseConstraint.create(engine, {
        mouse,
        constraint: {
          stiffness: 0.1,
          render: { visible: false }
        }
      });
      Composite.add(world, mouseConstraint);
      render.mouse = mouse;
    });
  })();
  