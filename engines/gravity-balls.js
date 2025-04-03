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
  
      // Setup engine and world
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
          background: '#000'
        }
      });
  
      Render.run(render);
      const runner = Runner.create();
      Runner.run(runner, engine);
  
      // Boundaries
      const ground = Bodies.rectangle(400, 600, 800, 40, { isStatic: true });
      const leftWall = Bodies.rectangle(0, 300, 40, 600, { isStatic: true });
      const rightWall = Bodies.rectangle(800, 300, 40, 600, { isStatic: true });
      Composite.add(world, [ground, leftWall, rightWall]);
  
      let balls = [];
  
      // Default control values
      let ballSize = 25;
      let restitution = 0.9;
      let friction = 0.01;
      let gravityY = 1;
  
      function addBall() {
        const radius = ballSize;
        const ball = Bodies.circle(
          Math.random() * 600 + 100,
          50,
          radius,
          {
            restitution,
            friction,
            render: {
              fillStyle: '#' + Math.floor(Math.random() * 16777215).toString(16)
            }
          }
        );
        Composite.add(world, ball);
        balls.push(ball);
      }
  
      function clearBalls() {
        for (let b of balls) {
          Composite.remove(world, b);
        }
        balls = [];
      }
  
      // Control panel UI
      controlPanel.innerHTML = `
        <label>Ball Size: <input type="range" id="sizeSlider" min="10" max="50" value="${ballSize}"></label><br>
        <label>Restitution: <input type="range" id="restitutionSlider" min="0" max="1" step="0.05" value="${restitution}"></label><br>
        <label>Friction: <input type="range" id="frictionSlider" min="0" max="0.1" step="0.005" value="${friction}"></label><br>
        <label>Gravity Y: <input type="range" id="gravitySlider" min="0" max="2" step="0.1" value="${gravityY}"></label><br><br>
        <button id="add-ball">Add Ball</button>
        <button id="clear">Clear</button>
      `;
  
      // Update control values on change
      document.getElementById('sizeSlider').addEventListener('input', e => ballSize = parseFloat(e.target.value));
      document.getElementById('restitutionSlider').addEventListener('input', e => restitution = parseFloat(e.target.value));
      document.getElementById('frictionSlider').addEventListener('input', e => friction = parseFloat(e.target.value));
      document.getElementById('gravitySlider').addEventListener('input', e => {
        gravityY = parseFloat(e.target.value);
        engine.gravity.y = gravityY;
      });
  
      document.getElementById('add-ball').addEventListener('click', addBall);
      document.getElementById('clear').addEventListener('click', clearBalls);
  
      // Optional mouse control
      const mouse = Mouse.create(render.canvas);
      const mouseConstraint = MouseConstraint.create(engine, {
        mouse,
        constraint: { stiffness: 0.2, render: { visible: false } }
      });
      Composite.add(world, mouseConstraint);
      render.mouse = mouse;
    });
  })();
  