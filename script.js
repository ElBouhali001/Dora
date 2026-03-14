'use strict';

// ── DOM ELEMENTS ──
const curtain      = document.getElementById('curtain');
const cowWrap      = document.getElementById('cow-wrap');
const signRig      = document.getElementById('sign-rig');
const questionText = document.getElementById('question-text');
const btnYes       = document.getElementById('btn-yes');
const btnNo        = document.getElementById('btn-no');
const world        = document.getElementById('world');
const finale       = document.getElementById('finale');
const gifOverlay   = document.getElementById('gif-overlay');
const tapOverlay   = document.getElementById('tap-overlay');

const trackerYes   = document.getElementById('t-yes');
const trackerNo    = document.getElementById('t-no');
const trackerFinal = document.getElementById('t-final');

const atmoCanvas   = document.getElementById('atmosphere-canvas');
const atmoCtx      = atmoCanvas.getContext('2d');
const finaleCanvas = document.getElementById('finale-canvas');
const finaleCtx    = finaleCanvas.getContext('2d');

// ── STATE ──
let noClickCount = 0;
let isSad        = false;
let finaleActive = false;

// ── AUDIO ASSETS ──
const soundWalk  = new Audio('assets/cow-1.m4a');
const soundSad   = new Audio('assets/sad.mp3');
const soundTsk   = new Audio('assets/tsk.m4a');
const soundHappy = new Audio('assets/happy.mp3');
soundHappy.loop  = true;

// ── FORMSPREE NOTIFICATION ──
const FORMSPREE_URL = 'https://formspree.io/f/mvzwqvov';

function notifyMe(action, details) {
    if (!FORMSPREE_URL.startsWith('http')) return;
    fetch(FORMSPREE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, details, time: new Date().toLocaleString() })
    }).catch(() => {});
}

// ── CANVAS RESIZE ──
function resizeCanvases() {
    atmoCanvas.width    = window.innerWidth;
    atmoCanvas.height   = window.innerHeight;
    finaleCanvas.width  = window.innerWidth;
    finaleCanvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvases);
resizeCanvases();

// ── ATMOSPHERE: GOLDEN DUST ──
const dust = [];
for (let i = 0; i < 60; i++) {
    dust.push({
        x:     Math.random() * window.innerWidth,
        y:     Math.random() * window.innerHeight,
        r:     Math.random() * 2.5 + 0.5,
        vx:    (Math.random() - 0.5) * 0.3,
        vy:    -(Math.random() * 0.45 + 0.1),
        alpha: Math.random() * 0.5 + 0.1,
        phase: Math.random() * Math.PI * 2,
    });
}

function renderAtmosphere() {
    atmoCtx.clearRect(0, 0, atmoCanvas.width, atmoCanvas.height);
    dust.forEach(p => {
        p.phase += 0.01;
        p.x += p.vx + Math.sin(p.phase) * 0.25;
        p.y += p.vy;
        if (p.y < -5)               p.y = atmoCanvas.height + 5;
        if (p.x < -5)               p.x = atmoCanvas.width + 5;
        if (p.x > atmoCanvas.width) p.x = -5;

        const grad = atmoCtx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 2.5);
        grad.addColorStop(0,   `rgba(255, 220, 100, ${p.alpha})`);
        grad.addColorStop(0.5, `rgba(255, 190, 60,  ${p.alpha * 0.5})`);
        grad.addColorStop(1,   `rgba(255, 160, 20,  0)`);

        atmoCtx.beginPath();
        atmoCtx.arc(p.x, p.y, p.r * 2.5, 0, Math.PI * 2);
        atmoCtx.fillStyle = grad;
        atmoCtx.fill();
    });
    requestAnimationFrame(renderAtmosphere);
}

// ── WALK CENTER CALCULATION ──
function getCenterLeft() {
    return (window.innerWidth / 2) - 140;
}

