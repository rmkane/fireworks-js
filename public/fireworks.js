const canvas = document.querySelector(".fireworks"); // Get element by ID canvas
const ctx = canvas.getContext("2d"); // Get concent of canvas 2d graphics
const frameRate = 60.0; // Frame rate per second use in loop
const frameDelay = 1000.0 / frameRate; // Frame Delay per second like latency

let clientWidth = window.innerWidth; // Clients Width of web screen
let clientHeight = window.innerHeight; // Clients height of web screen
let timer = 0; // Timer is ticker, how many ticks per round
let x = 0; // Mouse x coordinates
let y = 0; // Mouse y coordinates

canvas.width = clientWidth; // Set canvas width to user width
canvas.height = clientHeight; // Set canvas height to user height

const TimedFirework = 1000; // Repeat Firework every x MS
const fireworks = []; // Array with starting fireworks
const particles = []; // Array with particles
const sparks = []; // Array for sparkles drops

const TYPES = ["CIRCLE", "CUBE", "LONG", "SPARKLER"];

let LimiterTicker = 0; //
let typeIndex = 0; // Variable to change firework type
let colorIndex = 0; // number of color
let colorchanger = 0; // colorchange timer

// Function to calculate distance = Simple Pythagorean theorem
const distance = (px1, py1, px2, py2) => Math.hypot(px1 - px2, py1 - py2);

// My own created function to get angle from point to point
function getAngle(posx1, posy1, posx2, posy2) {
  if (posx1 == posx2) {
    if (posy1 > posy2) {
      return 90;
    } else {
      return 270;
    }
  }
  if (posy1 == posy2) {
    if (posy1 > posy2) {
      return 0;
    } else {
      return 180;
    }
  }

  const xDist = posx1 - posx2;
  const yDist = posy1 - posy2;

  if (xDist == yDist) {
    if (posx1 < posx2) {
      return 225;
    } else {
      return 45;
    }
  }
  if (-xDist == yDist) {
    if (posx1 < posx2) {
      return 135;
    } else {
      return 315;
    }
  }

  if (posx1 < posx2) {
    return Math.atan2(posy2 - posy1, posx2 - posx1) * (180 / Math.PI) + 180;
  } else {
    return Math.atan2(posy2 - posy1, posx2 - posx1) * (180 / Math.PI) + 180;
  }
}

// My function to create random number
function random(min, max, floor = false) {
  const n = Math.random() * (max - min) + min;
  return floor ? Math.floor(n) : n;
}

const colorsValues = [
  "#ff0000",
  "#ffff00",
  "#00ff00",
  "#00ffff",
  "#0000ff",
  "#ff00ff",
  "#ffac00",
];

// Function to choose one of these best colors
function colors() {
  if (timer > colorchanger) {
    colorIndex = random(0, colorsValues.length, true);
    colorchanger = timer + 500;
  }
  return colorsValues[colorIndex];
}

// Function to make firework
const createFirework = () => {
  let firework = new Firework();

  firework.x = firework.sx = clientWidth / 2;
  firework.y = firework.sy = clientHeight;

  firework.color = colors();

  if (x != 0 && y != 0) {
    firework.tx = x;
    firework.ty = y;
    x = y = 0;
  } else {
    firework.tx = random(400, clientWidth - 400);
    firework.ty = random(0, clientHeight / 2);
  }

  const angle = getAngle(firework.sx, firework.sy, firework.tx, firework.ty);

  firework.vx = Math.cos((angle * Math.PI) / 180.0);
  firework.vy = Math.sin((angle * Math.PI) / 180.0);

  fireworks.push(firework);
};

// Function to start Firework
class Firework {
  constructor() {
    this.x = 0;
    this.y = 0;
    this.sx = 0;
    this.sy = 0;
    this.tx = 0;
    this.ty = 0;
    this.vx = 0;
    this.vy = 0;
    this.color = "rgb(255,255,255)";
    this.dis = distance(this.sx, this.sy, this.tx, this.ty);
    this.speed = random(700, 1100);
    this.gravity = 1.5;
    this.ms = 0;
    this.s = 0;
    this.del = false;
  }

  update(ms) {
    this.ms = ms / 1000;

    if (this.s > 2000 / ms) {
      createParticles(typeIndex, 30, this.x, this.y, this.color);
      this.del = true;
    } else {
      this.speed *= 0.98;
      this.x -= this.vx * this.speed * this.ms;
      this.y -= this.vy * this.speed * this.ms - this.gravity;
    }

    this.s++;
  }

  draw() {
    ctx.beginPath();
    ctx.fillStyle = this.color;
    ctx.arc(this.x, this.y, 1, 0, 2 * Math.PI);
    ctx.fill();
  }
}

// Function to create array particles
createParticles = function (type, count, pox, poy, color) {
  for (let i = 0; i < count; i++) {
    par = new Particles();
    par.type = type;

    par.color = color;
    par.x = pox;
    par.y = poy;

    const angle = random(0, 360);
    par.vx = Math.cos((angle * Math.PI) / 180.0);
    par.vy = Math.sin((angle * Math.PI) / 180.0);

    particles.push(par);
  }
};

// Function to make particles
class Particles {
  constructor() {
    this.x = 0;
    this.y = 0;
    this.vx = 0;
    this.vy = 0;
    this.speed = random(200, 500);
    this.gravity = 1;
    this.wind = 0;
    this.type = 1;
    this.opacity = 1;
    this.s = 0;
    this.scale = 1;
    this.color = "#FFF";
    this.del = false;
  }

