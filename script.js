const DEFAULTS = {
  t: 1.60,
  req: 4,
  g: 72,
  v_exp: 251,
  r_exp: 247
};


const get=id=>{
  const v=document.getElementById(id).value.trim();
  if(/^[0-9+\-*/ ().]+$/.test(v)){try{return eval(v)}catch{return NaN}}
  return v
};

const fm=m=>{
  const h=(m/60|0),n=(m%60|0);
  return h?`${h} hr${n?` ${n} min`:""}`:`${n} min`
};

const addTime=m=>{
  const d=new Date();
  d.setMinutes(d.getMinutes()+m);
  let h=d.getHours(),n=(""+d.getMinutes()).padStart(2,"0");
  return`${(h%12||12)}:${n} ${h>=12?"pm":"am"}`
};

const adjustExp=(id,d)=>{
  let v=parseInt(document.getElementById(id).value)||36;
  document.getElementById(id).value=v+d
};

function calc(){
  const t=get("t"),q=get("req"),g=get("g"),tr=get("tr"),gt=get("gt"),
        vb=get("v_base"),ve=get("v_exp"),
        rb=get("r_base"),re=get("r_exp"),
        v=!isNaN(vb)&&!isNaN(ve)?vb*10**ve:NaN,
        r=!isNaN(rb)&&!isNaN(re)?rb*10**re:NaN;

  let a="",b="",c="";

  if([tr,t,q,g].every(x=>!isNaN(x))){
    const x=tr*q*t/(g*60);
    a=`Time for ticks = ${fm(x)}, ${addTime(x)}`
  }

  if([v,r,t,q].every(x=>!isNaN(x))){
    const x=v/(r*60/(q*t));
    b=`Time for volume = ${fm(x)}, ${addTime(x)}`
  }

  if([gt,r,t,q].every(x=>!isNaN(x))){
    const x=gt*60*r/(q*t);
    c=`Volume received = ${x.toExponential(3)}`
  }

  if(!a&&!b&&!c)a="⚠️ Invalid inputs ⚠️";

  document.getElementById("res1").innerText=a;
  document.getElementById("res2").innerText=b;
  document.getElementById("res3").innerText=c;
}

function toggleFormulas(){
  const c=document.getElementById("formulaCards"),b=document.getElementById("toggleFormulasBtn");
  c.classList.contains("show")?
    (c.classList.remove("show"),b.innerText="Show Formulas ▼"):
    (c.classList.add("show"),b.innerText="Hide Formulas ▲")
}

function createRandomStars(n=200){
  const s=document.getElementById("stars"); if(!s)return;
  for(let i=0;i<n;i++){
    const e=document.createElement("div");
    e.className="star";
    e.style.top=Math.random()*innerHeight+"px";
    e.style.left=Math.random()*innerWidth+"px";
    const z=Math.random()*2+1;
    e.style.width=e.style.height=z+"px";
    e.style.opacity=Math.random()*.8+.2;
    s.appendChild(e)
  }
}

function blastStars(n=3){
  for(let i=0;i<n;i++){
    const e=document.createElement("div");
    e.className="blast-star";
    e.style.top=Math.random()*innerHeight+"px";
    e.style.left=Math.random()*innerWidth+"px";
    document.body.appendChild(e);
    setTimeout(()=>e.remove(),1e3)
  }
}

window.addEventListener("DOMContentLoaded",()=>{
  for(const[k,v]of Object.entries(DEFAULTS)){
    const el=document.getElementById(k);
    if(el)el.value=v
  }
  createRandomStars(200);
  setInterval(()=>blastStars(3),1e4)
});

















