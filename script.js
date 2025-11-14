// Shorthand suffix map
const shorthandMap = { k:3, m:6, b:9, t:12, qa:15, qu:18, sx:21, sp:24, o:27, n:30, d:33 };
const get = id => document.getElementById(id).value.trim().toLowerCase();

// Parse xk, xm, xb
const parseRegular = v => {
  if (!v) return NaN; v = v.toString().trim().toLowerCase();
  const suf = { k:1e3, m:1e6, b:1e9 }[v.slice(-1)];
  return parseFloat(v.replace(/[kmb]/,'')) * (suf || 1);
};

// Parse xk, xm, qa, etc OR fallback to base/exp
const parseVolRP = (v, b, e) => {
  if (!v) return NaN; v = v.toLowerCase();
  const key = Object.keys(shorthandMap).sort((a,b)=>b.length-a.length)
               .find(k => v.endsWith(k));
  if (key) return parseFloat(v.replace(key,'')) * 10 ** shorthandMap[key];

  const base = +get(b), exp = +get(e);
  return (!isNaN(base) && !isNaN(exp)) ? base * 10 ** exp : parseFloat(v);
};

// Minutes → "x hr y min"
const fm = m => {
  const h = Math.floor(m/60), min = Math.round(m%60);
  return h ? `${h} hr${min?` ${min} min`:''}` : `${min} min`;
};

// Mode toggle
let shorthandMode = true;
function toggleMode() {
  shorthandMode = !shorthandMode;
  ['v_shorthand','r_shorthand'].forEach(id => get(id).style.display = shorthandMode?'flex':'none');
  ['v_baseexp','r_baseexp'].forEach(id => get(id).style.display = shorthandMode?'none':'flex');
  document.getElementById('toggleModeBtn').innerText =
    shorthandMode ? 'Shorthand' : 'Base/Exp Vol & RP';
}

function addTime(minutes) {
  const now = new Date();
  now.setMinutes(now.getMinutes() + minutes);

  let h = now.getHours();
  const m = now.getMinutes().toString().padStart(2, '0');
  const ampm = h >= 12 ? "pm" : "am";
  h = h % 12 || 12; // convert 0 → 12

  return `${h}:${m} ${ampm}`;
}

// Parse TR and allow "A-B"
const parseTR = v => {
  if (!v) return NaN;
  if (v.includes('-')) {
    const [a,b] = v.split('-').map(s => parseRegular(s.trim()));
    return (!isNaN(a)&&!isNaN(b)) ? a - b : NaN;
  }
  return parseRegular(v);
};

// Main calculation
function calc() {
  const t   = parseRegular(get('t')),
        req = parseRegular(get('req')),
        g   = parseRegular(get('g')),
        tr  = parseTR(get('tr')),
        gt  = parseRegular(get('gt'));

  const v = shorthandMode
      ? parseVolRP(get('v'),'v_base','v_exp')
      : (+get('v_base')) * 10 ** (+get('v_exp'));

  const r = shorthandMode
      ? parseVolRP(get('r'),'r_base','r_exp')
      : (+get('r_base')) * 10 ** (+get('r_exp'));

  let res1='', res2='', res3='';

  if ([tr,t,req,g].every(x=>!isNaN(x))) {
    const t1 = tr * req * t / (g * 60);
    res1 = `Time for ticks = ${fm(t1)}, ${addTime(t1)}`;
  }

  if ([v,r,t,req].every(x=>!isNaN(x))) {
    const t2 = v / (60 * r / (req * t));
    res2 = `Time for volume = ${fm(t2)}, ${addTime(t2)}`;
  }

  if (!res1 && !res2 && [gt,r,t,req].every(x=>!isNaN(x))) {
    let vol = gt * 60 * r / (req * t);
    const maxD = 999 * 10 ** shorthandMap.d;

    if (vol < maxD) {
      for (const [sym,exp] of Object.entries(shorthandMap).sort((a,b)=>b[1]-a[1])) {
        if (vol >= 10 ** exp) { vol = (vol/10**exp).toFixed(2) + sym; break; }
      }
    } else {
      const exp = Math.floor(Math.log10(vol));
      vol = `${(vol/10**exp).toFixed(3)}e${exp}`;
    }
    res3 = `Volume received = ${vol}`;
  }

  if (!res1 && !res2 && !res3) res1 = '⚠️ Invalid inputs ⚠️';

  ['res1','res2','res3'].forEach((id,i)=>
    document.getElementById(id).innerText = [res1,res2,res3][i]
  );
}