// AfriBit Cards - Demo Logic

// Currencies focused on Flutterwave + Paystack supported markets
const CURRENCIES = [
  { code: 'NGN', name: 'Nigerian Naira', symbol: '₦', flag: '🇳🇬' },
  { code: 'GHS', name: 'Ghanaian Cedi', symbol: 'GH₵', flag: '🇬🇭' },
  { code: 'KES', name: 'Kenyan Shilling', symbol: 'KSh', flag: '🇰🇪' },
  { code: 'ZAR', name: 'South African Rand', symbol: 'R', flag: '🇿🇦' },
  { code: 'UGX', name: 'Ugandan Shilling', symbol: 'USh', flag: '🇺🇬' },
  { code: 'TZS', name: 'Tanzanian Shilling', symbol: 'TSh', flag: '🇹🇿' },
  { code: 'RWF', name: 'Rwandan Franc', symbol: 'FRw', flag: '🇷🇼' },
  { code: 'XOF', name: 'West African CFA (Francophone)', symbol: 'CFA', flag: '🇸🇳' },
  { code: 'USD', name: 'US Dollar', symbol: '$', flag: '🇺🇸' }
];

// Preset amounts by currency (realistic local values)
const PRESETS = {
  NGN: [5000, 10000, 25000, 50000, 100000, 250000],
  GHS: [50, 100, 250, 500, 1000, 2500],
  KES: [1000, 2500, 5000, 10000, 25000, 50000],
  ZAR: [100, 250, 500, 1000, 2500, 5000],
  UGX: [20000, 50000, 100000, 250000, 500000, 1000000],
  TZS: [20000, 50000, 100000, 250000, 500000, 1000000],
  RWF: [10000, 25000, 50000, 100000, 250000, 500000],
  XOF: [5000, 10000, 25000, 50000, 100000, 250000],
  USD: [10, 25, 50, 100, 250, 500]
};

// Approximate BTC rates (demo only - static)
const BTC_RATES = {
  NGN: 0.00000095,
  GHS: 0.000062,
  KES: 0.0000072,
  ZAR: 0.000055,
  UGX: 0.00000026,
  TZS: 0.00000037,
  RWF: 0.00000068,
  XOF: 0.0000016,
  USD: 0.000016
};

function generateCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let parts = [];
  for (let i = 0; i < 4; i++) {
    let part = '';
    for (let j = 0; j < 4; j++) {
      part += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    parts.push(part);
  }
  return 'AB-' + parts.join('-');
}

function formatMoney(amount, currency) {
  const cur = CURRENCIES.find(c => c.code === currency);
  if (!cur) return amount.toLocaleString();
  return cur.symbol + ' ' + Number(amount).toLocaleString();
}

function getBtcEstimate(amount, currency) {
  const rate = BTC_RATES[currency] || 0.00001;
  const btc = amount * rate;
  if (btc < 0.0001) return btc.toFixed(8);
  if (btc < 0.01) return btc.toFixed(6);
  return btc.toFixed(5);
}

// Populate currency select
function initCurrencySelect() {
  const select = document.getElementById('currency');
  if (!select) return;

  CURRENCIES.forEach(c => {
    const opt = document.createElement('option');
    opt.value = c.code;
    opt.textContent = `${c.flag} ${c.code} — ${c.name}`;
    select.appendChild(opt);
  });

  select.addEventListener('change', updatePresets);
  updatePresets();
}

function updatePresets() {
  const currency = document.getElementById('currency')?.value || 'NGN';
  const grid = document.getElementById('amountGrid');
  if (!grid) return;

  const amounts = PRESETS[currency] || PRESETS.NGN;
  grid.innerHTML = '';

  amounts.forEach((amt, idx) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'amount-btn' + (idx === 1 ? ' active' : '');
    btn.textContent = formatMoney(amt, currency);
    btn.dataset.amount = amt;
    btn.addEventListener('click', () => {
      document.querySelectorAll('.amount-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      document.getElementById('customAmount').value = amt;
      updateSummary();
    });
    grid.appendChild(btn);
  });

  // set default
  document.getElementById('customAmount').value = amounts[1];
  updateSummary();
}

