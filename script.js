let isSoundPlaying = false;
let dayBox = document.getElementById("day-box");
let hrBox = document.getElementById("hr-box");
let minBox = document.getElementById("min-box");
let secBox = document.getElementById("sec-box");

// ตั้งค่าเวลาสิ้นสุด: 1 มกราคม 2027
let endDate = new Date(2027, 0, 1, 0, 0);
let endTime = endDate.getTime();

let s10m = document.getElementById("sound-10min");
let s5m = document.getElementById("sound-5min");
let s1m = document.getElementById("sound-1min");
let s10s = document.getElementById("countdown_10s");
let alert10 = false, alert5 = false, alert1 = false;
let addZeroes = (num) => (num < 10 ? `0${num}` : num);

const startBtn = document.getElementById("start-btn");
const startOverlay = document.getElementById("start-overlay");
const mainWrapper = document.getElementById("main-wrapper");

function startEverything() {
    startOverlay.style.opacity = "0";
    setTimeout(() => {
        startOverlay.style.display = "none";
        mainWrapper.style.opacity = "1";
    }, 800);

    setInterval(countdown, 1000);
    countdown();
    update(); // เริ่มพลุ
    showSequentialImage();
    
    // Unlock audio
    [s10m, s5m, s1m, s10s].forEach(s => {
        s.play().then(() => { s.pause(); s.currentTime = 0; }).catch(() => {});
    });
}

startBtn.addEventListener("click", startEverything);

function playRepeatSound(audioElement) {
  let playCount = 0;
  const maxPlays = 3;
  const startPlaying = () => {
    audioElement.play().then(() => { playCount++; }).catch(e => console.log("Audio blocked"));
  };
  audioElement.onended = function() {
    if (playCount < maxPlays) setTimeout(startPlaying, 1000);
  };
  startPlaying();
}

