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
      const { Engine, Render, Runner, Bodies, Composite, Vector, Body, Events } = Matter;
  
      const rendererContainer = document.getElementById('renderer-container');
      const controlPanel = document.getElementById('control');
      rendererContainer.innerHTML = '';
      controlPanel.innerHTML = '';
  
      const engine = Engine.create();
      const world = engine.world;
      engine.gravity.scale = 0;
  
      const render = Render.create({
        element: rendererContainer,
        engine: engine,
        options: {
          width: 800,
          height: 600,
          wireframes: false,
          background: 'black'
        }
      });
  
      Render.run(render);
      const runner = Runner.create();
      Runner.run(runner, engine);
  
      // === Default controls
      let sunMass = 10000;
      let planetMass = 10;
      let gravityConstant = 0.0001;
      let speedMultiplier = 20;
  
      // === Sun
      const sun = Bodies.circle(400, 300, 30, {
        isStatic: true,
        plugin: { gravityMass: sunMass },
        render: { fillStyle: 'yellow' }
      });
      Composite.add(world, sun);
  
      const planets = [];
      const trails = new Map(); // { id: { path: [], color: string } }
      const trailCtx = render.context;
      const trailLength = 50;
  
      function addPlanet() {
        const distance = Math.random() * 200 + 100;
        const angle = Math.random() * Math.PI * 2;
        const radius = Math.random() * 10 + 5;
  
        const x = sun.position.x + distance * Math.cos(angle);
        const y = sun.position.y + distance * Math.sin(angle);
        const color = `hsl(${Math.floor(Math.random() * 360)}, 100%, 60%)`;
  
        const planet = Bodies.circle(x, y, radius, {
          mass: planetMass,
          frictionAir: 0,
          friction: 0,
          restitution: 1,
          render: {
            fillStyle: color
          }
        });
  
        const dir = Vector.perp(Vector.normalise(Vector.sub(sun.position, planet.position)));
        const speed = Math.sqrt(gravityConstant * sunMass / distance) * speedMultiplier;
        Body.setVelocity(planet, {
          x: dir.x * speed,
          y: dir.y * speed
        });
  
        Composite.add(world, planet);
        planets.push(planet);
        trails.set(planet.id, { path: [], color });
      }
  
      function clearPlanets() {
        for (const p of planets) {
          Composite.remove(world, p);
          trails.delete(p.id);
        }
        planets.length = 0;
      }
  
      // Gravity logic
      Events.on(engine, 'beforeUpdate', () => {
        sun.plugin.gravityMass = sunMass;
  
        for (const planet of planets) {
          if (!planet || !planet.position) continue;
  
          const dx = sun.position.x - planet.position.x;
          const dy = sun.position.y - planet.position.y;
          const distanceSq = dx * dx + dy * dy;
          const distance = Math.sqrt(distanceSq);
  
          if (distance < 5 || isNaN(distance)) continue;
  
          const forceMagnitude = (gravityConstant * sun.plugin.gravityMass * planet.mass) / distanceSq;
          const force = {
            x: (dx / distance) * forceMagnitude,
            y: (dy / distance) * forceMagnitude
          };
          Body.applyForce(planet, planet.position, force);
  
          const trail = trails.get(planet.id);
          if (trail) {
            trail.path.push({ x: planet.position.x, y: planet.position.y });
            if (trail.path.length > trailLength) trail.path.shift();
          }
        }
      });
  
      // Trail rendering
      Events.on(render, 'afterRender', () => {
        for (const [id, trailData] of trails.entries()) {
          const path = trailData.path;
          if (!path || path.length < 2) continue;
  
          for (let i = 1; i < path.length; i++) {
            const prev = path[i - 1];
            const curr = path[i];
            const alpha = i / path.length;
  
            trailCtx.beginPath();
            trailCtx.moveTo(prev.x, prev.y);
            trailCtx.lineTo(curr.x, curr.y);
            trailCtx.strokeStyle = `rgba(${hexToRgb(trailData.color)}, ${alpha})`;
            trailCtx.lineWidth = 1;
            trailCtx.stroke();
          }
        }
      });
  
      // Convert hsl/hex to RGB
      function hexToRgb(hexOrHsl) {
        const ctx = document.createElement('canvas').getContext('2d');
        ctx.fillStyle = hexOrHsl;
        document.body.appendChild(ctx.canvas);
        const rgb = window.getComputedStyle(ctx.canvas).color.match(/\d+/g).slice(0, 3).join(',');
        ctx.canvas.remove();
        return rgb;
      }
  
      // === Control Panel UI ===
      controlPanel.innerHTML = `
        <label>Sun Mass: <input type="range" min="1000" max="50000" step="500" value="${sunMass}" id="sunMass"></label><br>
        <label>Planet Mass: <input type="range" min="1" max="50" step="1" value="${planetMass}" id="planetMass"></label><br>
        <label>Gravity Constant: <input type="range" min="0.00001" max="0.001" step="0.00001" value="${gravityConstant}" id="gravityConst"></label><br>
        <label>Speed Multiplier: <input type="range" min="1" max="40" step="1" value="${speedMultiplier}" id="speedMult"></label><br><br>
        <button id="add-planet">Add Planet</button>
        <button id="clear">Clear</button>
      `;
  
      document.getElementById('sunMass').addEventListener('input', e => sunMass = parseFloat(e.target.value));
      document.getElementById('planetMass').addEventListener('input', e => planetMass = parseFloat(e.target.value));
      document.getElementById('gravityConst').addEventListener('input', e => gravityConstant = parseFloat(e.target.value));
      document.getElementById('speedMult').addEventListener('input', e => speedMultiplier = parseFloat(e.target.value));
  
      document.getElementById('add-planet').addEventListener('click', addPlanet);
      document.getElementById('clear').addEventListener('click', clearPlanets);
    });
  })();
  