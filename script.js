/* ============================================
   PORTFOLIO — Script (v2 — Polished)
   ============================================ */
(() => {
  'use strict';

  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const throttle = (fn, ms) => { let t = 0; return (...a) => { const n = Date.now(); if (n - t >= ms) { t = n; fn(...a); } }; };

  /* ── Particles ────────────────────────── */
  function initParticles() {
    const cvs = $('#particle-canvas');
    if (!cvs) return;
    const ctx = cvs.getContext('2d');
    let W, H, pts, mouse = { x: -999, y: -999 };

    function resize() {
      W = cvs.width = window.innerWidth;
      H = cvs.height = window.innerHeight;
      const count = Math.min(Math.floor((W * H) / 22000), 60);
      pts = Array.from({ length: count }, () => ({
        x: Math.random() * W, y: Math.random() * H,
        vx: (Math.random() - .5) * .25, vy: (Math.random() - .5) * .25,
        r: Math.random() * 1.2 + .4, a: Math.random() * .35 + .08,
      }));
    }

    function loop() {
      ctx.clearRect(0, 0, W, H);
      for (let i = 0; i < pts.length; i++) {
        const p = pts[i];
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > W) p.vx *= -1;
        if (p.y < 0 || p.y > H) p.vy *= -1;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(139,92,246,${p.a})`;
        ctx.fill();
        for (let j = i + 1; j < pts.length; j++) {
          const q = pts[j];
          const dx = p.x - q.x, dy = p.y - q.y, d2 = dx * dx + dy * dy;
          if (d2 < 18000) {
            ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(q.x, q.y);
            ctx.strokeStyle = `rgba(139,92,246,${.04 * (1 - d2 / 18000)})`;
            ctx.lineWidth = .4; ctx.stroke();
          }
        }
        const mdx = p.x - mouse.x, mdy = p.y - mouse.y;
        const md = Math.sqrt(mdx * mdx + mdy * mdy);
        if (md < 130) {
          ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(mouse.x, mouse.y);
          ctx.strokeStyle = `rgba(56,189,248,${.1 * (1 - md / 130)})`;
          ctx.lineWidth = .5; ctx.stroke();
        }
      }
      requestAnimationFrame(loop);
    }

    resize(); loop();
    window.addEventListener('resize', resize);
    document.addEventListener('mousemove', throttle(e => { mouse.x = e.clientX; mouse.y = e.clientY; }, 16));
  }

  /* ── Cursor Glow ──────────────────────── */
  function initCursor() {
    const g = $('#cursorGlow');
    if (!g || window.innerWidth < 769) return;
    document.addEventListener('mousemove', e => {
      requestAnimationFrame(() => { g.style.transform = `translate(${e.clientX - 300}px,${e.clientY - 300}px)`; });
    });
  }

  /* ── Navigation ───────────────────────── */
  function initNav() {
    const nav = $('#nav');
    const toggle = $('#navToggle');
    const menu = $('#navMenu');
    const links = $$('[data-nav]');
    const sections = $$('section[id]');

    // Scroll style + active section
    const onScroll = throttle(() => {
      nav.classList.toggle('scrolled', window.scrollY > 60);
      let cur = '';
      sections.forEach(s => { if (window.scrollY >= s.offsetTop - 140) cur = s.id; });
      links.forEach(a => {
        a.classList.toggle('active', a.getAttribute('href') === `#${cur}`);
      });
    }, 60);
    window.addEventListener('scroll', onScroll);
    onScroll();

    // Hamburger
    if (toggle && menu) {
      toggle.addEventListener('click', () => {
        const open = menu.classList.toggle('open');
        toggle.classList.toggle('open', open);
        document.body.style.overflow = open ? 'hidden' : '';
      });
      links.forEach(a => a.addEventListener('click', () => {
        menu.classList.remove('open');
        toggle.classList.remove('open');
        document.body.style.overflow = '';
      }));
    }
  }

  /* ── Typing ───────────────────────────── */
  function initTyping() {
    const el = $('#typingTarget');
    if (!el) return;
    const phrases = ['Full Stack Developer', 'UI / UX Designer', 'Creative Problem Solver', 'Freelancer & Teenlancer'];
    let pi = 0, ci = 0, del = false, wait = 0;
    function tick() {
      if (wait > 0) { wait -= 50; return setTimeout(tick, 50); }
      const ph = phrases[pi];
      if (!del) {
        el.textContent = ph.substring(0, ++ci);
        if (ci === ph.length) { del = true; wait = 2200; }
        setTimeout(tick, 55 + Math.random() * 35);
      } else {
        el.textContent = ph.substring(0, --ci);
        if (ci === 0) { del = false; pi = (pi + 1) % phrases.length; }
        setTimeout(tick, 28);
      }
    }
    setTimeout(tick, 1000);
  }

  /* ── Scroll Reveal ────────────────────── */
  function initReveal() {
    const items = $$('.reveal,.reveal-left,.reveal-right,.reveal-scale');
    const staggerParents = $$('.stagger');

    const io = new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('is-visible'); io.unobserve(e.target); } });
    }, { threshold: .12, rootMargin: '0px 0px -30px 0px' });

    items.forEach(el => io.observe(el));

    const sio = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('is-visible');
          $$('.stagger-item', e.target).forEach((c, i) => { c.style.transitionDelay = `${i * .1}s`; });
          sio.unobserve(e.target);
        }
      });
    }, { threshold: .08 });
    staggerParents.forEach(el => sio.observe(el));
  }

  /* ── 3D Tilt Cards ────────────────────── */
  function initTilt() {
    if (window.innerWidth < 769) return;
    $$('[data-tilt]').forEach(el => {
      el.addEventListener('mousemove', e => {
        const r = el.getBoundingClientRect();
        const x = e.clientX - r.left, y = e.clientY - r.top;
        const rx = ((y - r.height / 2) / r.height) * -6;
        const ry = ((x - r.width / 2) / r.width) * 6;
        requestAnimationFrame(() => {
          el.style.transform = `perspective(800px) rotateX(${rx}deg) rotateY(${ry}deg) scale3d(1.015,1.015,1.015)`;
        });
        // Shine position
        const shine = el.querySelector('.skill-card__shine,.project-card__shine');
        if (shine) {
          shine.style.setProperty('--mx', `${(x / r.width) * 100}%`);
          shine.style.setProperty('--my', `${(y / r.height) * 100}%`);
        }
      });
      el.addEventListener('mouseleave', () => {
        el.style.transition = 'transform .45s cubic-bezier(.25,.46,.45,.94)';
        el.style.transform = 'perspective(800px) rotateX(0) rotateY(0) scale3d(1,1,1)';
      });
      el.addEventListener('mouseenter', () => { el.style.transition = 'none'; });
    });
  }

  /* ── Hero Parallax (mouse) ────────────── */
  function initParallax() {
    if (window.innerWidth < 769) return;
    const items = $$('[data-speed]');
    document.addEventListener('mousemove', throttle(e => {
      const cx = window.innerWidth / 2, cy = window.innerHeight / 2;
      const dx = (e.clientX - cx) / cx, dy = (e.clientY - cy) / cy;
      items.forEach(el => {
        const s = parseFloat(el.dataset.speed) * 80;
        el.style.marginLeft = `${dx * s}px`;
        el.style.marginTop = `${dy * s}px`;
      });
    }, 16));
  }

  /* ── Counters ─────────────────────────── */
  function initCounters() {
    const nums = $$('[data-count]');
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (!e.isIntersecting) return;
        const el = e.target, target = +el.dataset.count, dur = 1800, start = performance.now();
        (function up(now) {
          const p = Math.min((now - start) / dur, 1);
          const eased = 1 - Math.pow(1 - p, 3);
          el.textContent = Math.round(eased * target) + '+';
          if (p < 1) requestAnimationFrame(up);
        })(start);
        io.unobserve(el);
      });
    }, { threshold: .5 });
    nums.forEach(el => io.observe(el));
  }

  /* ── Skill Bars ───────────────────────── */
  function initBars() {
    const bars = $$('.skill-bar__fill');
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          setTimeout(() => { e.target.style.width = e.target.dataset.width + '%'; }, 150);
          io.unobserve(e.target);
        }
      });
    }, { threshold: .25 });
    bars.forEach(b => io.observe(b));
  }

  /* ── Project Filters ──────────────────── */
  function initFilters() {
    const btns = $$('.filter-btn');
    const cards = $$('.project-card');
    btns.forEach(btn => {
      btn.addEventListener('click', () => {
        btns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const f = btn.dataset.filter;
        cards.forEach((c, i) => {
          const show = f === 'all' || c.dataset.category === f;
          c.classList.toggle('hidden', !show);
          if (show) c.style.animation = `heroFade .45s ${i * .06}s both`;
        });
      });
    });
  }

  /* ── Testimonial Slider ───────────────── */
  function initSlider() {
    const track = $('#testimonialTrack');
    const prev = $('#sliderPrev');
    const next = $('#sliderNext');
    const dots = $$('.slider-dot');
    if (!track) return;
    const total = $$('.testimonial-card', track).length;
    let cur = 0, auto;

    function go(i) {
      cur = ((i % total) + total) % total;
      track.style.transform = `translateX(-${cur * 100}%)`;
      dots.forEach((d, j) => d.classList.toggle('active', j === cur));
    }
    function startAuto() { auto = setInterval(() => go(cur + 1), 5500); }
    function stopAuto() { clearInterval(auto); }

    prev?.addEventListener('click', () => { stopAuto(); go(cur - 1); startAuto(); });
    next?.addEventListener('click', () => { stopAuto(); go(cur + 1); startAuto(); });
    dots.forEach(d => d.addEventListener('click', () => { stopAuto(); go(+d.dataset.slide); startAuto(); }));

    // Swipe
    const slider = $('#testimonialSlider');
    let sx = 0;
    slider?.addEventListener('touchstart', e => { sx = e.changedTouches[0].screenX; stopAuto(); }, { passive: true });
    slider?.addEventListener('touchend', e => {
      const diff = sx - e.changedTouches[0].screenX;
      if (Math.abs(diff) > 40) diff > 0 ? go(cur + 1) : go(cur - 1);
      startAuto();
    }, { passive: true });

    startAuto();
  }

  /* ── Contact Form ─────────────────────── */
  function initForm() {
    const form = $('#contactForm');
    const success = $('#formSuccess');
    if (!form) return;

    form.addEventListener('submit', e => {
      e.preventDefault();
      let ok = true;
      [
        { el: $('#name'), check: v => v.trim().length > 0 },
        { el: $('#email'), check: v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) },
        { el: $('#subject'), check: v => v.trim().length > 0 },
        { el: $('#message'), check: v => v.trim().length > 0 },
      ].forEach(({ el, check }) => {
        const g = el.closest('.form-group');
        if (!check(el.value)) { g.classList.add('error'); ok = false; } else { g.classList.remove('error'); }
      });
      if (ok) {
        const btn = $('#submitBtn');
        btn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:18px;height:18px;animation:spin .8s linear infinite"><circle cx="12" cy="12" r="10" stroke-dasharray="50" stroke-dashoffset="20"/></svg> Sending...';
        btn.disabled = true;
        setTimeout(() => { form.style.display = 'none'; success.classList.add('show'); }, 1400);
      }
    });

    $$('#contactForm input,#contactForm textarea').forEach(inp => {
      inp.addEventListener('input', () => inp.closest('.form-group').classList.remove('error'));
    });
  }

  /* ── Back to Top ──────────────────────── */
  function initTop() {
    const btn = $('#backToTop');
    if (!btn) return;
    window.addEventListener('scroll', throttle(() => btn.classList.toggle('show', window.scrollY > 500), 100));
    btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
  }

  /* ── Smooth Scroll ────────────────────── */
  function initSmooth() {
    $$('a[href^="#"]').forEach(a => {
      a.addEventListener('click', e => {
        const t = document.querySelector(a.getAttribute('href'));
        if (t) { e.preventDefault(); t.scrollIntoView({ behavior: 'smooth' }); }
      });
    });
  }

  /* ── Init ──────────────────────────────── */
  document.addEventListener('DOMContentLoaded', () => {
    initParticles();
    initCursor();
    initNav();
    initTyping();
    initReveal();
    initTilt();
    initParallax();
    initCounters();
    initBars();
    initFilters();
    initSlider();
    initForm();
    initTop();
    initSmooth();
  });
})();
