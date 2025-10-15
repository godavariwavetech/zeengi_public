var confetti = {
    maxCount: 150,
    speed: 2,
    frameInterval: 15,
    alpha: 1,
    gradient: false,
    start: null,
    stop: null,
    toggle: null,
    pause: null,
    resume: null,
    togglePause: null,
    remove: null,
    isPaused: null,
    isRunning: null
};

(function () {
    confetti.start = startConfetti;
    confetti.stop = stopConfetti;
    confetti.toggle = () => confetti.isRunning() ? stopConfetti() : startConfetti();
    confetti.pause = pauseConfetti;
    confetti.resume = resumeConfetti;
    confetti.togglePause = () => confetti.isPaused() ? resumeConfetti() : pauseConfetti();
    confetti.isPaused = () => pause;
    confetti.remove = removeConfetti;
    confetti.isRunning = () => streamingConfetti;

    const colors = [
        "rgba(30,144,255,", "rgba(107,142,35,", "rgba(255,215,0,",
        "rgba(255,192,203,", "rgba(106,90,205,", "rgba(173,216,230,",
        "rgba(238,130,238,", "rgba(152,251,152,", "rgba(70,130,180,",
        "rgba(244,164,96,", "rgba(210,105,30,", "rgba(220,20,60,"
    ];

    let streamingConfetti = false,
        animationTimer = null,
        pause = false,
        lastFrameTime = Date.now(),
        particles = [],
        waveAngle = 0,
        context = null;

    function resetParticle(p, width, height) {
        p.color = colors[Math.random() * colors.length | 0] + confetti.alpha + ")";
        p.color2 = colors[Math.random() * colors.length | 0] + confetti.alpha + ")";
        p.x = Math.random() * width;
        p.y = Math.random() * height - height;
        p.diameter = 10 * Math.random() + 5;
        p.tilt = 10 * Math.random() - 10;
        p.tiltAngleIncrement = 0.07 * Math.random() + 0.05;
        p.tiltAngle = Math.random() * Math.PI;
        return p;
    }

    function startConfetti(timeout, min, max) {
        const width = window.innerWidth;
        const height = window.innerHeight;

        let canvas = document.getElementById("confetti-canvas");

        if (!canvas) {
            canvas = document.createElement("canvas");
            canvas.setAttribute("id", "confetti-canvas");
            canvas.setAttribute("style", `
                position: fixed;
                top: 0;
                left: 0;
                width: 100vw;
                height: 100vh;
                z-index: 999999;
                pointer-events: none;
            `);
            document.body.prepend(canvas);
            canvas.width = width;
            canvas.height = height;

            window.addEventListener("resize", () => {
                canvas.width = window.innerWidth;
                canvas.height = window.innerHeight;
            }, true);

            context = canvas.getContext("2d");
        } else if (!context) {
            context = canvas.getContext("2d");
        }

        let count = confetti.maxCount;
        if (min !== undefined && max !== undefined) {
            if (min === max) count = particles.length + max;
            else {
                if (min > max) [min, max] = [max, min];
                count = particles.length + (Math.random() * (max - min) + min | 0);
            }
        } else if (min !== undefined) {
            count = particles.length + min;
        }

        while (particles.length < count) particles.push(resetParticle({}, width, height));

        streamingConfetti = true;
        pause = false;
        runAnimation();

        if (timeout !== undefined) {
            setTimeout(stopConfetti, timeout);
        }
    }

    function stopConfetti() {
        streamingConfetti = false;
    }

    function removeConfetti() {
        stopConfetti();
        pause = false;
        particles = [];
        if (context) context.clearRect(0, 0, window.innerWidth, window.innerHeight);
    }

    function pauseConfetti() {
        pause = true;
    }

    function resumeConfetti() {
        pause = false;
        runAnimation();
    }

    function runAnimation() {
        if (pause) return;
        if (particles.length === 0) {
            if (context) context.clearRect(0, 0, window.innerWidth, window.innerHeight);
            return;
        }

        const now = Date.now();
        const delta = now - lastFrameTime;

        if (!window.requestAnimationFrame || delta > confetti.frameInterval) {
            if (context) context.clearRect(0, 0, window.innerWidth, window.innerHeight);
            updateParticles();
            drawParticles(context);
            lastFrameTime = now - (delta % confetti.frameInterval);
        }

        animationTimer = requestAnimationFrame(runAnimation);
    }

    function updateParticles() {
        const width = window.innerWidth;
        const height = window.innerHeight;
        waveAngle += 0.01;

        for (let i = 0; i < particles.length; i++) {
            const p = particles[i];
            if (!streamingConfetti && p.y < -15) {
                p.y = height + 100;
                continue;
            }

            p.tiltAngle += p.tiltAngleIncrement;
            p.x += Math.sin(waveAngle) - 0.5;
            p.y += (Math.cos(waveAngle) + p.diameter + confetti.speed) * 0.5;
            p.tilt = 15 * Math.sin(p.tiltAngle);

            if (p.x > width + 20 || p.x < -20 || p.y > height) {
                if (streamingConfetti && particles.length <= confetti.maxCount)
                    resetParticle(p, width, height);
                else {
                    particles.splice(i, 1);
                    i--;
                }
            }
        }
    }

    function drawParticles(ctx) {
        for (let i = 0; i < particles.length; i++) {
            const p = particles[i];
            ctx.beginPath();
            ctx.lineWidth = p.diameter;
            const x = p.x + p.tilt;
            const x2 = x + p.diameter / 2;
            const y = p.y + p.tilt + p.diameter / 2;

            if (confetti.gradient) {
                const grad = ctx.createLinearGradient(x, p.y, x2, y);
                grad.addColorStop("0", p.color);
                grad.addColorStop("1.0", p.color2);
                ctx.strokeStyle = grad;
            } else {
                ctx.strokeStyle = p.color;
            }

            ctx.moveTo(x2, p.y);
            ctx.lineTo(x, y);
            ctx.stroke();
        }
    }
})();