function countdown() {
  let todayDate = new Date();
  let remainingTime = endTime - todayDate.getTime();
  let totalSecondsLeft = Math.floor(remainingTime / 1000);

  if (totalSecondsLeft <= 600 && !alert10) { playRepeatSound(s10m); alert10 = true; }
  if (totalSecondsLeft <= 300 && !alert5) { playRepeatSound(s5m); alert5 = true; }
  if (totalSecondsLeft <= 60 && !alert1) { playRepeatSound(s1m); alert1 = true; }
  if (totalSecondsLeft <= 10 && totalSecondsLeft > 0 && !isSoundPlaying) {
    s10s.play();
    isSoundPlaying = true;
  }

  if (remainingTime <= 0) {
    window.location.href = "test.html";
  } else {
    let daysLeft = Math.floor(remainingTime / (24 * 60 * 60 * 1000));
    let hrsLeft = Math.floor((remainingTime % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
    let minsLeft = Math.floor((remainingTime % (60 * 60 * 1000)) / (60 * 1000));
    let secsLeft = Math.floor((remainingTime % (60 * 1000)) / 1000);

    dayBox.textContent = addZeroes(daysLeft);
    hrBox.textContent = addZeroes(hrsLeft);
    minBox.textContent = addZeroes(minsLeft);
    secBox.textContent = addZeroes(secsLeft);
  }
}

// --- Fireworks Engine ---
window.requestAnimFrame = (function () {
  return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame ||
    function (callback) { window.setTimeout(callback, 1000 / 60); };
})();

var canvas = document.getElementById("canvas"),
  ctx = canvas.getContext("2d"),
  cw = window.innerWidth, ch = window.innerHeight,
  fireworks = [], particles = [], hue = 120, timerTotal = 60, timerTick = 0;

canvas.width = cw; canvas.height = ch;

function random(min, max) { return Math.random() * (max - min) + min; }
function calculateDistance(p1x, p1y, p2x, p2y) {
  return Math.sqrt(Math.pow(p1x - p2x, 2) + Math.pow(p1y - p2y, 2));
}

function Firework(sx, sy, tx, ty) {
  this.x = sx; this.y = sy; this.sx = sx; this.sy = sy; this.tx = tx; this.ty = ty;
  this.distanceToTarget = calculateDistance(sx, sy, tx, ty);
  this.distanceTraveled = 0;
  this.coordinates = [[sx, sy], [sx, sy], [sx, sy]];
  this.angle = Math.atan2(ty - sy, tx - sx);
  this.speed = 2; this.acceleration = 1.05; this.brightness = random(50, 70);
}

Firework.prototype.update = function (index) {
  this.coordinates.pop(); this.coordinates.unshift([this.x, this.y]);
  this.speed *= this.acceleration;
  var vx = Math.cos(this.angle) * this.speed, vy = Math.sin(this.angle) * this.speed;
  this.distanceTraveled = calculateDistance(this.sx, this.sy, this.x + vx, this.y + vy);
  if (this.distanceTraveled >= this.distanceToTarget) {
    createParticles(this.tx, this.ty);
    fireworks.splice(index, 1);
  } else { this.x += vx; this.y += vy; }
};

Firework.prototype.draw = function () {
  ctx.beginPath();
  ctx.moveTo(this.coordinates[this.coordinates.length - 1][0], this.coordinates[this.coordinates.length - 1][1]);
  ctx.lineTo(this.x, this.y);
  ctx.strokeStyle = "hsl(" + hue + ", 100%, " + this.brightness + "%)";
  ctx.stroke();
};

function Particle(x, y) {
  this.x = x; this.y = y;
  this.coordinates = [[x, y], [x, y], [x, y], [x, y], [x, y]];
  this.angle = random(0, Math.PI * 2);
  this.speed = random(1, 10);
  this.friction = 0.95; this.gravity = 1;
  this.hue = random(hue - 50, hue + 50);
  this.brightness = random(50, 80);
  this.alpha = 1; this.decay = random(0.015, 0.03);
}

Particle.prototype.update = function (index) {
  this.coordinates.pop(); this.coordinates.unshift([this.x, this.y]);
  this.speed *= this.friction;
  this.x += Math.cos(this.angle) * this.speed;
  this.y += Math.sin(this.angle) * this.speed + this.gravity;
  this.alpha -= this.decay;
  if (this.alpha <= this.decay) { particles.splice(index, 1); }
};

Particle.prototype.draw = function () {
  ctx.beginPath();
  ctx.moveTo(this.coordinates[this.coordinates.length - 1][0], this.coordinates[this.coordinates.length - 1][1]);
  ctx.lineTo(this.x, this.y);
  ctx.strokeStyle = "hsla(" + this.hue + ", 100%, " + this.brightness + "%, " + this.alpha + ")";
  ctx.stroke();
};

function createParticles(x, y) {
  var count = 30; while (count--) { particles.push(new Particle(x, y)); }
}

function update() {
  requestAnimFrame(update);
  hue = random(0, 360);
  ctx.globalCompositeOperation = "destination-out";
  ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
  ctx.fillRect(0, 0, cw, ch);
  ctx.globalCompositeOperation = "lighter";
  var i = fireworks.length; while (i--) { fireworks[i].draw(); fireworks[i].update(i); }
  var j = particles.length; while (j--) { particles[j].draw(); particles[j].update(j); }
  if (timerTick >= timerTotal) {
    fireworks.push(new Firework(cw / 2, ch, random(0, cw), random(0, ch / 2)));
    timerTick = 0;
  } else { timerTick++; }
}

// --- Image Sequencer ---
const imageSources = ['pt01.png','pt02.png','pt03.png','pt04.png','pt05.png','pt06.png','pt07.png','pt08.png','pt09.png','pt10.png','pt11.png','pt12.png','pt13.png','pt14.png','pt15.png','pt16.png','pt17.png','pt18.png','pt19.png','pt20.png','pt21.png','pt22.png','pt23.png','pt24.png','pt25.png','pt26.png','pt27.png','pt28.png','pt29.png','pt30.png','pt31.png','pt32.png','pt33.png','pt34.png','pt35.png','pt36.png','pt37.png','pt38.png','pt40.png','pt41.png','pt42.png','pt43.png','pt44.png','pt45.png','pt46.png','pt47.png','pt48.png','pt49.png','pt50.png','pt51.png','pt52.png','pt53.png','pt54.png','pt55.png','pt56.png','pt57.png','pt58.png','pt59.png','pt60.png','pt61.png','pt62.png',"test001.jpg","test002.jpg"];
let currentIndex = 0;

function showSequentialImage() {
    let todayDate = new Date();
    let totalSecondsLeft = Math.floor((endTime - todayDate.getTime()) / 1000);
    if (totalSecondsLeft <= 300) return; 

    const img = document.createElement('img');
    img.src = imageSources[currentIndex];
    img.className = 'random-image';
    document.body.appendChild(img);

    // คำนวณขอบเขตหลังรูปโหลดเสร็จ (เพื่อให้รู้ขนาดจริง)
    img.onload = () => {
        const maxX = window.innerWidth - img.offsetWidth;
        const maxY = window.innerHeight - img.offsetHeight;
        img.style.left = `${Math.max(0, Math.random() * maxX)}px`;
        img.style.top = `${Math.max(0, Math.random() * maxY)}px`;
    };

    currentIndex = (currentIndex + 1) % imageSources.length;
    setTimeout(() => img.remove(), 4500);
    setTimeout(showSequentialImage, 3500);
}

window.addEventListener("resize", () => {
  cw = window.innerWidth; ch = window.innerHeight;
  canvas.width = cw; canvas.height = ch;
});
