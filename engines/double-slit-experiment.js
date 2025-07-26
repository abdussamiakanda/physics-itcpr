(function () {
  // Setup canvas
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

  // Simulation parameters
  const waveSpeed = 1;
  const wavelength = 40;
  const k = 2 * Math.PI / wavelength;
  const damping = 0.002;
  const sourceX = 100;
  const barrierX = 300;
  const screenX = 700;
  const slitGap = 80;
  const slitWidth = 10;
  const centerY = height / 2;
  const slit1Y = centerY - slitGap / 2;
  const slit2Y = centerY + slitGap / 2;

  // Grid for cumulative intensity (detection)
  const intensity = new Float32Array(width * height);

  let t = 0;

  function distance(x1, y1, x2, y2) {
    return Math.sqrt((x1 - x2) ** 2 + (y1 - y2) ** 2);
  }

  function draw() {
    const imageData = ctx.createImageData(width, height);
    const data = imageData.data;

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        let amp = 0;

        if (x < barrierX) {
          const r = distance(x, y, sourceX, centerY);
          amp = Math.sin(k * r - t) / (r + 1);
        } else {
          const r1 = distance(x, y, barrierX, slit1Y);
          const r2 = distance(x, y, barrierX, slit2Y);
          const w1 = Math.sin(k * r1 - t) * Math.exp(-damping * r1);
          const w2 = Math.sin(k * r2 - t) * Math.exp(-damping * r2);
          amp = w1 + w2;
        }

        const brightness = Math.floor((amp + 1) / 2 * 255);
        const i = (y * width + x) * 4;
        data[i] = brightness;
        data[i + 1] = brightness;
        data[i + 2] = brightness;
        data[i + 3] = 255;

        // accumulate intensity
        intensity[y * width + x] += amp * amp;
      }
    }

    ctx.putImageData(imageData, 0, 0);

    // Draw slits
    ctx.fillStyle = "white";
    ctx.fillRect(barrierX, 0, 4, slit1Y - slitWidth / 2);
    ctx.fillRect(barrierX, slit1Y + slitWidth / 2, 4, slit2Y - slit1Y - slitWidth);
    ctx.fillRect(barrierX, slit2Y + slitWidth / 2, 4, height - (slit2Y + slitWidth / 2));

    // Draw translucent detection screen
    ctx.fillStyle = "rgba(0, 255, 0, 0.1)";
    ctx.fillRect(screenX, 0, 4, height);
  }

  function animate() {
    draw();
    t += waveSpeed;
    requestAnimationFrame(animate);
  }

  controlPanel.innerHTML = `<button id="clear">Clear</button>`;
  document.getElementById("clear").onclick = () => intensity.fill(0);

  animate();
})();