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
      const { Engine, Render, Runner, Bodies, Composite, Body, Events, Vector, Mouse, MouseConstraint } = Matter;
  
      const rendererContainer = document.getElementById('renderer-container');
      const controlPanel = document.getElementById('control');
      rendererContainer.innerHTML = '';
      controlPanel.innerHTML = '';
  
      const engine = Engine.create();
      const world = engine.world;
      engine.gravity.y = 0;
  
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
  
      // === Magnetic control values
      let polarityToAdd = 1; // +1 or -1
      let fieldStrength = 0.005;
      let particleRadius = 15;
      let gravityEnabled = false;
  
      const particles = [];
  
      function addParticle() {
        const x = Math.random() * 600 + 100;
        const y = Math.random() * 400 + 100;
        const charge = polarityToAdd;
  
        const body = Bodies.circle(x, y, particleRadius, {
          frictionAir: 0.01,
          render: {
            fillStyle: charge > 0 ? '#ff3333' : '#3399ff'
          }
        });
  
        body.plugin = { polarity: charge };
        Composite.add(world, body);
        particles.push(body);
      }
  
      function clearParticles() {
        for (const p of particles) {
          Composite.remove(world, p);
        }
        particles.length = 0;
      }
  
      // Magnetic force logic
      Events.on(engine, 'beforeUpdate', () => {
        engine.gravity.y = gravityEnabled ? 1 : 0;
  
        for (let i = 0; i < particles.length; i++) {
          for (let j = i + 1; j < particles.length; j++) {
            const a = particles[i];
            const b = particles[j];
  
            const dx = b.position.x - a.position.x;
            const dy = b.position.y - a.position.y;
            const distSq = dx * dx + dy * dy;
            const distance = Math.sqrt(distSq);
  
            if (distance < 5 || isNaN(distance)) continue;
  
            const polarityProduct = a.plugin.polarity * b.plugin.polarity;
            const forceMagnitude = (fieldStrength * polarityProduct) / distSq;
  
            const fx = (dx / distance) * forceMagnitude;
            const fy = (dy / distance) * forceMagnitude;
  
            // Apply opposite forces
            Body.applyForce(a, a.position, { x: -fx, y: -fy });
            Body.applyForce(b, b.position, { x: fx, y: fy });
          }
        }
      });
  
      // UI
      controlPanel.innerHTML = `
        <label>Field Strength: <input type="range" min="0.00001" max="1" step="0.001" value="${fieldStrength}" id="fieldSlider"></label><br>
        <label>Particle Size: <input type="range" min="5" max="40" step="1" value="${particleRadius}" id="radiusSlider"></label><br>
        <label><input type="checkbox" id="gravityToggle"> Gravity</label><br><br>
        <button id="add-positive">Add +</button>
        <button id="add-negative">Add –</button>
        <button id="clear">Clear</button>
      `;
  
      document.getElementById('fieldSlider').addEventListener('input', e => fieldStrength = parseFloat(e.target.value));
      document.getElementById('radiusSlider').addEventListener('input', e => particleRadius = parseFloat(e.target.value));
      document.getElementById('gravityToggle').addEventListener('change', e => gravityEnabled = e.target.checked);
  
      document.getElementById('add-positive').addEventListener('click', () => {
        polarityToAdd = 1;
        addParticle();
      });
  
      document.getElementById('add-negative').addEventListener('click', () => {
        polarityToAdd = -1;
        addParticle();
      });
  
      document.getElementById('clear').addEventListener('click', clearParticles);
  
      // Mouse drag support
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
  