function updateSummary() {
  const currency = document.getElementById('currency')?.value || 'NGN';
  const amount = parseFloat(document.getElementById('customAmount')?.value) || 0;
  const fee = Math.max(amount * 0.015, 50); // demo 1.5% fee, min 50
  const total = amount + fee;
  const btc = getBtcEstimate(amount, currency);
  const cur = CURRENCIES.find(c => c.code === currency);

  const set = (id, val) => {
    const el = document.getElementById(id);
    if (el) el.textContent = val;
  };

  set('sumAmount', formatMoney(amount, currency));
  set('sumFee', formatMoney(fee.toFixed(0), currency));
  set('sumTotal', formatMoney(total.toFixed(0), currency));
  set('sumBtc', `≈ ${btc} BTC`);
  set('previewAmount', formatMoney(amount, currency));
  set('previewCurrency', cur ? cur.name : currency);

  // Live virtual card preview
  const previewEl = document.getElementById('livePreview');
  if (previewEl && amount > 0) {
    const demoCode = 'AB-PREVIEW-CARD';
    previewEl.innerHTML = renderVirtualCard(demoCode, amount, currency);
    setTimeout(() => drawBarcode('barcode-ABPREVIEWCARD', demoCode), 30);
  }
}

function openPaymentModal() {
  const amount = parseFloat(document.getElementById('customAmount')?.value) || 0;
  if (amount <= 0) {
    alert('Please enter a valid amount');
    return;
  }
  document.getElementById('paymentModal')?.classList.add('active');
}

function closePaymentModal() {
  document.getElementById('paymentModal')?.classList.remove('active');
}

function selectPaymentMethod(el) {
  document.querySelectorAll('.payment-method').forEach(m => m.classList.remove('selected'));
  el.classList.add('selected');
}

function processPayment() {
  const selected = document.querySelector('.payment-method.selected');
  if (!selected) {
    alert('Please select a payment method');
    return;
  }

  // Simulate processing
  const btn = document.getElementById('payBtn');
  btn.disabled = true;
  btn.textContent = 'Processing...';

  setTimeout(() => {
    const code = generateCode();
    const currency = document.getElementById('currency').value;
    const amount = document.getElementById('customAmount').value;

    // Store in localStorage for "My Cards" demo
    const cards = JSON.parse(localStorage.getItem('afribit_cards') || '[]');
    cards.unshift({
      code,
      amount: parseFloat(amount),
      currency,
      date: new Date().toISOString(),
      status: 'Active'
    });
    localStorage.setItem('afribit_cards', JSON.stringify(cards.slice(0, 20)));

    // Show success
    document.getElementById('paymentStep').style.display = 'none';
    document.getElementById('successStep').style.display = 'block';
    document.getElementById('giftCode').textContent = code;
    document.getElementById('successAmount').textContent = formatMoney(amount, currency);

    btn.disabled = false;
    btn.textContent = 'Pay Now';
  }, 1800);
}

function copyCode() {
  const code = document.getElementById('giftCode')?.textContent;
  if (code) {
    navigator.clipboard.writeText(code).then(() => {
      const btn = document.getElementById('copyBtn');
      if (btn) {
        btn.textContent = 'Copied!';
        setTimeout(() => btn.textContent = 'Copy Code', 2000);
      }
    });
  }
}

function closeSuccess() {
  closePaymentModal();
  document.getElementById('paymentStep').style.display = 'block';
  document.getElementById('successStep').style.display = 'none';
  const preview = document.getElementById('buyEmailPreview');
  if (preview) {
    preview.style.display = 'none';
    preview.innerHTML = '';
  }
  // Reset form slightly
  updatePresets();
}

function simulateBuyEmail() {
  const code = document.getElementById('giftCode')?.textContent || 'AB-XXXX-XXXX-XXXX';
  const amountText = document.getElementById('successAmount')?.textContent || '';
  const preview = document.getElementById('buyEmailPreview');
  if (!preview) return;

  preview.innerHTML = `
    <div style="font-weight:700; margin-bottom:8px;">📧 Simulated Email Receipt</div>
    <p style="margin:4px 0;"><strong>To:</strong> you@example.com</p>
    <p style="margin:4px 0;"><strong>Subject:</strong> Your AfriBit Bitcoin Gift Card is ready 🎁</p>
    <hr style="border-color:var(--border); margin:12px 0;">
    <p>Hi there,</p>
    <p>Thank you for your purchase! Your Bitcoin gift card (<strong>${amountText}</strong>) is ready.</p>
    <div style="background:rgba(247,147,26,0.12); border:1px dashed var(--accent); padding:14px; border-radius:8px; text-align:center; font-family:monospace; font-size:1.15rem; font-weight:700; color:var(--accent); letter-spacing:1px; margin:12px 0;">
      ${code}
    </div>
    <p style="font-size:0.8rem; color:var(--text-muted);">This is a simulated email for demonstration only. In a live product this would be sent via a transactional email provider (SendGrid, Postmark, etc.).</p>
  `;
  preview.style.display = 'block';

  // Count it
  let count = parseInt(localStorage.getItem('afribit_emails') || '0') + 1;
  localStorage.setItem('afribit_emails', count);
}

