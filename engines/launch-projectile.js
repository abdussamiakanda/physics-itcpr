(function () {
    const MATTER_JS_CDN =
      "https://cdnjs.cloudflare.com/ajax/libs/matter-js/0.19.0/matter.min.js";

    function loadMatterJS(callback) {
      if (typeof Matter !== "undefined") {
        callback();
      } else {
        const script = document.createElement("script");
        script.src = MATTER_JS_CDN;
        script.onload = callback;
        document.head.appendChild(script);
      }
    }

    loadMatterJS(() => {
      const {
        Engine,
        Render,
        Runner,
        Bodies,
        Composite,
        Body,
        Events,
        Mouse,
        MouseConstraint,
        Vector
      } = Matter;

      const rendererContainer = document.getElementById("renderer-container");
      const controlPanel = document.getElementById("control");
      rendererContainer.innerHTML = "";
      controlPanel.innerHTML = "";

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
          background: "#111"
        }
      });

      Render.run(render);
      const runner = Runner.create();
      Runner.run(runner, engine);

      // Ground
      const ground = Bodies.rectangle(400, 590, 800, 20, { isStatic: true, render: { fillStyle: "#444" } });
      Composite.add(world, ground);

      const projectiles = [];

      // Launch projectile with angle and velocity
      function launchProjectile(angleDeg, speed) {
        const angleRad = (angleDeg * Math.PI) / 180;
        const radius = 10;
        const startX = 100;
        const startY = 500;

        const projectile = Bodies.circle(startX, startY, radius, {
          restitution: 0.6,
          frictionAir: 0.0,
          render: { fillStyle: "#00ccff" }
        });

        const velocity = {
          x: speed * Math.cos(angleRad),
          y: -speed * Math.sin(angleRad)
        };

        Body.setVelocity(projectile, velocity);
        Composite.add(world, projectile);
        projectiles.push(projectile);
      }

      function clearProjectiles() {
        for (const p of projectiles) {
          Composite.remove(world, p);
        }
        projectiles.length = 0;
      }

      // Controls
      controlPanel.innerHTML = `
        <label>Angle (degrees): <span id="angleVal">45</span>
          <input type="range" id="angleInput" min="0" max="90" value="45"></label><br>
        <label>Initial Velocity: <span id="velocityVal">20</span>
          <input type="range" id="velocityInput" min="1" max="100" value="20"></label><br>
        <button id="launch">Launch Projectile</button>
        <button id="clear">Clear</button>
      `;

      const angleInput = document.getElementById("angleInput");
      const velocityInput = document.getElementById("velocityInput");
      const angleVal = document.getElementById("angleVal");
      const velocityVal = document.getElementById("velocityVal");

      angleInput.oninput = () => angleVal.textContent = angleInput.value;
      velocityInput.oninput = () => velocityVal.textContent = velocityInput.value;

      document.getElementById("launch").onclick = () => {
        const angle = parseFloat(angleInput.value);
        const velocity = parseFloat(velocityInput.value);
        launchProjectile(angle, velocity);
      };

      document.getElementById("clear").onclick = clearProjectiles;

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
