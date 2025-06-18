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
        Mouse,
        MouseConstraint
      } = Matter;
  
      const rendererContainer = document.getElementById("renderer-container");
      const controlPanel = document.getElementById("control");
      let infoPanel = document.getElementById("info-panel");
  
      rendererContainer.innerHTML = "";
      controlPanel.innerHTML = "";
  
      // Info panel setup
      if (!infoPanel) {
        infoPanel = document.createElement("div");
        infoPanel.id = "info-panel";
        document.body.appendChild(infoPanel);
      }
      Object.assign(infoPanel.style, {
        position: "absolute",
        top: "10px",
        right: "20px",
        color: "white",
        background: "rgba(0,0,0,0.7)",
        border: "1px solid #444",
        padding: "10px",
        fontFamily: "monospace",
        fontSize: "13px",
        borderRadius: "8px",
        maxWidth: "260px"
      });
  
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
          background: "#111"
        }
      });
  
      Render.run(render);
      const runner = Runner.create();
      Runner.run(runner, engine);
  
      const ground = Bodies.rectangle(400, 590, 800, 20, {
        isStatic: true,
        render: { fillStyle: "#444" }
      });
  
      const wallLeft = Bodies.rectangle(0, 300, 20, 600, {
        isStatic: true,
        render: { fillStyle: "#444" }
      });
  
      const wallRight = Bodies.rectangle(800, 300, 20, 600, {
        isStatic: true,
        render: { fillStyle: "#444" }
      });
  
      Composite.add(world, [ground, wallLeft, wallRight]);
  
      let ball1, ball2;
      let dropTime = null;
      let vx = 5;
      let g = 1;
  
      function addStaticBalls() {
        ball1 = Bodies.circle(30, 20, 15, {
          isStatic: true,
          render: { fillStyle: "#ff6666" }
        });
  
        ball2 = Bodies.circle(65, 20, 15, {
          isStatic: true,
          render: { fillStyle: "#66ccff" }
        });
  
        Composite.add(world, [ball1, ball2]);
      }
  
      function removeBalls() {
        if (ball1) Composite.remove(world, ball1);
        if (ball2) Composite.remove(world, ball2);
      }
  
      addStaticBalls();
  
      controlPanel.innerHTML = `
        <label>Gravity (g): <span id="gVal">1</span>
          <input type="range" id="gInput" min="0" max="2" step="0.1" value="1">
        </label><br>
        <label>Initial X Velocity: <span id="vxVal">5</span>
          <input type="range" id="vxInput" min="0" max="10" step="0.5" value="5">
        </label><br>
        <button id="drop">Drop Balls</button>
        <button id="reset" style="display:none;">Reset</button>
      `;
  
      const gInput = document.getElementById("gInput");
      const vxInput = document.getElementById("vxInput");
      const gVal = document.getElementById("gVal");
      const vxVal = document.getElementById("vxVal");
      const dropBtn = document.getElementById("drop");
      const resetBtn = document.getElementById("reset");
  
      gInput.oninput = () => {
        g = parseFloat(gInput.value);
        gVal.textContent = g;
      };
  
      vxInput.oninput = () => {
        vx = parseFloat(vxInput.value);
        vxVal.textContent = vx;
      };
  
      dropBtn.onclick = () => {
        removeBalls();
        engine.gravity.y = g;
  
        ball1 = Bodies.circle(30, 20, 15, {
          restitution: 0.6,
          render: { fillStyle: "#ff6666" }
        });
  
        ball2 = Bodies.circle(65, 20, 15, {
          restitution: 0.6,
          render: { fillStyle: "#66ccff" }
        });
  
        Body.setVelocity(ball2, { x: vx, y: 0 });
  
        Composite.add(world, [ball1, ball2]);
  
        dropBtn.style.display = "none";
        resetBtn.style.display = "inline-block";
  
        dropTime = performance.now();
      };
  
      resetBtn.onclick = () => {
        removeBalls();
        engine.gravity.y = 0;
        addStaticBalls();
  
        resetBtn.style.display = "none";
        dropBtn.style.display = "inline-block";
        dropTime = null;
      };
  
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
  
      // Update info panel
      setInterval(() => {
        const t = dropTime ? ((performance.now() - dropTime) / 1000).toFixed(2) : "0.00";
        const y1 = ball1?.position.y.toFixed(2);
        const y2 = ball2?.position.y.toFixed(2);
  
        infoPanel.innerHTML = `
  <b>Physics Monitor</b><br>
  t = ${t} s<br>
  g = ${g} m/s²<br>
  v<sub>x</sub> = ${vx} m/s<br>
  y<sub>0,1</sub> = ${y1} px<br>
  y<sub>0,2</sub> = ${y2} px<br><br>
  <b>Equations:</b><br>
  y = y<sub>0</sub> + v<sub>y</sub>·t + <sup>1</sup>&frasl;<sub>2</sub>·g·t<sup>2</sup><br>
  x = x<sub>0</sub> + v<sub>x</sub>·t
        `;
      }, 100);
    });
  })();
  