// FAQ toggle
function initFAQ() {
  document.querySelectorAll('.faq-question').forEach(btn => {
    btn.addEventListener('click', () => {
      const item = btn.parentElement;
      item.classList.toggle('open');
    });
  });
}

// Load My Cards
function loadMyCards() {
  const container = document.getElementById('cardsList');
  if (!container) return;

  const cards = JSON.parse(localStorage.getItem('afribit_cards') || '[]');
  if (cards.length === 0) {
    container.innerHTML = `
      <div class="feature-card text-center" style="grid-column: 1 / -1;">
        <div class="feature-icon">🎁</div>
        <h3>No cards yet</h3>
        <p>Buy your first Bitcoin gift card to see it here.</p>
        <a href="buy.html" class="btn btn-primary mt-4">Buy a Card</a>
      </div>`;
    return;
  }

  container.innerHTML = cards.map(c => `
    <div class="feature-card">
      <div style="display:flex;justify-content:space-between;align-items:start;margin-bottom:12px;">
        <span style="font-size:0.8rem;color:var(--text-muted);">${new Date(c.date).toLocaleDateString()}</span>
        <span style="background:rgba(0,214,143,0.15);color:var(--success);padding:4px 10px;border-radius:20px;font-size:0.75rem;font-weight:600;">${c.status}</span>
      </div>
      <div style="font-family:'Space Grotesk',monospace;font-size:1.1rem;font-weight:700;color:var(--accent);letter-spacing:1px;margin-bottom:8px;">${c.code}</div>
      <div style="font-size:1.3rem;font-weight:700;">${formatMoney(c.amount, c.currency)}</div>
      <div style="color:var(--text-secondary);font-size:0.85rem;margin-top:4px;">≈ ${getBtcEstimate(c.amount, c.currency)} BTC</div>
    </div>
  `).join('');
}

// Init
document.addEventListener('DOMContentLoaded', () => {
  initCurrencySelect();
  initFAQ();
  loadMyCards();

  const customInput = document.getElementById('customAmount');
  if (customInput) {
    customInput.addEventListener('input', updateSummary);
  }
});
// ========== USD rates (demo static, approx mid-2026) ==========
const USD_RATES = {
  NGN: 0.00065, GHS: 0.065, KES: 0.0077, ZAR: 0.055,
  UGX: 0.00027, TZS: 0.00038, RWF: 0.00072, XOF: 0.00165, USD: 1
};

function getUsdValue(amount, currency) {
  const rate = USD_RATES[currency] || 0.001;
  return (amount * rate).toFixed(2);
}

// ========== Beautiful Virtual Card HTML ==========
function renderVirtualCard(code, amount, currency) {
  const local = formatMoney(amount, currency);
  const usd = getUsdValue(amount, currency);
  const btc = getBtcEstimate(amount, currency);
  return `
    <div class="virtual-card">
      <div class="vc-top">
        <div class="vc-brand">
          <div class="vc-brand-icon">₿</div>
          AfriBit
        </div>
        <div class="vc-chip"></div>
      </div>
      <div class="vc-amount">
        <div class="local">${local}</div>
        <div class="usd">≈ $${usd} USD</div>
      </div>
      <div class="vc-code-label">Gift Code</div>
      <div class="vc-code">${code}</div>
      <div class="vc-barcode">
        <svg id="barcode-${code.replace(/[^A-Z0-9]/g,'')}"></svg>
        <div class="vc-barcode-text">${code}</div>
      </div>
    </div>
  `;
}

function drawBarcode(svgId, text) {
  // Simple pure JS barcode (Code 128-ish bars) without external lib
  const svg = document.getElementById(svgId);
  if (!svg) return;
  const clean = text.replace(/[^A-Z0-9]/g, '');
  let bars = '';
  let x = 0;
  // Start guard
  bars += `<rect x="${x}" y="0" width="2" height="40" fill="#000"/>`; x += 3;
  bars += `<rect x="${x}" y="0" width="1" height="40" fill="#000"/>`; x += 2;
  for (let i = 0; i < clean.length; i++) {
    const code = clean.charCodeAt(i);
    const w1 = (code % 3) + 1;
    const w2 = ((code >> 2) % 3) + 1;
    bars += `<rect x="${x}" y="0" width="${w1}" height="40" fill="#000"/>`; x += w1 + 1;
    bars += `<rect x="${x}" y="0" width="${w2}" height="40" fill="#000"/>`; x += w2 + 1.5;
  }
  // End
  bars += `<rect x="${x}" y="0" width="1" height="40" fill="#000"/>`; x += 2;
  bars += `<rect x="${x}" y="0" width="2" height="40" fill="#000"/>`;
  svg.setAttribute('viewBox', `0 0 ${x + 4} 40`);
  svg.setAttribute('width', '100%');
  svg.setAttribute('height', '48');
  svg.innerHTML = bars;
}

