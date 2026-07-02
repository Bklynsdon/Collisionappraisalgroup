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

// ============================================================
// AI CHAT WIDGET
// Runs fully in the browser with a claims-knowledge base.
// Swap answerFor() with a fetch() to a real Claude API backend
// when a server/key is available.
// ============================================================
(function chatWidget() {
  const fab = document.getElementById('chatFab');
  const panel = document.getElementById('chatPanel');
  const closeBtn = document.getElementById('chatClose');
  const msgs = document.getElementById('chatMsgs');
  const chips = document.getElementById('chatChips');
  const form = document.getElementById('chatForm');
  const input = document.getElementById('chatInput');
  if (!fab || !panel) return;

  const PHONE = '754-300-8130';
  const EMAIL = 'Collisionappraisalgroup@gmail.com';

  const KB = [
    {
      keys: ['diminished', 'dv', 'value after', 'worth less', 'resale'],
      a: `Diminished value is the money your vehicle loses simply because it now has an accident history — even after perfect repairs. Insurers rarely volunteer this payment.\n\nWe document your loss with a USPAP-compliant report and pursue the claim for you. Most owners have no idea they're owed this.`
    },
    {
      keys: ['total loss', 'totaled', 'write off', 'actual cash value', 'acv'],
      a: `When an insurer declares a total loss, their "actual cash value" offer is often below true market value. We build an independent valuation using real comparable vehicles in your market and challenge low offers.\n\nIf you've received a total-loss offer, don't sign anything yet — call us at ${PHONE} first.`
    },
    {
      keys: ['cost', 'price', 'fee', 'charge', 'how much', 'pay'],
      a: `Your initial claim review is completely free — we'll tell you honestly whether it's worth pursuing.\n\nAppraisal fees depend on the service (damage appraisal, diminished value, total loss, expert witness). Call ${PHONE} for a quote — most clients recover far more than the fee.`
    },
    {
      keys: ['ccc', 'estimating', 'software', 'platform'],
      a: `We build estimates on CCC ONE — the same platform used by 80%+ of collision repairers and the major insurance carriers. VIN-decoded OEM parts, current regional labor rates, documented line items.\n\nBecause our numbers come from the industry's own tooling, adjusters can't easily dismiss them.`
    },
    {
      keys: ['process', 'how it work', 'steps', 'what happens', 'start', 'begin'],
      a: `Four steps:\n1. Free claim review — send us your vehicle info, photos, and the insurer's offer.\n2. Inspection & CCC ONE estimate.\n3. You receive a USPAP-compliant written report.\n4. We back your number with the insurer — through appraisal or litigation support if needed.`
    },
    {
      keys: ['hours', 'open', 'available', 'when'],
      a: `We're available 24/7 across South Florida. Accidents don't keep business hours — neither do we.`
    },
    {
      keys: ['area', 'where', 'location', 'florida', 'serve', 'miami', 'broward', 'palm beach'],
      a: `We serve all of South Florida — Miami-Dade, Broward, and Palm Beach — with inspections by appointment, 24/7.`
    },
    {
      keys: ['human', 'person', 'talk', 'call', 'phone', 'contact', 'email', 'speak', 'appraiser'],
      a: `Absolutely — a real appraiser is a call away:\n\n📞 ${PHONE}\n✉️ ${EMAIL}\n\nAvailable 24/7. Mention you came from the website chat.`
    },
    {
      keys: ['insurance', 'insurer', 'adjuster', 'lowball', 'low offer', 'denied', 'dispute', 'fight'],
      a: `Insurers write estimates to protect their bottom line — not yours. As independent appraisers we work only for you, never for carriers.\n\nIf your offer feels low, it usually is. Send us the estimate and photos for a free second look.`
    },
    {
      keys: ['right to appraisal', 'appraisal clause', 'disagree'],
      a: `Most policies contain an appraisal clause: when you and the insurer disagree on value, each side appoints an independent appraiser. We serve as YOUR appraiser and fight for your number. It's often the fastest way to resolve a stuck claim.`
    },
    {
      keys: ['hello', 'hi', 'hey', 'good morning', 'good afternoon', 'yo'],
      a: `Hi there! 👋 I can answer questions about damage appraisals, diminished value, total loss claims, and how we work. What's going on with your vehicle?`
    },
    {
      keys: ['thank', 'thanks', 'great', 'awesome'],
      a: `You're welcome! If you need anything else, I'm here — or reach a live appraiser anytime at ${PHONE}.`
    },
  ];

  const FALLBACK = `Good question — every claim is a little different, and I don't want to guess on something that affects your money.\n\nA real appraiser can answer in minutes:\n📞 ${PHONE}\n✉️ ${EMAIL}\n\nOr try asking me about diminished value, total loss, our process, or fees.`;

  const QUICK = [
    'What is diminished value?',
    'How much does it cost?',
    'How does the process work?',
    'Talk to a human',
  ];

  let greeted = false;

  function addMsg(text, who) {
    const div = document.createElement('div');
    div.className = 'msg ' + who;
    div.textContent = text;
    msgs.appendChild(div);
    msgs.scrollTop = msgs.scrollHeight;
    return div;
  }

  function showTyping() {
    const t = document.createElement('div');
    t.className = 'msg bot typing';
    t.innerHTML = '<i></i><i></i><i></i>';
    msgs.appendChild(t);
    msgs.scrollTop = msgs.scrollHeight;
    return t;
  }

  function answerFor(text) {
    const q = text.toLowerCase();
    let best = null, bestScore = 0;
    for (const item of KB) {
      const score = item.keys.reduce((s, k) => s + (q.includes(k) ? 1 : 0), 0);
      if (score > bestScore) { bestScore = score; best = item; }
    }
    return best ? best.a : FALLBACK;
  }

  function botReply(text) {
    const t = showTyping();
    const delay = 600 + Math.min(text.length * 6, 900);
    setTimeout(() => { t.remove(); addMsg(answerFor(text), 'bot'); }, delay);
  }

  function renderChips() {
    chips.innerHTML = '';
    QUICK.forEach(q => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'chip';
      b.textContent = q;
      b.addEventListener('click', () => { send(q); });
      chips.appendChild(b);
    });
  }

  function send(text) {
    const clean = text.trim();
    if (!clean) return;
    addMsg(clean, 'user');
    input.value = '';
    botReply(clean);
  }

  function openChat() {
    panel.classList.add('open');
    panel.setAttribute('aria-hidden', 'false');
    fab.setAttribute('aria-expanded', 'true');
    if (!greeted) {
      greeted = true;
      setTimeout(() => {
        addMsg(`Hi! I'm the CAG Assistant 🤖 — ask me anything about damage appraisals, diminished value, or your insurance claim.`, 'bot');
        renderChips();
      }, 350);
    }
    setTimeout(() => input.focus(), 380);
  }

  function closeChat() {
    panel.classList.remove('open');
    panel.setAttribute('aria-hidden', 'true');
    fab.setAttribute('aria-expanded', 'false');
  }

  fab.addEventListener('click', () => panel.classList.contains('open') ? closeChat() : openChat());
  closeBtn.addEventListener('click', closeChat);
  form.addEventListener('submit', (e) => { e.preventDefault(); send(input.value); });
})();

// ---- card glow follows cursor ----
document.querySelectorAll('.card').forEach(card => {
  card.addEventListener('mousemove', (ev) => {
    const r = card.getBoundingClientRect();
    card.style.setProperty('--mx', ((ev.clientX - r.left) / r.width) * 100 + '%');
    card.style.setProperty('--my', ((ev.clientY - r.top) / r.height) * 100 + '%');
  });
});
