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
      const { Engine, Render, Runner, Bodies, Composite, Constraint, Mouse, MouseConstraint } = Matter;
  
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
          background: '#000'
        }
      });
  
      Render.run(render);
      const runner = Runner.create();
      Runner.run(runner, engine);
  
      // Boundaries
      const floor = Bodies.rectangle(400, 600, 800, 40, { isStatic: true });
      Composite.add(world, floor);
  
      let springs = [];
  
      function addSpringSystem() {
        const startX = 300;
        const startY = 100;
        const spacing = 60;
        const count = 5;
  
        const balls = [];
        for (let i = 0; i < count; i++) {
          const ball = Bodies.circle(startX + i * spacing, startY, 20, {
            restitution: 0.8,
            render: {
              fillStyle: i === 0 ? '#FF3333' : '#' + Math.floor(Math.random() * 16777215).toString(16)
            }
          });
          balls.push(ball);
        }
  
        // Add constraints (springs)
        const constraints = balls.map((ball, i) => {
          if (i === 0) {
            // Anchor the first ball
            return Constraint.create({
              pointA: { x: ball.position.x, y: ball.position.y - 50 },
              bodyB: ball,
              stiffness: 0.05,
              length: 50
            });
          } else {
            return Constraint.create({
              bodyA: balls[i - 1],
              bodyB: ball,
              stiffness: 0.05,
              length: spacing
            });
          }
        });
  
        Composite.add(world, [...balls, ...constraints]);
        springs.push(...balls, ...constraints);
      }
  
      function clearSprings() {
        for (let item of springs) {
          Composite.remove(world, item);
        }
        springs = [];
      }
  
      controlPanel.innerHTML = `
        <button id="add-spring">Add Spring System</button>
        <button id="clear">Clear</button>
      `;
  
      document.getElementById('add-spring').addEventListener('click', addSpringSystem);
      document.getElementById('clear').addEventListener('click', clearSprings);
  
      // Optional: add mouse control
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
  