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
          background: '#0a0a0a'
        }
      });
  
      Render.run(render);
      const runner = Runner.create();
      Runner.run(runner, engine);
  
      // Ground
      const ground = Bodies.rectangle(400, 580, 800, 40, { isStatic: true });
      Composite.add(world, ground);
  
      let ropeBodies = [];
  
      function addRope() {
        const startX = 400;
        const startY = 100;
        const segments = 15;
        const segmentLength = 20;
  
        const prevBodies = [];
        for (let i = 0; i < segments; i++) {
          const ball = Bodies.circle(startX, startY + i * segmentLength, 8, {
            restitution: 0.3,
            friction: 0.01,
            density: 0.002,
            render: { fillStyle: '#eeeeee' }
          });
          ropeBodies.push(ball);
          Composite.add(world, ball);
  
          if (i > 0) {
            const constraint = Constraint.create({
              bodyA: prevBodies[i - 1],
              bodyB: ball,
              length: segmentLength,
              stiffness: 0.9
            });
            Composite.add(world, constraint);
          }
          prevBodies.push(ball);
        }
  
        // Anchor top
        const anchor = Constraint.create({
          pointA: { x: startX, y: startY - 20 },
          bodyB: ropeBodies[0],
          length: 10,
          stiffness: 1
        });
        Composite.add(world, anchor);
      }
  
      function clearRope() {
        for (let item of ropeBodies) {
          Composite.remove(world, item);
        }
        ropeBodies = [];
      }
  
      controlPanel.innerHTML = `
        <button id="add-rope">Add Rope</button>
        <button id="clear">Clear</button>
      `;
  
      document.getElementById('add-rope').addEventListener('click', addRope);
      document.getElementById('clear').addEventListener('click', clearRope);
  
      const mouse = Mouse.create(render.canvas);
      const mouseConstraint = MouseConstraint.create(engine, {
        mouse,
        constraint: {
          stiffness: 0.2,
          render: { visible: false }
        }
      });
      Composite.add(world, mouseConstraint);
      render.mouse = mouse;
    });
  })();
  