// Override processPayment success to use beautiful card
const originalProcessPayment = typeof processPayment === 'function' ? processPayment : null;

function processPayment() {
  const selected = document.querySelector('.payment-method.selected');
  if (!selected) {
    alert('Please select a payment method');
    return;
  }

  const btn = document.getElementById('payBtn');
  if (btn) {
    btn.disabled = true;
    btn.textContent = 'Processing...';
  }

  setTimeout(() => {
    const code = generateCode();
    const currency = document.getElementById('currency')?.value || 'NGN';
    const amount = parseFloat(document.getElementById('customAmount')?.value) || 0;

    const cards = JSON.parse(localStorage.getItem('afribit_cards') || '[]');
    cards.unshift({
      code,
      amount,
      currency,
      date: new Date().toISOString(),
      status: 'Active',
      usd: getUsdValue(amount, currency)
    });
    localStorage.setItem('afribit_cards', JSON.stringify(cards.slice(0, 20)));

    // Beautiful success UI
    const successStep = document.getElementById('successStep');
    if (successStep) {
      successStep.innerHTML = `
        <div style="font-size: 2.2rem; margin-bottom: 8px;">🎉</div>
        <h3 style="margin-bottom: 6px;">Your Gift Card is Ready!</h3>
        <p style="margin-bottom: 20px;">Amount: <strong>${formatMoney(amount, currency)}</strong> ≈ $${getUsdValue(amount, currency)} USD</p>
        
        ${renderVirtualCard(code, amount, currency)}
        
        <div style="margin-top: 20px; display: flex; flex-direction: column; gap: 10px;">
          <button class="btn btn-primary btn-block" onclick="navigator.clipboard.writeText('${code}').then(()=>alert('Code copied!'))">Copy Code</button>
          <button class="btn btn-outline btn-block" onclick="simulateBuyEmail()">📧 Simulate Email Receipt</button>
          <a href="my-cards.html" class="btn btn-outline btn-block">View My Cards</a>
          <button class="btn btn-outline btn-block" onclick="closeSuccess()">Buy Another</button>
        </div>
        <div id="buyEmailPreview" style="display:none; margin-top:16px; text-align:left; background:var(--bg-secondary); border:1px solid var(--border); border-radius:12px; padding:16px; font-size:0.85rem;"></div>
      `;
      successStep.style.display = 'block';
      document.getElementById('paymentStep').style.display = 'none';
      
      // Draw barcode after DOM update
      setTimeout(() => drawBarcode('barcode-' + code.replace(/[^A-Z0-9]/g,''), code), 50);
    }

    if (btn) {
      btn.disabled = false;
      btn.textContent = 'Pay Now';
    }
  }, 1600);
}

// Enhanced My Cards with virtual cards
function loadMyCards() {
  const container = document.getElementById('cardsList');
  if (!container) return;

  const cards = JSON.parse(localStorage.getItem('afribit_cards') || '[]');
  if (cards.length === 0) {
    container.innerHTML = `
      <div class="feature-card text-center" style="grid-column: 1 / -1;">
        <div class="feature-icon">🎁</div>
        <h3>No cards yet</h3>
        <p>Buy your first Bitcoin gift card to see it here.</p>
        <a href="buy.html" class="btn btn-primary mt-4">Buy a Card</a>
      </div>`;
    return;
  }

  container.innerHTML = cards.map(c => `
    <div style="display:flex; flex-direction:column; gap:12px;">
      ${renderVirtualCard(c.code, c.amount, c.currency)}
      <div style="text-align:center; font-size:0.8rem; color:var(--text-muted);">
        ${new Date(c.date).toLocaleString()} · ${c.status}
      </div>
    </div>
  `).join('');

  // Draw all barcodes
  setTimeout(() => {
    cards.forEach(c => {
      drawBarcode('barcode-' + c.code.replace(/[^A-Z0-9]/g,''), c.code);
    });
  }, 80);
}

// Mobile nav toggle
function initMobileNav() {
  const toggle = document.querySelector('.mobile-toggle');
  const links = document.querySelector('.nav-links');
  if (toggle && links) {
    toggle.addEventListener('click', () => {
      links.classList.toggle('mobile-open');
    });
  }
}

// Re-bind init
document.addEventListener('DOMContentLoaded', () => {
  initCurrencySelect();
  initFAQ();
  loadMyCards();
  initMobileNav();

  const customInput = document.getElementById('customAmount');
  if (customInput) {
    customInput.addEventListener('input', updateSummary);
  }
});
