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
  
      const rendererContainer = document.getElementById('renderer-container');
      const controlPanel = document.getElementById('control');
      rendererContainer.innerHTML = '';
      controlPanel.innerHTML = '';
  
      const engine = Engine.create();
      const world = engine.world;
      engine.gravity.y = 0.6;
  
      const render = Render.create({
        element: rendererContainer,
        engine: engine,
        options: {
          width: 800,
          height: 600,
          wireframes: false,
          background: '#000022'
        }
      });
  
      Render.run(render);
      const runner = Runner.create();
      Runner.run(runner, engine);
  
      const walls = [
        Bodies.rectangle(400, 0, 800, 40, { isStatic: true }),
        Bodies.rectangle(400, 600, 800, 40, { isStatic: true }),
        Bodies.rectangle(0, 300, 40, 600, { isStatic: true }),
        Bodies.rectangle(800, 300, 40, 600, { isStatic: true })
      ];
      Composite.add(world, walls);
  
      let particles = [];
  
      // Default settings
      let particleRadius = 8;
      let restitution = 0.6;
      let friction = 0.01;
      let gravityY = 0.6;
      let cols = 20;
      let rows = 10;
  
      function addFluidParticles() {
        Composite.remove(world, particles);
        particles = [];
  
        const startX = 200;
        const startY = 100;
        const spacing = particleRadius * 2 + 1;
  
        engine.gravity.y = gravityY;
  
        for (let y = 0; y < rows; y++) {
          for (let x = 0; x < cols; x++) {
            const px = startX + x * spacing;
            const py = startY + y * spacing;
            const particle = Bodies.circle(px, py, particleRadius, {
              restitution,
              friction,
              density: 0.001,
              render: {
                fillStyle: `hsl(${(x * y * 3) % 360}, 80%, 60%)`
              }
            });
            Composite.add(world, particle);
            particles.push(particle);
          }
        }
      }
  
      function clearParticles() {
        for (let p of particles) {
          Composite.remove(world, p);
        }
        particles = [];
      }
  
      // UI
      controlPanel.innerHTML = `
        <label>Particle Size: <input type="range" id="radiusSlider" min="4" max="20" value="${particleRadius}"></label><br>
        <label>Restitution: <input type="range" id="restitutionSlider" min="0" max="1" step="0.05" value="${restitution}"></label><br>
        <label>Friction: <input type="range" id="frictionSlider" min="0" max="0.1" step="0.005" value="${friction}"></label><br>
        <label>Gravity Y: <input type="range" id="gravitySlider" min="0" max="2" step="0.1" value="${gravityY}"></label><br>
        <label>Cols: <input type="range" id="colsSlider" min="5" max="40" value="${cols}"></label><br>
        <label>Rows: <input type="range" id="rowsSlider" min="5" max="30" value="${rows}"></label><br><br>
        <button id="add-particles">Add Fluid Particles</button>
        <button id="clear">Clear</button>
      `;
  
      // Event bindings
      document.getElementById('radiusSlider').addEventListener('input', e => particleRadius = parseFloat(e.target.value));
      document.getElementById('restitutionSlider').addEventListener('input', e => restitution = parseFloat(e.target.value));
      document.getElementById('frictionSlider').addEventListener('input', e => friction = parseFloat(e.target.value));
      document.getElementById('gravitySlider').addEventListener('input', e => gravityY = parseFloat(e.target.value));
      document.getElementById('colsSlider').addEventListener('input', e => cols = parseInt(e.target.value));
      document.getElementById('rowsSlider').addEventListener('input', e => rows = parseInt(e.target.value));
  
      document.getElementById('add-particles').addEventListener('click', addFluidParticles);
      document.getElementById('clear').addEventListener('click', clearParticles);
  
      // Mouse drag
      const mouse = Mouse.create(render.canvas);
      const mouseConstraint = MouseConstraint.create(engine, {
        mouse,
        constraint: { stiffness: 0.2, render: { visible: false } }
      });
      Composite.add(world, mouseConstraint);
      render.mouse = mouse;
    });
  })();
