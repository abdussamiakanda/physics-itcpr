// Soap Bubble World - WebGL Bubbles with Gravity, Realistic Visuals, and Connections

const rendererContainer = document.getElementById("renderer-container");
const controlPanel = document.getElementById("control");
rendererContainer.innerHTML = "";
controlPanel.innerHTML = `
  <label>Bubbles: <input type="number" id="bubbleCount" min="1" max="100" value="1"></label>
  <button id="spawn">Spawn</button>
`;

const canvas = document.createElement('canvas');
canvas.width = 800;
canvas.height = 600;
canvas.style.display = 'block';
document.getElementById('renderer-container').appendChild(canvas);

const gl = canvas.getContext('webgl');
if (!gl) alert('WebGL not supported');

// === Shaders ===
const vertexShaderSrc = `
attribute vec2 a_position;
uniform vec2 u_resolution;
void main() {
  vec2 clipSpace = ((a_position / u_resolution) * 2.0 - 1.0);
  gl_Position = vec4(clipSpace * vec2(1, -1), 0, 1);
  gl_PointSize = 50.0;
}`;

const fragmentShaderSrc = `
precision mediump float;
void main() {
  float d = length(gl_PointCoord - vec2(0.5));
  if (d > 0.5) discard;
  float angle = atan(gl_PointCoord.y - 0.5, gl_PointCoord.x - 0.5);
  float hue = mod((angle / 6.28318 + 1.0), 1.0);
  vec3 rgb = vec3(0.7 + 0.3 * sin(hue * 6.28318), 0.6 + 0.2 * cos(hue * 6.28318), 0.8);
  gl_FragColor = vec4(rgb, 0.6);
}`;

function createShader(gl, type, src) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, src);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error(gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

function createProgram(gl, vsSrc, fsSrc) {
  const vs = createShader(gl, gl.VERTEX_SHADER, vsSrc);
  const fs = createShader(gl, gl.FRAGMENT_SHADER, fsSrc);
  const program = gl.createProgram();
  gl.attachShader(program, vs);
  gl.attachShader(program, fs);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.error(gl.getProgramInfoLog(program));
    return null;
  }
  return program;
}

const program = createProgram(gl, vertexShaderSrc, fragmentShaderSrc);
gl.useProgram(program);

const positionLoc = gl.getAttribLocation(program, 'a_position');
const resolutionLoc = gl.getUniformLocation(program, 'u_resolution');

const buffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, buffer);

gl.enableVertexAttribArray(positionLoc);
gl.vertexAttribPointer(positionLoc, 2, gl.FLOAT, false, 0, 0);

gl.uniform2f(resolutionLoc, canvas.width, canvas.height);

gl.clearColor(0.0, 0.0, 0.0, 1.0);

let bubbles = [];

function spawnBubbles(count) {
  bubbles = [];
  for (let i = 0; i < count; i++) {
    const x = Math.random() * canvas.width;
    const y = Math.random() * canvas.height / 2;
    const vy = 0;
    bubbles.push({ x, y, vy });
  }
}

document.getElementById("spawn").onclick = () => {
  const count = parseInt(document.getElementById("bubbleCount").value);
  spawnBubbles(count);
};

function updatePhysics() {
  const gravity = 0.3;
  const floor = canvas.height - 25;
  for (let b of bubbles) {
    b.vy += gravity;
    b.y += b.vy;
    if (b.y > floor) {
      b.y = floor;
      b.vy *= -0.4;
    }
  }

  // Bubble-bubble spring interaction
  const spring = 0.01;
  const minDist = 50;
  for (let i = 0; i < bubbles.length; i++) {
    for (let j = i + 1; j < bubbles.length; j++) {
      const a = bubbles[i];
      const b = bubbles[j];
      const dx = b.x - a.x;
      const dy = b.y - a.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < minDist && dist > 1) {
        const force = (minDist - dist) * spring;
        const nx = dx / dist;
        const ny = dy / dist;
        a.x -= nx * force;
        a.y -= ny * force;
        b.x += nx * force;
        b.y += ny * force;
      }
    }
  }
}

function draw() {
  updatePhysics();
  gl.clear(gl.COLOR_BUFFER_BIT);
  const flat = [];
  for (let b of bubbles) flat.push(b.x, b.y);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(flat), gl.DYNAMIC_DRAW);
  gl.drawArrays(gl.POINTS, 0, flat.length / 2);
  requestAnimationFrame(draw);
}

draw();