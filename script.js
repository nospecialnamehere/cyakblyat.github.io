// Get input value helper
const get = id => document.getElementById(id).value.trim();

// Format minutes to "x hr y min"
const fm = m => {
  const h = Math.floor(m / 60), min = Math.round(m % 60);
  return h ? `${h} hr${min ? ` ${min} min` : ''}` : `${min} min`;
};

// Add minutes to current time and return formatted string
function addTime(minutes) {
  const now = new Date();
  now.setMinutes(now.getMinutes() + minutes);
  let h = now.getHours();
  const m = now.getMinutes().toString().padStart(2, '0');
  const ampm = h >= 12 ? "pm" : "am";
  h = h % 12 || 12;
  return `${h}:${m} ${ampm}`;
}

// Increment/decrement exponent buttons
function changeExp(id, delta) {
  const input = document.getElementById(id);
  let val = parseInt(input.value) || 36;
  val += delta;
  input.value = val;
}

function adjustExp(id, delta) {
  changeExp(id, delta);
}

// Main calculation
function calc() {
  const t   = parseFloat(get('t')),
        req = parseFloat(get('req')),
        g   = parseFloat(get('g')),
        tr  = parseFloat(get('tr')),
        gt  = parseFloat(get('gt'));

  const v_base = parseFloat(get('v_base')), v_exp = parseInt(get('v_exp'));
  const r_base = parseFloat(get('r_base')), r_exp = parseInt(get('r_exp'));

  const v = (!isNaN(v_base) && !isNaN(v_exp)) ? v_base * 10 ** v_exp : NaN;
  const r = (!isNaN(r_base) && !isNaN(r_exp)) ? r_base * 10 ** r_exp : NaN;

  let res1 = '', res2 = '', res3 = '';

  if ([tr, t, req, g].every(x => !isNaN(x))) {
    const t1 = tr * req * t / (g * 60);
    res1 = `Time for ticks = ${fm(t1)}, ${addTime(t1)}`;
  }

  if ([v, r, t, req].every(x => !isNaN(x))) {
    const t2 = v / (r * 60 / (req * t));
    res2 = `Time for volume = ${fm(t2)}, ${addTime(t2)}`;
  }

  if ([gt, r, t, req].every(x => !isNaN(x))) {
    const vol = gt * 60 * r / (req * t);
    res3 = `Volume received = ${vol.toExponential(3)}`;
  }

  if (!res1 && !res2 && !res3) res1 = '⚠️ Invalid inputs ⚠️';

  ['res1','res2','res3'].forEach((id,i) =>
    document.getElementById(id).innerText = [res1,res2,res3][i]
  );
}

// Collapsible formula cards
function toggleFormulas() {
  const cards = document.getElementById('formulaCards');
  const btn = document.getElementById('toggleFormulasBtn');

  if (cards.classList.contains('show')) {
    cards.classList.remove('show');
    btn.innerText = "Show Formulas ▼";
  } else {
    cards.classList.add('show');
    btn.innerText = "Hide Formulas ▲";
  }
}

// Initialize default values on DOM load
window.addEventListener("DOMContentLoaded", () => {
  document.getElementById("t").value   = 2.25;
  document.getElementById("req").value = 6;
  document.getElementById("g").value   = 12;

  document.getElementById("v_exp").value = 36;
  document.getElementById("r_exp").value = 36;
});