// ── TAP-TO-START ──
// Creating an AudioContext synchronously inside a user gesture is the
// definitive cross-browser audio unlock (Chrome, Firefox, Safari, iOS).
function startExperience() {
    // 1. Dismiss overlay
    tapOverlay.classList.add('hide');
    setTimeout(() => tapOverlay.remove(), 700);

    // 2. Unlock audio via AudioContext created inside the gesture
    try {
        const unlockCtx = new (window.AudioContext || window.webkitAudioContext)();
        unlockCtx.resume().then(() => unlockCtx.close()).catch(() => {});
    } catch(e) {}

    // 3. Prime all HTML5 Audio objects while the gesture is still hot
    [soundWalk, soundSad, soundTsk, soundHappy].forEach(s => {
        s.play().then(() => { s.pause(); s.currentTime = 0; }).catch(() => {});
    });

    // 4. Main sequence — identical timings to original
    setTimeout(() => curtain.classList.add('lift'), 500);

    setTimeout(() => {
        cowWrap.classList.add('state-walk');
        cowWrap.style.transition = 'left 4.8s cubic-bezier(0.25, 1, 0.5, 1)';
        cowWrap.style.left = getCenterLeft() + 'px';
        soundWalk.currentTime = 0;
        soundWalk.play().catch(() => {});
    }, 1200);

    setTimeout(() => {
        cowWrap.classList.remove('state-walk');
        cowWrap.classList.add('state-sit');
        cowWrap.style.transition = '';
        soundWalk.pause();
        soundWalk.currentTime = 0;
    }, 6200);

    setTimeout(() => cowWrap.classList.add('state-idle'), 6800);

    setTimeout(() => {
        cowWrap.classList.remove('state-idle');
        cowWrap.classList.add('state-rizz');
    }, 8800);

    setTimeout(() => signRig.classList.add('sign-drop'), 9300);
}

// ── INIT ──
window.onload = () => {
    renderAtmosphere();
    tapOverlay.addEventListener('click', startExperience, { once: true });
};

// ── BUTTON LISTENERS ──
btnYes.addEventListener('click', handleYes);
btnNo.addEventListener('click', handleNo);

// ── NO MESSAGES (5 total — first kept, 2–5 updated) ──
const noMessages = [
    `Did your finger slip on the trackpad just now? 🧐<br>I didn't write all this code just to get a 'No'!`,
    `Huh ! I see you're playing hard to get. 🧐<br>Respectable, but let's not pretend you don't want to catch up.`,
    `Eib Eib ! You're breaking her little digital heart... 💔<br><br>Click YES to save the cow!`,
    `Distance is tough, but a video call is a start. 📱<br>Don't let this tiny button tear us apart!`,
    `Error 404: The 'No' button has officially flown away! 🦋<br>Looks like we're having that video call today! 😎`
];

// ── REJECTION LOOP ──
function handleNo() {
    noClickCount++;
    trackerNo.innerText = noClickCount;

    if (noClickCount <= 2) {
        soundSad.currentTime = 0;
        soundSad.play().catch(() => {});
    } else {
        soundTsk.currentTime = 0;
        soundTsk.play().catch(() => {});
    }

    notifyMe(
        `❌ No click #${noClickCount}`,
        `She clicked No ${noClickCount} time(s). Message: "${noMessages[Math.min(noClickCount - 1, noMessages.length - 1)].replace(/<br>/g, ' ')}"`
    );

    if (!isSad) {
        isSad = true;
        cowWrap.classList.remove('state-rizz', 'state-idle');
        cowWrap.classList.add('state-sad');
        world.classList.add('cold-filter');
        startTears();
    }

    const noScale  = Math.max(0.05, 1 - noClickCount * 0.22);
    const yesScale = 1 + noClickCount * 0.25;
    btnNo.style.setProperty('--btn-scale', noScale);
    btnYes.style.setProperty('--btn-scale', yesScale);

    if (noClickCount <= 5) {
        questionText.innerHTML = noMessages[noClickCount - 1];
    }

    if (noClickCount >= 5) {
        btnNo.style.opacity       = '0';
        btnNo.style.pointerEvents = 'none';
        setTimeout(() => { btnNo.style.display = 'none'; }, 400);
    }
}

// ── TEARS ──
function startTears() {
    const leftTear  = createTear(-8);
    const rightTear = createTear(52);
    cowWrap.appendChild(leftTear);
    cowWrap.appendChild(rightTear);
    setTimeout(() => leftTear.classList.add('falling'),  120);
    setTimeout(() => rightTear.classList.add('falling'), 380);
}

function createTear(offsetX) {
    const t = document.createElement('div');
    t.className = 'tear';
    t.style.cssText = `left:${108 + offsetX}px; top:107px; position:absolute; z-index:11;`;
    return t;
}

function stopTears() {
    document.querySelectorAll('.tear').forEach(t => t.remove());
}

// ── BARNYARD FINALE ──
function handleYes() {
    trackerYes.innerText     = parseInt(trackerYes.innerText) + 1;
    trackerFinal.innerText   = 'Final: YES! 🎉';
    trackerFinal.style.color = '#4CAF50';

    notifyMe('✅ She said YES! 🎉', 'She clicked YES to the video call! Go go go! 🥳🐄');

    soundHappy.currentTime = 0;
    soundHappy.play().catch(() => {});
    stopTears();

    signRig.classList.remove('sign-drop');
    signRig.classList.add('sign-hide');
    world.classList.remove('cold-filter');

    cowWrap.classList.remove('state-sad', 'state-sit', 'state-rizz', 'state-idle', 'state-walk');
    cowWrap.classList.add('state-party');

    setTimeout(() => {
        finale.classList.add('show');
        finaleActive = true;
        startFinaleEngine();
    }, 300);

    runGifSlideshow();
}

