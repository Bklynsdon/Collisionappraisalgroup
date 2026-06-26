// ---- year ----
const yearEl = document.getElementById('year');
if (yearEl) yearEl.textContent = new Date().getFullYear();

// ---- sticky header state + scroll progress ----
const header = document.getElementById('header');
const progress = document.getElementById('scrollProgress');
function onScroll() {
  const y = window.scrollY || document.documentElement.scrollTop;
  if (header) header.classList.toggle('scrolled', y > 20);
  if (progress) {
    const h = document.documentElement.scrollHeight - window.innerHeight;
    progress.style.width = (h > 0 ? (y / h) * 100 : 0) + '%';
  }
}
window.addEventListener('scroll', onScroll, { passive: true });
onScroll();

// ---- mobile nav ----
const navToggle = document.getElementById('navToggle');
const mobileNav = document.getElementById('mobileNav');
if (navToggle && mobileNav) {
  navToggle.addEventListener('click', () => {
    const open = mobileNav.classList.toggle('open');
    navToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
  });
  mobileNav.querySelectorAll('a').forEach(a =>
    a.addEventListener('click', () => {
      mobileNav.classList.remove('open');
      navToggle.setAttribute('aria-expanded', 'false');
    })
  );
}

// ---- reveal on scroll ----
const revealEls = document.querySelectorAll('.reveal');
if ('IntersectionObserver' in window) {
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e, i) => {
      if (e.isIntersecting) {
        const sib = [...e.target.parentElement.children].indexOf(e.target);
        e.target.style.transitionDelay = Math.min(sib, 6) * 70 + 'ms';
        e.target.classList.add('in');
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
  revealEls.forEach(el => io.observe(el));
} else {
  revealEls.forEach(el => el.classList.add('in'));
}

// ---- animated counters ----
function animateCount(el) {
  const target = parseFloat(el.dataset.target || '0');
  const prefix = el.dataset.prefix || '';
  const suffix = el.dataset.suffix || '';
  const dur = 1600;
  const start = performance.now();
  function tick(now) {
    const p = Math.min((now - start) / dur, 1);
    const eased = 1 - Math.pow(1 - p, 3);
    const val = Math.round(target * eased);
    el.textContent = prefix + val.toLocaleString('en-US') + suffix;
    if (p < 1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}
const counters = document.querySelectorAll('.stat-num');
if ('IntersectionObserver' in window) {
  const co = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) { animateCount(e.target); co.unobserve(e.target); }
    });
  }, { threshold: 0.5 });
  counters.forEach(c => co.observe(c));
} else {
  counters.forEach(animateCount);
}

// ---- progress ring (why-us) ----
const ring = document.getElementById('ring');
if (ring && 'IntersectionObserver' in window) {
  const ro = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) { ring.style.strokeDashoffset = '0'; ro.unobserve(e.target); }
    });
  }, { threshold: 0.4 });
  ro.observe(ring);
}

// ---- card glow follows cursor ----
document.querySelectorAll('.card').forEach(card => {
  card.addEventListener('mousemove', (ev) => {
    const r = card.getBoundingClientRect();
    card.style.setProperty('--mx', ((ev.clientX - r.left) / r.width) * 100 + '%');
    card.style.setProperty('--my', ((ev.clientY - r.top) / r.height) * 100 + '%');
  });
});
