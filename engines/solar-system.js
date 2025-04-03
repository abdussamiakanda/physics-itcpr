(function () {
    const rendererContainer = document.getElementById("renderer-container");
    const controlPanel = document.getElementById("control");
    rendererContainer.innerHTML = "";
    controlPanel.innerHTML = `
      <label>Speed: <span id="speedVal">1x</span>
        <input type="range" id="speedSlider" min="1" max="1000" step="1" value="1">
      </label>
      <button id="toggleMode">Switch to Simulated Time</button>
      <div id="planetInfo"></div>
    `;
    const planetInfoBox = document.getElementById("planetInfo");
  
    const canvas = document.createElement("canvas");
    canvas.width = 800;
    canvas.height = 600;
    canvas.style.background = "#000";
    canvas.style.cursor = "grab";
    rendererContainer.appendChild(canvas);
    const ctx = canvas.getContext("2d");
  
    // === Setup Planets ===
    const planets = [
      { name: "Mercury", color: "#aaa", a: 0.39, T: 88 },
      { name: "Venus", color: "#d6b97b", a: 0.72, T: 225 },
      { name: "Earth", color: "#33aaff", a: 1.0, T: 365.25 },
      { name: "Mars", color: "#cc5533", a: 1.52, T: 687 },
      { name: "Jupiter", color: "#d9b88f", a: 5.20, T: 4333 },
      { name: "Saturn", color: "#f5deb3", a: 9.58, T: 10759 },
      { name: "Uranus", color: "#88ccdd", a: 19.18, T: 30687 },
      { name: "Neptune", color: "#3366cc", a: 30.07, T: 60190 }
    ];
  
    const scale = 12; // AU to pixels at zoom=1
    const AU = 149.6e6;
  
    // === Time Control ===
    let isRealTime = true;
    let simTime = 0;
    let simSpeed = 1;
  
    const speedSlider = document.getElementById("speedSlider");
    const speedVal = document.getElementById("speedVal");
    speedSlider.disabled = true;
  
    document.getElementById("toggleMode").onclick = () => {
      isRealTime = !isRealTime;
      document.getElementById("toggleMode").textContent = isRealTime ? "Switch to Simulated Time" : "Switch to Real-Time";
      speedSlider.disabled = isRealTime;
    };
  
    speedSlider.oninput = () => {
      simSpeed = parseInt(speedSlider.value);
      speedVal.textContent = `${simSpeed}x`;
    };
  
    // === View Transform ===
    let zoom = 1;
    let offset = { x: 0, y: 0 };
    let dragging = false;
    let lastMouse = { x: 0, y: 0 };
  
    canvas.addEventListener("mousedown", (e) => {
      dragging = true;
      canvas.style.cursor = "grabbing";
      lastMouse.x = e.clientX;
      lastMouse.y = e.clientY;
    });
  
    canvas.addEventListener("mouseup", () => {
      dragging = false;
      canvas.style.cursor = "grab";
    });
  
    canvas.addEventListener("mousemove", (e) => {
      if (dragging) {
        offset.x += (e.clientX - lastMouse.x);
        offset.y += (e.clientY - lastMouse.y);
        lastMouse.x = e.clientX;
        lastMouse.y = e.clientY;
      }
    });
  
    canvas.addEventListener("wheel", (e) => {
      const scaleFactor = 1.01;
      const mouseX = e.offsetX;
      const mouseY = e.offsetY;
      const prevZoom = zoom;
  
      if (e.deltaY < 0) zoom *= scaleFactor;
      else zoom /= scaleFactor;
  
      // Adjust offset to zoom toward cursor
      offset.x -= (mouseX - offset.x) * (zoom - prevZoom) / prevZoom;
      offset.y -= (mouseY - offset.y) * (zoom - prevZoom) / prevZoom;
  
      e.preventDefault();
    });
  
    // === Trail Data ===
    const trails = new Map(); // planetName → [{x,y}, ...]
    const trailLength = 100;
  
    let planetPositions = [];
  
    function getTimeDays() {
      if (isRealTime) {
        return Date.now() / (1000 * 60 * 60 * 24);
      } else {
        simTime += simSpeed / 60;
        return simTime;
      }
    }
  
    function worldToScreen(x, y) {
      return {
        x: x * zoom + offset.x + canvas.width / 2,
        y: y * zoom + offset.y + canvas.height / 2
      };
    }
  
    function update() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        const t = getTimeDays();
        planetPositions = [];
      
        // === Draw Sun (scale with zoom)
        const sunScreen = worldToScreen(0, 0);
        ctx.beginPath();
        ctx.arc(sunScreen.x, sunScreen.y, 8, 0, 2 * Math.PI); // fixed size
        ctx.fillStyle = "yellow";
        ctx.fill();
      
        for (const planet of planets) {
          const angle = (2 * Math.PI * (t % planet.T)) / planet.T;
          const r = planet.a;
          const x = r * Math.cos(angle);
          const y = r * Math.sin(angle);
      
          // Save trail
          if (!trails.has(planet.name)) trails.set(planet.name, []);
          const trail = trails.get(planet.name);
          trail.push({ x, y });
          if (trail.length > trailLength) trail.shift();
      
          // === Orbit trail
          ctx.beginPath();
          for (let i = 1; i < trail.length; i++) {
            const p1 = worldToScreen(trail[i - 1].x * scale, trail[i - 1].y * scale);
            const p2 = worldToScreen(trail[i].x * scale, trail[i].y * scale);
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
          }
          ctx.strokeStyle = planet.color;
          ctx.lineWidth = 0.5; // constant in screen space
          ctx.globalAlpha = 0.3;
          ctx.stroke();
          ctx.globalAlpha = 1;
      
          // === Planet
          const pos = worldToScreen(x * scale, y * scale);
          ctx.beginPath();
          ctx.arc(pos.x, pos.y, 4, 0, 2 * Math.PI); // fixed radius
          ctx.fillStyle = planet.color;
          ctx.fill();
      
          // === Label (fixed size)
          ctx.font = `10px monospace`;
          ctx.fillStyle = "white";
          ctx.fillText(planet.name, pos.x + 6, pos.y - 6);
      
          planetPositions.push({ ...planet, x: pos.x, y: pos.y, distanceAU: planet.a });
        }
      
        requestAnimationFrame(update);
    }
  
    update();
  
    canvas.addEventListener("click", (e) => {
      const mx = e.offsetX;
      const my = e.offsetY;
      for (const planet of planetPositions) {
        const dx = mx - planet.x;
        const dy = my - planet.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 8 * zoom) {
          planetInfoBox.innerHTML = `
            <strong>${planet.name}</strong><br>
            Distance from Sun: ${planet.distanceAU.toFixed(2)} AU<br>
            Orbital Period: ${planet.T} days
          `;
          break;
        }
      }
    });
  })();
  