  update(ms) {
    this.ms = ms / 1000;

    if (this.s > 900 / ms) {
      if (this.opacity - 0.05 < 0) {
        this.opacity = 0;
      } else {
        this.opacity -= 0.05;
      }
    }

    switch (TYPES[this.type]) {
      case "CIRCLE":
        this.speed *= 0.96;
        this.x -= this.vx * this.speed * this.ms + this.wind;
        this.y -= this.vy * this.speed * this.ms - this.gravity;
        break;
      case "CUBE":
        if (this.s < 800 / ms) {
          this.scale += 0.1;
        } else {
          this.scale -= 0.2;
        }
        this.speed *= 0.96;
        this.x -= this.vx * this.speed * this.ms + this.wind;
        this.y -= this.vy * this.speed * this.ms - this.gravity;
        break;
      case "LONG":
        this.speed *= 0.95;
        this.x -= this.vx * this.speed * this.ms + this.wind;
        this.y -= this.vy * this.speed * this.ms;
        break;
      case "SPARKLER":
        this.speed *= 0.96;
        this.x -= this.vx * this.speed * this.ms + this.wind;
        this.y -= this.vy * this.speed * this.ms - this.gravity;

        let spark = new Sparkler();
        spark.x = this.x;
        spark.y = this.y;
        spark.vx = Math.cos(random(0, 360, true) * (Math.PI / 180)) * 1.05;
        spark.vy = Math.sin(random(0, 360, true) * (Math.PI / 180)) * 1.05;
        spark.tx = this.x;
        spark.ty = this.y;
        spark.color = this.color;
        spark.limit = random(4, 10, true);
        sparks.push(spark);
      default:
        break;
    }

    this.s++;
  }

  draw() {
    ctx.save();
    ctx.globalAlpha = this.opacity;
    ctx.fillStyle = this.color;
    ctx.strokeStyle = this.color;

    switch (TYPES[this.type]) {
      case "CIRCLE":
        ctx.beginPath();
        ctx.arc(this.x, this.y, 1.5, 0, 2 * Math.PI);
        ctx.fill();
        break;
      case "CUBE":
        ctx.translate(this.x, this.y);
        ctx.scale(this.scale, this.scale);
        ctx.beginPath();
        ctx.fillRect(0, 0, 1, 1);
        break;
      case "LONG":
        ctx.beginPath();
        ctx.moveTo(this.x, this.y);
        ctx.lineTo(this.x - this.vx * 10, this.y - this.vy * 10);
        ctx.stroke();
        break;
      case "SPARKLER":
        ctx.beginPath();
        ctx.arc(this.x, this.y, 1.5, 0, 2 * Math.PI);
        ctx.fill();
      default:
        ctx.arc(this.x, this.y, 1, 0, 2 * Math.PI);
        ctx.fill();
    }

    ctx.closePath();
    ctx.restore();
  }
}

// Function for sparkler type of firework
class Sparkler {
  constructor() {
    this.x = 0;
    this.y = 0;
    this.tx = 0;
    this.ty = 0;
    this.limit = 0;
    this.color = "red";
  }

  update() {
    this.tx += this.vx;
    this.ty += this.vy;
    this.limit--;
  }

  draw() {
    ctx.beginPath();
    ctx.moveTo(this.x, this.y);
    ctx.lineTo(this.tx, this.ty);
    ctx.lineWidth = 1;
    ctx.strokeStyle = this.color;
    ctx.stroke();
    ctx.closePath();
  }
}

const text = () => {
  ctx.beginPath();
  ctx.fillStyle = "white";
  ctx.font = "14px arial";
  ctx.fillText(
    "Change the Firework style with right-click and fire with left-click.",
    8,
    clientHeight - 8
  );
};

const update = (frame) => {
  // text to controll firework
  text();

  // Every tick clear screen with black rectangle with opacity 0.15
  ctx.globalAlpha = 1;
  ctx.fillStyle = "rgba(0, 0, 0, 0.15)";
  ctx.fillRect(0, 0, clientWidth, clientHeight);

  if (timer > LimiterTicker) {
    // Creating array with starting Firework
    createFirework();

    LimiterTicker = timer + TimedFirework / frame;
  }

  let i = fireworks.length;
  while (i--) {
    // Progress starting Fireworks
    if (fireworks[i].del == true) {
      fireworks.splice(i, 1);
    } else {
      fireworks[i].update(frame);
      fireworks[i].draw();
    }
  }

  i = particles.length;
  while (i--) {
    // Progress particles
    if (particles[i].opacity == 0) {
      particles.splice(i, 1);
    } else {
      particles[i].update(frame);
      particles[i].draw();
    }
  }

  i = sparks.length;
  while (i--) {
    // Progress sparks
    if (sparks[i].limit < 0) {
      sparks.splice(i, 1);
    } else {
      sparks[i].update(frame);
      sparks[i].draw();
    }
  }

  timer++;
};

const main = setInterval(function () {
  update(frameDelay);
}, frameDelay);

// Block menu
const handleContextMenu = (e) => {
  e.preventDefault();
  return false;
};

// Resize the canvas
const handleResize = (e) => {
  clientWidth = canvas.width = window.innerWidth;
  clientHeight = canvas.height = window.innerHeight;
};

// Mouse coordinates to fire
const handleMouseDown = (e) => {
  if (e.which === 1) {
    // If button is first (left) on mouse
    x = e.clientX;
    y = e.clientY;
    createFirework();
  } else {
    // If button is second (right) on mouse
    typeIndex = (typeIndex + 1) % TYPES.length; // Cycle
  }
};

window.addEventListener("contextmenu", handleContextMenu);
window.addEventListener("resize", handleResize);
canvas.addEventListener("mousedown", handleMouseDown);
