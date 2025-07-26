(function () {
  const container = document.getElementById("renderer-container");
  const controlPanel = document.getElementById("control");
  container.innerHTML = "";
  controlPanel.innerHTML = "";

  const canvas = document.createElement("canvas");
  canvas.width = 800;
  canvas.height = 600;
  container.appendChild(canvas);

  const ctx = canvas.getContext("2d");
  const width = canvas.width;
  const height = canvas.height;

  const gridSize = 20;
  let skyrmions = [];
  let mode = 'single';
  let fieldDirection = { x: 0.5, y: 0 };

  function drawArrow(x, y, dx, dy, color = 'white') {
    const len = Math.sqrt(dx * dx + dy * dy);
    if (len === 0) return;
    dx /= len;
    dy /= len;

    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + dx * 8, y + dy * 8);
    ctx.strokeStyle = color;
    ctx.lineWidth = 1.5;
    ctx.stroke();

    const angle = Math.atan2(dy, dx);
    ctx.beginPath();
    ctx.moveTo(x + dx * 8, y + dy * 8);
    ctx.lineTo(x + dx * 8 - 4 * Math.cos(angle - Math.PI / 6), y + dy * 8 - 4 * Math.sin(angle - Math.PI / 6));
    ctx.lineTo(x + dx * 8 - 4 * Math.cos(angle + Math.PI / 6), y + dy * 8 - 4 * Math.sin(angle + Math.PI / 6));
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.fill();
  }

  function drawIntoScreen(x, y) {
    ctx.beginPath();
    ctx.arc(x, y, 2, 0, 2 * Math.PI);
    ctx.fillStyle = "white";
    ctx.fill();
  }

  function drawOutOfScreen(x, y) {
    ctx.beginPath();
    ctx.moveTo(x - 4, y - 4);
    ctx.lineTo(x + 4, y + 4);
    ctx.moveTo(x + 4, y - 4);
    ctx.lineTo(x - 4, y + 4);
    ctx.strokeStyle = "white";
    ctx.lineWidth = 1;
    ctx.stroke();
  }

  function getSpinVector(x, y, skyrmion) {
    const dx = x - skyrmion.x;
    const dy = y - skyrmion.y;
    const r = Math.sqrt(dx * dx + dy * dy);
    const theta = Math.atan2(dy, dx);

    const R = skyrmion.radius;
    const polarity = skyrmion.polarity;
    const helicity = skyrmion.helicity;

    if (r > R) return null;

    const radial = Math.sin(Math.PI * r / R);
    const out = Math.cos(Math.PI * r / R);

    const sx = radial * Math.cos(theta + helicity);
    const sy = radial * Math.sin(theta + helicity);
    const sz = polarity * out;

    return { x: sx, y: sy, z: sz };
  }

  function drawWalls() {
    ctx.strokeStyle = "white";
    ctx.lineWidth = 4;
    ctx.strokeRect(0, 0, width, height);
  }

  function drawGrid() {
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, width, height);
    drawWalls();

    for (let x = gridSize / 2; x < width; x += gridSize) {
      for (let y = gridSize / 2; y < height; y += gridSize) {
        let vx = 0, vy = 0, vz = 1;
        let count = 0;

        for (const s of skyrmions) {
          const spin = getSpinVector(x, y, s);
          if (spin) {
            vx += spin.x;
            vy += spin.y;
            vz += spin.z;
            count++;
          }
        }

        if (count === 0) continue;

        const len = Math.sqrt(vx * vx + vy * vy + vz * vz);
        vx /= len; vy /= len; vz /= len;

        if (Math.abs(vz) < 0.6) {
          drawArrow(x, y, vx, vy, "white");
        } else if (vz > 0) {
          drawIntoScreen(x, y);
        } else {
          drawOutOfScreen(x, y);
        }
      }
    }
  }

  function addSkyrmion(x, y, radius = 80, polarity = 1, helicity = 0) {
    skyrmions.push({ x, y, radius, polarity, helicity });
  }

  function clearSkyrmions() {
    skyrmions.length = 0;
    drawGrid();
  }

  function updateMode(newMode) {
    mode = newMode;
    skyrmions.length = 0;
    if (mode === 'single') {
      addSkyrmion(width / 2, height / 2);
    } else if (mode === 'multi') {
      addSkyrmion(width / 3, height / 2, 80, 1);
      addSkyrmion(2 * width / 3, height / 2, 80, 1);
    }
  }

  function updatePositions() {
    for (const s of skyrmions) {
      s.x += fieldDirection.x;
      s.y += fieldDirection.y;
    }
  }

  controlPanel.innerHTML = `
    <br>
    <label><input type="checkbox" id="toggle-motion" checked> Simulate Current</label><br>
    <button id="btn-single">Single Skyrmion</button>
    <button id="btn-multi">Multi Skyrmion</button>
    <button id="btn-clear">Clear</button>
  `;

  document.getElementById("btn-single").addEventListener("click", () => { updateMode('single'); drawGrid(); });
  document.getElementById("btn-multi").addEventListener("click", () => { updateMode('multi'); drawGrid(); });
  document.getElementById("btn-clear").addEventListener("click", clearSkyrmions);

  let simulateMotion = true;
  document.getElementById("toggle-motion").addEventListener("change", e => simulateMotion = e.target.checked);

  function animate() {
    requestAnimationFrame(animate);
    if (simulateMotion) updatePositions();
    drawGrid();
  }

  updateMode('single');
  animate();
})();
