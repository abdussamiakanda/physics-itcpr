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
      engine.gravity.y = 1;
  
      const render = Render.create({
        element: rendererContainer,
        engine: engine,
        options: {
          width: 800,
          height: 600,
          wireframes: false,
          background: '#1a1a1a'
        }
      });
  
      Render.run(render);
      const runner = Runner.create();
      Runner.run(runner, engine);
  
      const floor = Bodies.rectangle(400, 580, 800, 40, { isStatic: true });
      Composite.add(world, floor);
  
      let dominos = [];
  
      // Default values
      let spacing = 30;
      let dominoFriction = 0.05;
      let gravityY = 1;
      let autoBall = true;
  
      function addDominoLine() {
        Composite.remove(world, dominos);
        dominos = [];
  
        engine.gravity.y = gravityY;
  
        const startX = 150;
        const startY = 500;
        const count = 20;
        const dominoWidth = 10;
        const dominoHeight = 40;
  
        for (let i = 0; i < count; i++) {
          const isFirst = i === 0;
          const domino = Bodies.rectangle(
            startX + i * spacing,
            startY,
            dominoWidth,
            dominoHeight,
            {
              angle: isFirst ? 0.2 : 0, // tilt the first
              friction: dominoFriction,
              frictionStatic: 0.01,
              frictionAir: 0.01,
              restitution: 0.1,
              density: 0.002,
              chamfer: { radius: 2 },
              render: {
                fillStyle: isFirst ? '#ff4444' : '#dddddd'
              }
            }
          );
          Composite.add(world, domino);
          dominos.push(domino);
        }
  
        if (autoBall) {
          const ball = Bodies.circle(startX - 60, startY - 100, 20, {
            restitution: 0.9,
            frictionAir: 0.002,
            render: { fillStyle: '#00ccff' }
          });
          Composite.add(world, ball);
          dominos.push(ball);
        }
      }
  
      function clearDominos() {
        for (let d of dominos) {
          Composite.remove(world, d);
        }
        dominos = [];
      }
  
      // === Control UI ===
      controlPanel.innerHTML = `
        <label>Friction: <input type="range" min="0" max="0.2" step="0.005" id="friction" value="${dominoFriction}"></label><br>
        <label>Spacing: <input type="range" min="20" max="60" step="1" id="spacing" value="${spacing}"></label><br>
        <label>Gravity Y: <input type="range" min="0" max="2" step="0.1" id="gravity" value="${gravityY}"></label><br>
        <label><input type="checkbox" id="autoBall" checked> Drop Ball</label><br><br>
        <button id="add-domino">Add Domino Line</button>
        <button id="clear">Clear</button>
      `;
  
      document.getElementById('add-domino').addEventListener('click', () => {
        spacing = parseFloat(document.getElementById('spacing').value);
        dominoFriction = parseFloat(document.getElementById('friction').value);
        gravityY = parseFloat(document.getElementById('gravity').value);
        autoBall = document.getElementById('autoBall').checked;
        addDominoLine();
      });
  
      document.getElementById('clear').addEventListener('click', clearDominos);
  
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
  