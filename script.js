// Sample mock estimator. In production this would call a real AI/VIN-decode service.
document.getElementById('year').textContent = new Date().getFullYear();

const form = document.getElementById('estimate-form');
const result = document.getElementById('result');
const resultBody = document.getElementById('result-body');

const APPRAISAL_FEE = '49.00';
// Replace with your real PayPal.me handle when ready.
const PAYPAL_ME_HANDLE = 'YourPayPalHandle';

form.addEventListener('submit', (e) => {
  e.preventDefault();
  if (!form.checkValidity()) {
    form.reportValidity();
    return;
  }

  const data = Object.fromEntries(new FormData(form).entries());
  const estimate = generateMockEstimate(data);

  resultBody.innerHTML = renderEstimate(data, estimate);
  wirePayments(data, estimate);

  result.hidden = false;
  result.scrollIntoView({ behavior: 'smooth', block: 'start' });
});

// Deterministic-ish mock: hash VIN + description length to a damage tier.
function generateMockEstimate(data) {
  const vin = (data.vin || '').toUpperCase();
  const desc = (data.description || '').toLowerCase();
  const seed = [...vin].reduce((s, c) => s + c.charCodeAt(0), 0) + desc.length;

  const severityScore = (seed % 100);
  let severity, low, high, parts, labor, paint;

  if (severityScore < 33) {
    severity = 'Minor';
    low = 800; high = 2200;
    parts = ['Front bumper cover', 'Bumper absorber', 'Clips/fasteners'];
    labor = 6; paint = 1;
  } else if (severityScore < 70) {
    severity = 'Moderate';
    low = 2400; high = 5800;
    parts = ['Front bumper cover', 'Headlamp assembly', 'Fender (R/L)', 'Grille', 'Hood'];
    labor = 14; paint = 3;
  } else {
    severity = 'Major';
    low = 6500; high = 14000;
    parts = ['Front bumper assembly', 'Radiator support', 'Both headlamps', 'Hood', 'Both fenders', 'Airbag module (potential)'];
    labor = 28; paint = 6;
  }

  // Adjust by vehicle age (newer = higher parts cost).
  const year = parseInt(data.year, 10);
  const age = isNaN(year) ? 10 : Math.max(0, new Date().getFullYear() - year);
  const ageMultiplier = age < 3 ? 1.25 : age < 8 ? 1.0 : 0.85;
  low = Math.round(low * ageMultiplier);
  high = Math.round(high * ageMultiplier);

  return { severity, low, high, parts, laborHours: labor, paintHours: paint };
}

function fmt(n) { return '$' + n.toLocaleString('en-US'); }

function renderEstimate(data, est) {
  const vehicle = `${data.year} ${data.make} ${data.model} (${data.color})`;
  return `
    <p>Thanks <strong>${escapeHtml(data.name)}</strong> — here is the preliminary AI assessment for your <strong>${escapeHtml(vehicle)}</strong>.</p>

    <div class="estimate-summary">
      <div class="item">
        <div class="label">VIN</div>
        <div class="value">${escapeHtml((data.vin||'').toUpperCase())}</div>
      </div>
      <div class="item">
        <div class="label">Damage Severity</div>
        <div class="value">${est.severity}</div>
      </div>
      <div class="item">
        <div class="label">Labor Hours (est.)</div>
        <div class="value">${est.laborHours} hrs</div>
      </div>
      <div class="item">
        <div class="label">Paint Hours (est.)</div>
        <div class="value">${est.paintHours} hrs</div>
      </div>
    </div>

    <p><strong>Likely affected parts:</strong> ${est.parts.map(escapeHtml).join(', ')}.</p>

    <p>Estimated repair cost range:<br>
      <span class="range">${fmt(est.low)} &mdash; ${fmt(est.high)}</span>
    </p>

    <p style="font-size:13px;color:#5a4500;background:#fff8e6;border-left:4px solid #f0a500;padding:10px 12px;border-radius:6px;">
      Reminder: This is a <strong>preliminary AI-generated estimate</strong> based only on the photos and information you provided.
      It is <strong>not accurate until reviewed by a licensed appraiser in person</strong>.
    </p>
  `;
}

function wirePayments(data, est) {
  const note = encodeURIComponent(
    `Collision Appraisal Group - Appraisal fee for VIN ${(data.vin||'').toUpperCase()}`
  );
  // PayPal.me link — quickest to set up. Replace handle in PAYPAL_ME_HANDLE above.
  const paypalUrl = `https://www.paypal.com/paypalme/${PAYPAL_ME_HANDLE}/${APPRAISAL_FEE}`;
  document.getElementById('paypal-link').href = paypalUrl;

  // Apple Pay requires a merchant integration (Apple Pay JS or a processor like Stripe).
  // For the sample, we show an alert explaining the next step.
  const applePay = document.getElementById('applepay-link');
  applePay.onclick = (e) => {
    e.preventDefault();
    alert(
      'Apple Pay requires merchant setup (e.g., via Stripe or Apple Pay JS).\n\n' +
      'For this sample, please use PayPal. We will wire up Apple Pay once your merchant account is ready.'
    );
  };
}

function escapeHtml(s) {
  return String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