// ── GIF SLIDESHOW ──
// Song: 49s total. Timeline from YES click:
//   0s  – 2s   : Dora party animation (no GIF yet, particles start at 0.3s)
//   2s  – 7s   : cow-dance.gif  (5s)
//   7s  – 17.5s: giphy.gif      (10.5s)
//   17.5s–28s  : giphy (1).gif  (10.5s)
//   28s – 38.5s: giphy (2).gif  (10.5s)
//   38.5s–49s  : giphy (3).gif  (10.5s)
function runGifSlideshow() {
    const gifImg = document.getElementById('cow-gif');

    setTimeout(() => {
        gifImg.src = 'assets/cow-dance.gif';
        gifOverlay.classList.add('show');
    }, 2000);

    setTimeout(() => { gifImg.src = 'assets/giphy.gif';     }, 7000);
    setTimeout(() => { gifImg.src = 'assets/giphy (1).gif'; }, 17500);
    setTimeout(() => { gifImg.src = 'assets/giphy (2).gif'; }, 28000);
    setTimeout(() => { gifImg.src = 'assets/giphy (3).gif'; }, 38500);
}

// ── TRACKER TOGGLE ──
document.addEventListener('keydown', e => {
    if (e.ctrlKey && e.shiftKey && e.key === 'T') {
        e.preventDefault();
        document.getElementById('tracker').classList.toggle('show');
    }
});

// ── FINALE PARTICLE ENGINE ──
const EMOJIS = ['🐄', '🐮', '✨', '🎉', '⭐', '💛', '🌟'];

class Particle {
    constructor() { this.reset(true); }
    reset(fromTop = false) {
        this.emoji    = EMOJIS[Math.floor(Math.random() * EMOJIS.length)];
        this.x        = Math.random() * finaleCanvas.width;
        this.y        = fromTop ? -50 - Math.random() * 200 : Math.random() * finaleCanvas.height;
        this.size     = Math.random() * 28 + 28;
        this.vx       = (Math.random() - 0.5) * 5.5;
        this.vy       = Math.random() * 2.5 + 1.5;
        this.rotation = Math.random() * 360;
        this.rotSpeed = (Math.random() - 0.5) * 6;
        this.bounce   = 0.52 + Math.random() * 0.2;
        this.gravity  = 0.26 + Math.random() * 0.1;
        this.squash   = 0;
    }
    update() {
        this.vy       += this.gravity;
        this.x        += this.vx;
        this.y        += this.vy;
        this.rotation += this.rotSpeed;

        const floor = finaleCanvas.height - 40;
        if (this.y >= floor) {
            this.y  = floor;
            this.vy = -Math.abs(this.vy) * this.bounce;
            this.vx += (Math.random() - 0.5) * 1.5;
            this.squash = 7;
        }
        if (this.x < -80)                     this.x = finaleCanvas.width + 60;
        if (this.x > finaleCanvas.width + 80) this.x = -60;
    }
    draw() {
        finaleCtx.save();
        finaleCtx.translate(this.x, this.y);
        finaleCtx.rotate(this.rotation * Math.PI / 180);

        let sx = 1, sy = 1;
        if (this.squash > 0) {
            const t = this.squash / 7;
            sx = 1 + 0.35 * t;
            sy = 1 - 0.28 * t;
            this.squash--;
        } else {
            const speed = Math.abs(this.vy);
            sx = Math.max(0.75, 1 - speed * 0.018);
            sy = Math.min(1.4,  1 + speed * 0.028);
        }

        finaleCtx.scale(sx, sy);
        finaleCtx.font         = `${this.size}px serif`;
        finaleCtx.textAlign    = 'center';
        finaleCtx.textBaseline = 'middle';
        finaleCtx.fillText(this.emoji, 0, 0);
        finaleCtx.restore();
    }
}

const particles = [];

function startFinaleEngine() {
    for (let i = 0; i < 55; i++) {
        setTimeout(() => particles.push(new Particle()), i * 28);
    }
    animateFinale();
}

function animateFinale() {
    if (!finaleActive) return;
    finaleCtx.clearRect(0, 0, finaleCanvas.width, finaleCanvas.height);
    particles.forEach(p => { p.update(); p.draw(); });
    requestAnimationFrame(animateFinale);
}