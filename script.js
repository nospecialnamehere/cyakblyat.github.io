// Mapping for shorthand suffixes
const shorthandMap = { k: 3, m: 6, b: 9, t: 12, qa: 15, qu: 18, sx: 21, sp: 24, o: 27, n: 30, d: 33 };

// Parse shorthand numbers like 2k, 5m, etc.
const parseRegular = (v) => {
  if (!v) return NaN;
  v = v.toString().trim().toLowerCase();
  let m = 1;
  if (v.endsWith('k')) m = 1e3;
  else if (v.endsWith('m')) m = 1e6;
  else if (v.endsWith('b')) m = 1e9;
  return parseFloat(v.replace(/[kmb]/, '')) * m;
};

// Parse either shorthand or base/exp inputs for volume or RP
const parseVolRP = (v, baseId, expId) => {
  if (!v) return NaN;
  v = v.toString().trim().toLowerCase();
  let key = Object.keys(shorthandMap).sort((a, b) => b.length - a.length).find(k => v.endsWith(k));
  if (key) {
    return parseFloat(v.replace(key, '')) * Math.pow(10, shorthandMap[key]);
  }
  const base = parseFloat(document.getElementById(baseId).value);
  const exp = parseFloat(document.getElementById(expId).value);
  if (!isNaN(base) && !isNaN(exp)) return base * Math.pow(10, exp);
  return parseFloat(v);
};

// Format minutes into "hr min" string
const fm = m => {
  let h = Math.floor(m / 60), min = Math.round(m % 60);
  return h && min ? `${h} hr ${min} min` : h ? `${h} hr` : `${min} min`;
};

// Mode toggle
let shorthandMode = true;
function toggleMode() {
  shorthandMode = !shorthandMode;
  document.getElementById('v_shorthand').style.display = shorthandMode ? 'flex' : 'none';
  document.getElementById('r_shorthand').style.display = shorthandMode ? 'flex' : 'none';
  document.getElementById('v_baseexp').style.display = shorthandMode ? 'none' : 'flex';
  document.getElementById('r_baseexp').style.display = shorthandMode ? 'none' : 'flex';
  document.getElementById('toggleModeBtn').innerText = shorthandMode ? 'Shorthand' : 'Base/Exp Vol & RP';
}

// Parse tr input, allowing "392-292" format
function parseTR(v) {
  if (!v) return NaN;
  v = v.toString().trim();
  if (v.includes('-')) {
    let parts = v.split('-').map(p => parseRegular(p.trim()));
    if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
      return parts[0] - parts[1];
    }
  }
  return parseRegular(v);
}

// Main calculation function
function calc() {
  let t = parseRegular(document.getElementById('t').value),
      req = parseRegular(document.getElementById('req').value),
      g = parseRegular(document.getElementById('g').value),
      tr = parseTR(document.getElementById('tr').value),
      gt = parseRegular(document.getElementById('gt').value);

  // v and r depend on mode
  let v, r;
  if (shorthandMode) {
    v = parseVolRP(document.getElementById('v').value, 'v_base', 'v_exp');
    r = parseVolRP(document.getElementById('r').value, 'r_base', 'r_exp');
  } else {
    const vBase = parseFloat(document.getElementById('v_base').value);
    const vExp = parseFloat(document.getElementById('v_exp').value);
    const rBase = parseFloat(document.getElementById('r_base').value);
    const rExp = parseFloat(document.getElementById('r_exp').value);
    v = (!isNaN(vBase) && !isNaN(vExp)) ? vBase * Math.pow(10, vExp) : NaN;
    r = (!isNaN(rBase) && !isNaN(rExp)) ? rBase * Math.pow(10, rExp) : NaN;
  }

  let res1 = '', res2 = '', res3 = '';

  if (!isNaN(tr) && !isNaN(t) && !isNaN(req) && !isNaN(g))
    res1 = `Time for ticks = ${fm(tr * req * t / (g * 60))}`;

  if (!isNaN(v) && !isNaN(r) && !isNaN(t) && !isNaN(req))
    res2 = `Time for volume = ${fm(v / (60 * r / (req * t)))}`;

  if (!res1 && !res2 && !isNaN(gt) && !isNaN(r) && !isNaN(t) && !isNaN(req)) {
    let vol = gt * 60 * r / (req * t);
    if (vol < 999 * Math.pow(10, shorthandMap.d)) {
      const units = Object.entries(shorthandMap).sort((a, b) => b[1] - a[1]);
      for (let [sym, exp] of units) {
        if (vol >= Math.pow(10, exp)) {
          vol = (vol / Math.pow(10, exp)).toFixed(2) + sym;
          break;
        }
      }
    } else {
      const exp = Math.floor(Math.log10(vol));
      const base = vol / Math.pow(10, exp);
      vol = `${base.toFixed(3)}e${exp}`;
    }
    res3 = `Volume received = ${vol}`;
  }

  if (!res1 && !res2 && !res3) res1 = '⚠️ Invalid inputs ⚠️';

  document.getElementById('res1').innerText = res1;
  document.getElementById('res2').innerText = res2;
  document.getElementById('res3').innerText = res3;
}