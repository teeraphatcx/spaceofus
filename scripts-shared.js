// ================================================================
// SHARED SCRIPTS — Used across all pages
// Mobile menu, scroll progress, probe animation, trail canvas,
// magnetic buttons, tilt cards, scroll reveal
// ================================================================

document.addEventListener('DOMContentLoaded', () => {
  // ---------------- Mobile Menu Toggle ----------------
  const mobileMenuBtn = document.getElementById('mobileMenuBtn');
  const mainNav = document.getElementById('mainNav');
  if (mobileMenuBtn && mainNav) {
    mobileMenuBtn.addEventListener('click', () => {
      mobileMenuBtn.classList.toggle('active');
      mainNav.classList.toggle('active');
    });
    mainNav.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        mobileMenuBtn.classList.remove('active');
        mainNav.classList.remove('active');
      });
    });
  }

  // ---------------- Scroll Progress Bar ----------------
  window.addEventListener('scroll', () => {
    const scrollProgress = document.getElementById('scrollProgress');
    if (!scrollProgress) return;
    const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = (window.pageYOffset / totalHeight) * 100;
    scrollProgress.style.width = `${progress}%`;
  });

  // ================================================================
  // SIGNATURE INTERACTION — the cursor acts as a diagnostic "probe"
  // ================================================================
  const root = document.documentElement;
  const probe = document.getElementById('probe');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  let targetX = window.innerWidth / 2, targetY = window.innerHeight * 0.3;
  let curX = targetX, curY = targetY;

  window.addEventListener('mousemove', (e) => {
    targetX = e.clientX; targetY = e.clientY;
    if (probe) probe.classList.add('active');
  });
  window.addEventListener('mouseleave', () => {
    if (probe) probe.classList.remove('active');
  });

  function animateProbe() {
    curX += (targetX - curX) * 0.18;
    curY += (targetY - curY) * 0.18;
    root.style.setProperty('--mx', curX + 'px');
    root.style.setProperty('--my', curY + 'px');
    requestAnimationFrame(animateProbe);
  }
  if (!reduceMotion) requestAnimationFrame(animateProbe);

  // ---- trailing particle canvas ----
  const canvas = document.getElementById('trailCanvas');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    let particles = [];
    function resizeCanvas() { canvas.width = window.innerWidth; canvas.height = window.innerHeight; }
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    let lastTrailX = targetX, lastTrailY = targetY;
    window.addEventListener('mousemove', (e) => {
      if (reduceMotion) return;
      const dist = Math.hypot(e.clientX - lastTrailX, e.clientY - lastTrailY);
      if (dist > 6) {
        particles.push({ x: e.clientX, y: e.clientY, life: 1 });
        lastTrailX = e.clientX; lastTrailY = e.clientY;
        if (particles.length > 40) particles.shift();
      }
    });

    function drawTrail() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      if (!reduceMotion) {
        ctx.lineJoin = 'round';
        for (let i = 1; i < particles.length; i++) {
          const p0 = particles[i - 1], p1 = particles[i];
          ctx.beginPath();
          ctx.moveTo(p0.x, p0.y);
          ctx.lineTo(p1.x, p1.y);
          ctx.strokeStyle = `rgba(28,111,234,${p1.life * 0.5})`;
          ctx.lineWidth = 1.5 * p1.life;
          ctx.stroke();
        }
        particles.forEach(p => p.life -= 0.035);
        particles = particles.filter(p => p.life > 0);
      }
      requestAnimationFrame(drawTrail);
    }
    requestAnimationFrame(drawTrail);
  }

  // ---- magnetic buttons ----
  document.querySelectorAll('.magnetic').forEach(el => {
    el.addEventListener('mousemove', (e) => {
      const r = el.getBoundingClientRect();
      const relX = e.clientX - r.left - r.width / 2;
      const relY = e.clientY - r.top - r.height / 2;
      el.style.transform = `translate(${relX * 0.18}px, ${relY * 0.25}px)`;
    });
    el.addEventListener('mouseleave', () => { el.style.transform = ''; });
  });

  // ---- tilt cards ----
  document.querySelectorAll('.tilt-card, #tiltImage').forEach(el => {
    el.addEventListener('mousemove', (e) => {
      const r = el.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5;
      const py = (e.clientY - r.top) / r.height - 0.5;
      el.style.transform = `perspective(700px) rotateX(${(-py * 6).toFixed(2)}deg) rotateY(${(px * 8).toFixed(2)}deg)`;
    });
    el.addEventListener('mouseleave', () => {
      el.style.transform = 'perspective(700px) rotateX(0deg) rotateY(0deg)';
    });
  });

  // ---- scroll reveal ----
  const revealEls = document.querySelectorAll('.reveal');
  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });
  revealEls.forEach(el => io.observe(el));
});
