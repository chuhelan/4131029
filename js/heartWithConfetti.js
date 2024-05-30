const canvas = document.getElementById("heartWithConfettiCanvas");
const ctx = canvas.getContext("2d");

let hearts = [];
let confetti = [];
let heartAnimationFrameId;
let heartAnimationIntervalId;

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

function drawHeart(x, y, size, color, alpha) {
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.beginPath();
    ctx.translate(x, y);
    ctx.moveTo(0, -size / 2);
    ctx.bezierCurveTo(size / 2, -size, size, -size / 8, 0, size * 0.4);
    ctx.bezierCurveTo(-size, -size / 8, -size / 2, -size, 0, -size / 2);
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.fill();
    ctx.restore();
}

function drawConfetti(confetto) {
    ctx.save();
    ctx.globalAlpha = confetto.alpha;
    ctx.fillStyle = confetto.color;
    ctx.beginPath();
    ctx.arc(confetto.x, confetto.y, confetto.size / 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
}

function createHeart() {
    const heart = {
        x: Math.random() * canvas.width,
        y: canvas.height + 20,
        size: Math.random() * 30 + 20,
        speed: Math.random() + 0.3,
        horizontalSpeed: (Math.random() - 0.5) * 1.2,
        color: createRandomColor(),
        alpha: 1,
        explosionProbability: Math.random() < 0.1,
        targetHeight: Math.random() * canvas.height * 0.5 + canvas.height * 0.1
    };
    hearts.push(heart);
}

function createExplosion(x, y) {
    const numParticles = Math.random() * 40 + 20;
    const maxSpeed = Math.random() * 5 + 1;

    for (let i = 0; i < numParticles; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * maxSpeed;
        const size = Math.random() * 6 + 3;
        const color = createRandomColor();
        const alpha = Math.random() * 0.5 + 0.5;

        const particle = {
            x: x,
            y: y,
            size: size,
            speedX: Math.cos(angle) * speed,
            speedY: Math.sin(angle) * speed,
            color: color,
            alpha: alpha
        };
        confetti.push(particle);
    }
}

function createRandomColor() {
    let hue, saturation, lightness;
    const range = Math.random();

    if (range < 0.3) {
        hue = Math.random() * 30;
    } else if (range < 0.6) {
        hue = Math.random() * 60 + 180;
    } else {
        hue = Math.random() * 30 + 330;
    }
    saturation = Math.random() * 30 + 70;
    lightness = Math.random() * 60 + 40;

    return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
}

function heartAnimate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    hearts.forEach((heart, index) => {
        heart.y -= heart.speed;
        heart.x += heart.horizontalSpeed;
        heart.horizontalSpeed += (Math.random() - 0.5) * 0.1;
        heart.alpha = 0.2 + (heart.y / canvas.height) * 0.8;

        if (heart.y <= heart.targetHeight && heart.explosionProbability) {
            createExplosion(heart.x, heart.y);
            hearts.splice(index, 1);
        } else if (heart.y < -heart.size || heart.x < -heart.size || heart.x > canvas.width + heart.size) {
            hearts.splice(index, 1);
        } else {
            drawHeart(heart.x, heart.y, heart.size, heart.color, heart.alpha);
        }
    });

    confetti.forEach((confetto, index) => {
        confetto.x += confetto.speedX;
        confetto.y += confetto.speedY;
        confetto.alpha -= 0.01;

        if (confetto.alpha <= 0) {
            confetti.splice(index, 1);
        } else {
            drawConfetti(confetto);
        }
    });

    heartAnimationFrameId = requestAnimationFrame(heartAnimate);
}

function startHeartAnimation() {
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);
    heartAnimationIntervalId = setInterval(createHeart, 300);
    heartAnimate();
}

function stopHeartAnimation() {
    cancelAnimationFrame(heartAnimationFrameId);
    clearInterval(heartAnimationIntervalId);
}

function resumeHeartAnimation() {
    heartAnimationIntervalId = setInterval(createHeart, 300);
    heartAnimationFrameId = requestAnimationFrame(heartAnimate);
}

canvas.addEventListener("mousemove", function (event) {
    const rect = canvas.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;

    let mouseOverHeart = false;
    hearts.forEach((heart) => {
        const dx = mouseX - heart.x;
        const dy = mouseY - heart.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < heart.size) {
            mouseOverHeart = true;
        }
    });

    if (mouseOverHeart) {
        canvas.style.cursor = "pointer";
    } else {
        canvas.style.cursor = "default";
    }
});

canvas.addEventListener("click", function (event) {
    const rect = canvas.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;

    hearts.forEach((heart, index) => {
        const dx = mouseX - heart.x;
        const dy = mouseY - heart.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < heart.size) {
            createExplosion(heart.x, heart.y);
            hearts.splice(index, 1);
        }
    });
});

window.onload = startHeartAnimation;

window.addEventListener("visibilitychange", function () {
    if (document.visibilityState === "hidden") {
        stopHeartAnimation();
    } else {
        resumeHeartAnimation();
    }
});