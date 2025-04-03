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
    engine.gravity.scale = 0;

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

    const charges = []; // static charges for electric field
    let showElectric = true;

    function addCharge(type = 1) {
      const charge = Bodies.circle(Math.random() * 700 + 50, Math.random() * 500 + 50, 10, {
        render: {
          fillStyle: type > 0 ? "#ff3333" : "#3399ff"
        }
      });
      charge.plugin = { polarity: type }; // +1 or -1
      Composite.add(world, charge);
      charges.push(charge);
    }

    function clearAll() {
      for (const b of charges) {
        Composite.remove(world, b);
      }
      charges.length = 0;
    }

    // Vector-style electric field arrows
    Events.on(render, "afterRender", () => {
      const ctx = render.context;
      if (!showElectric) return;

      const gridSize = 40;
      for (let x = 40; x < 800; x += gridSize) {
        for (let y = 40; y < 600; y += gridSize) {
          let eField = { x: 0, y: 0 };

          for (const charge of charges) {
            const dx = charge.position.x - x;
            const dy = charge.position.y - y;
            const r2 = dx * dx + dy * dy;
            const r = Math.sqrt(r2);
            if (r < 20) continue; // avoid singularity
            const strength = (charge.plugin.polarity || 1) / r2;
            eField.x += (dx / r) * strength;
            eField.y += (dy / r) * strength;
          }

          const len = Math.sqrt(eField.x * eField.x + eField.y * eField.y);
          if (len === 0) continue;
          const ux = eField.x / len;
          const uy = eField.y / len;

          // Draw arrow
          ctx.beginPath();
          ctx.moveTo(x, y);
          ctx.lineTo(x + ux * 12, y + uy * 12);
          ctx.strokeStyle = "rgba(255,255,255,0.4)";
          ctx.lineWidth = 1;
          ctx.stroke();

          // Arrowhead
          const arrowLength = 4;
          const angle = Math.atan2(uy, ux);
          ctx.beginPath();
          ctx.moveTo(x + ux * 12, y + uy * 12);
          ctx.lineTo(
            x + ux * 12 - arrowLength * Math.cos(angle - Math.PI / 6),
            y + uy * 12 - arrowLength * Math.sin(angle - Math.PI / 6)
          );
          ctx.lineTo(
            x + ux * 12 - arrowLength * Math.cos(angle + Math.PI / 6),
            y + uy * 12 - arrowLength * Math.sin(angle + Math.PI / 6)
          );
          ctx.closePath();
          ctx.fillStyle = "rgba(255,255,255,0.4)";
          ctx.fill();
        }
      }
    });

    // Controls
    controlPanel.innerHTML = `
      <button id="add-plus-charge">Add - Charge</button>
      <button id="add-minus-charge">Add + Charge</button>
      <button id="clear">Clear</button>
    `;

    document.getElementById("add-plus-charge").onclick = () => addCharge(1);
    document.getElementById("add-minus-charge").onclick = () => addCharge(-1);
    document.getElementById("clear").onclick = () => clearAll();
    document.getElementById("showElectric").onchange = e => showElectric = e.target.checked;

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