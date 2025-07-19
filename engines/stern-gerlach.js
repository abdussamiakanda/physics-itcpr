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
    const { Engine, Render, Runner, Bodies, Body, Composite, Events, Mouse, MouseConstraint } = Matter;

    const container = document.getElementById('renderer-container');
    const controlPanel = document.getElementById('control');
    container.innerHTML = '';
    controlPanel.innerHTML = '';

    const engine = Engine.create();
    const world = engine.world;
    engine.gravity.y = 0;

    const render = Render.create({
      element: container,
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

    // World boundaries
    Composite.add(world, [
      Bodies.rectangle(400, 0, 800, 40, { isStatic: true }),
      Bodies.rectangle(400, 600, 800, 40, { isStatic: true }),
      Bodies.rectangle(0, 300, 40, 600, { isStatic: true }),
      Bodies.rectangle(800, 300, 40, 600, { isStatic: true })
    ]);

    // Collimator Walls (Physical)
    const magneticWallY = 100;
    const slitX = 200;
    Composite.add(world, [
      Bodies.rectangle(slitX, 200, 200, 80, { isStatic: true, render: { fillStyle: '#ff3333' } }),
      Bodies.rectangle(slitX, 410, 200, 80, { isStatic: true, render: { fillStyle: '#444' } })
    ]);

    let particles = [];
    let hitMarkers = [];
    let magneticForceStrength = 0.00000001;

    function emitParticle(charge = 1) {
      const particle = Bodies.circle(20, 300, 5, {
        restitution: 0,
        frictionAir: 0,
        render: { fillStyle: charge > 0 ? '#ff3333' : '#3399ff' },
        label: 'particle',
        collisionFilter: {
          group: -1,
          category: 0x0002,
          mask: 0x0001
        }
      });

      particle.plugin = { polarity: charge };
      particle.trail = [];
      Body.setVelocity(particle, { x: 2, y: 0 });

      particles.push(particle);
      Composite.add(world, particle);
    }

    function clearAll() {
      particles.forEach(p => Composite.remove(world, p));
      particles = [];
      hitMarkers = [];
    }

    // Apply magnetic force when inside slit
    Events.on(engine, 'beforeUpdate', () => {
      particles.forEach(p => {
        if (p.position.x > 100 && p.position.x < 300 && p.position.y > 200 && p.position.y < 400) {
          const dy = p.position.y - magneticWallY;
          const forceY = -magneticForceStrength * p.plugin.polarity * dy;
          Body.applyForce(p, p.position, { x: 0, y: forceY });
        }
        p.trail.push({ x: p.position.x, y: p.position.y });
        if (p.trail.length > 50) p.trail.shift();
      });
    });

    // Detector hit logic
    Events.on(engine, 'collisionStart', (event) => {
      event.pairs.forEach(pair => {
        const labels = [pair.bodyA.label, pair.bodyB.label];
        if (labels.includes('detector') && labels.includes('particle')) {
          const particle = pair.bodyA.label === 'particle' ? pair.bodyA : pair.bodyB;
          hitMarkers.push({ x: particle.position.x, y: particle.position.y, color: particle.render.fillStyle });
          Composite.remove(world, particle);
          particles = particles.filter(p => p !== particle);
        }
      });
    });

    // Draw trails and hit markers
    Events.on(render, 'afterRender', () => {
      const ctx = render.context;
      particles.forEach(p => {
        ctx.beginPath();
        ctx.strokeStyle = p.render.fillStyle;
        ctx.lineWidth = 1;
        for (let i = 0; i < p.trail.length - 1; i++) {
          ctx.moveTo(p.trail[i].x, p.trail[i].y);
          ctx.lineTo(p.trail[i + 1].x, p.trail[i + 1].y);
        }
        ctx.stroke();
      });

      hitMarkers.forEach(m => {
        ctx.beginPath();
        ctx.fillStyle = m.color;
        ctx.arc(m.x, m.y, 4, 0, 2 * Math.PI);
        ctx.fill();
      });
    });

    // Controls
    controlPanel.innerHTML = `
      <button id="emit-positive">Emit +</button>
      <button id="emit-negative">Emit –</button>
      <button id="clear">Clear</button><br><br>
      <label>Magnetic Force Strength: <input type="range" min="0.00000001" max="0.00000003" step="0.000000001" value="${magneticForceStrength}" id="fieldSlider"></label>
    `;

    document.getElementById('emit-positive').onclick = () => emitParticle(1);
    document.getElementById('emit-negative').onclick = () => emitParticle(-1);
    document.getElementById('clear').onclick = clearAll;

    document.getElementById('fieldSlider').oninput = (e) => {
      magneticForceStrength = parseFloat(e.target.value);
    };

    const mouse = Mouse.create(render.canvas);
    const mouseConstraint = MouseConstraint.create(engine, {
      mouse,
      constraint: { stiffness: 0.2, render: { visible: false } }
    });
    Composite.add(world, mouseConstraint);
  });
})();
