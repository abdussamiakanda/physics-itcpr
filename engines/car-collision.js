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

      // Boundaries
      const ground = Bodies.rectangle(400, 590, 800, 20, { isStatic: true, render: { fillStyle: "#444" } });
      const leftWall = Bodies.rectangle(0, 300, 20, 600, { isStatic: true });
      const rightWall = Bodies.rectangle(800, 300, 20, 600, { isStatic: true });
      Composite.add(world, [ground, leftWall, rightWall]);

      const cars = [];
      let speed1 = 10;
      let speed2 = 10;
      let mass1 = 0.002;
      let mass2 = 0.002;

      function createCar(x, color, label) {
        const width = 80;
        const height = 30;
        const car = Bodies.rectangle(x, 550, width, height, {
          restitution: 0.4,
          friction: 0.05,
          frictionAir: 0.01,
          density: label === "car1" ? mass1 : mass2,
          inertia: Infinity, // Lock rotation
          label: label,
          render: {
            fillStyle: color
          }
        });
        Body.setAngle(car, 0);
        Body.setAngularVelocity(car, 0);
        Composite.add(world, car);
        cars.push(car);
      }

      function launchCars() {
        if (cars.length === 2) {
          Body.setVelocity(cars[0], { x: speed1, y: 0 });
          Body.setVelocity(cars[1], { x: -speed2, y: 0 });
        }
      }

      function clearCars() {
        for (const car of cars) {
          Composite.remove(world, car);
        }
        cars.length = 0;
      }

      // Controls
      controlPanel.innerHTML = `
        <label>Car 1 Speed: <span id="speedVal1">10</span>
          <input type="range" id="speedSlider1" min="1" max="30" value="10"></label><br>
        <label>Car 2 Speed: <span id="speedVal2">10</span>
          <input type="range" id="speedSlider2" min="1" max="30" value="10"></label><br>
        <label>Car 1 Mass: <span id="massVal1">0.002</span>
          <input type="range" id="massSlider1" min="0.001" max="0.01" step="0.001" value="0.002"></label><br>
        <label>Car 2 Mass: <span id="massVal2">0.002</span>
          <input type="range" id="massSlider2" min="0.001" max="0.01" step="0.001" value="0.002"></label>
        <button id="spawn">Spawn Cars</button>
        <button id="launch">Launch Collision</button>
        <button id="clear">Clear</button>
      `;

      document.getElementById("spawn").onclick = () => {
        clearCars();
        createCar(200, "#00ccff", "car1");
        createCar(600, "#ff4444", "car2");
      };

      document.getElementById("launch").onclick = launchCars;
      document.getElementById("clear").onclick = clearCars;

      document.getElementById("speedSlider1").oninput = (e) => {
        speed1 = parseFloat(e.target.value);
        document.getElementById("speedVal1").textContent = speed1;
      };
      document.getElementById("speedSlider2").oninput = (e) => {
        speed2 = parseFloat(e.target.value);
        document.getElementById("speedVal2").textContent = speed2;
      };
      document.getElementById("massSlider1").oninput = (e) => {
        mass1 = parseFloat(e.target.value);
        document.getElementById("massVal1").textContent = mass1.toFixed(3);
      };
      document.getElementById("massSlider2").oninput = (e) => {
        mass2 = parseFloat(e.target.value);
        document.getElementById("massVal2").textContent = mass2.toFixed(3);
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
    });
})();