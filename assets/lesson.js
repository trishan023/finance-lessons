(function(){
const id=+document.body.dataset.lesson,L=LESSONS[id],C=COURSE,$=s=>document.querySelector(s);
const built=Object.keys(LESSONS).map(Number).filter(i=>LESSONS[i].status=="done");
const css=n=>getComputedStyle(document.documentElement).getPropertyValue(n).trim();
const esc=s=>String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
document.title=`${id}. ${L.title} · ${C.title}`;
const prev=built.includes(id-1)?id-1:null,next=built.includes(id+1)?id+1:null;
const connItems=[id-1,id,id+1].filter(i=>LESSONS[i]).map(i=>{const x=LESSONS[i],nm=x.short||x.title;
 return i==id?`<span class="cur">${esc(nm)}</span>`:(x.status=="done"?`<a href="lesson-${i}.html">${esc(nm)}</a>`:`<span>${esc(nm)} (soon)</span>`)}).join('<span class="arr" aria-hidden="true">→</span>');
const conn=`<div class="conn">${connItems}</div>`;
const c=L.calc;
document.body.innerHTML=`<header class="top"><div class="in"><a href="index.html">← All lessons</a><span class="lbl mono">${id} of 14</span></div><div class="bar" style="width:${id/14*100}%"></div></header>
<div class="wrap"><main>
<p class="lbl" style="margin-top:24px">${esc(L.company)} · ${esc(L.periodLong)}</p><h1>${esc(L.title)}</h1>
<ol class="sum">${L.summary.map(s=>`<li>${esc(s)}</li>`).join('')}</ol>
<h2>The numbers</h2><p class="lbl">${esc(L.chart.unit)}</p><div class="chart" id="chartbox"><div class="skel"></div></div>
<p class="take">${esc(L.takeaway)}</p><ul class="notes">${L.notes.map(n=>`<li>${esc(n)}</li>`).join('')}</ul>
<h2>Try it: ${esc(c.title)}</h2><div class="seg" role="group" aria-label="Presets">${c.presets.map((p,i)=>`<button type="button" data-i="${i}">${esc(p.label)}${p.example?'<span class="tag">example values</span>':''}</button>`).join('')}</div>
<p class="preset-note" id="pnote"></p><p class="lbl" id="punit"></p>
<form id="calc" onsubmit="return false">${c.fields.map(([k,lab])=>`<div class="row"><label for="f-${k}">${esc(lab)}</label><input id="f-${k}" name="${k}" inputmode="decimal" autocomplete="off"></div>`).join('')}
${c.toggle?`<label class="toggle"><input type="checkbox" id="tog"> ${esc(c.toggle)}</label>`:''}</form>
<div class="res" id="res" aria-live="polite"></div>
<h2>Sources</h2><div class="src">${L.sources.map(s=>`<a href="${s.url}" target="_blank" rel="noopener"><span>${esc(s.name)}<br><span class="lbl">${esc(s.year)}</span></span><span class="lbl">${esc(s.kind)}</span></a>`).join('')}</div>
<h2>Check yourself</h2><p>${esc(L.exercise.q)}</p><div class="exin"><input id="ans" inputmode="decimal" aria-label="Your answer (${esc(L.exercise.unit)})" placeholder="${esc(L.exercise.unit)}"><button class="btn" id="chk" type="button">Check</button></div><p class="fb" id="fb" aria-live="polite"></p>
<h2 class="inline-conn">How it connects</h2><div class="inline-conn">${conn}</div>
<nav class="foot">${prev?`<a href="lesson-${prev}.html">← ${prev}. ${esc(LESSONS[prev].title)}</a>`:'<a href="index.html">← All lessons</a>'}${next?`<a href="lesson-${next}.html" style="text-align:right">${next}. ${esc(LESSONS[next].title)} →</a>`:'<a href="index.html" style="text-align:right">All lessons →</a>'}</nav>
<p class="disc">Education, not personal financial advice.</p></main>
<aside class="rail"><p class="lbl">How it connects</p>${conn}</aside></div>`;
// calculator
const parse=v=>{v=String(v).replace(/[,\s$]/g,'').replace(/^A|^US/,'');return v===''?NaN:Number(v)};
let cur=0;
function compute(){const v={};let bad=false;c.fields.forEach(([k])=>{const el=$('#f-'+k),n=parse(el.value);el.classList.toggle('bad',el.value!==''&&isNaN(n));v[k]=n});
 const t=c.toggle?$('#tog').checked:false;
 $('#res').innerHTML=c.out(v,t).map(([k,val,f])=>`<div><div class="lbl">${esc(k)}</div><div class="big">${esc(val)}</div><div class="ex">${esc(f)}</div></div>`).join('')}
function preset(i){cur=i;const p=c.presets[i];document.querySelectorAll('.seg button').forEach((b,j)=>{b.classList.toggle('on',j==i);b.setAttribute('aria-pressed',j==i)});
 c.fields.forEach(([k])=>{$('#f-'+k).value=p.v[k]==null?'':Number(p.v[k]).toLocaleString('en-AU',{maximumFractionDigits:2})});
 $('#pnote').textContent=p.note||'';$('#punit').textContent='Units: '+p.unit;compute()}
document.querySelectorAll('.seg button').forEach(b=>b.onclick=()=>preset(+b.dataset.i));
$('#calc').addEventListener('input',compute);preset(0);
// exercise
const E=L.exercise;$('#chk').onclick=()=>{const n=parse($('#ans').value),fb=$('#fb');
 if(isNaN(n)){fb.className='fb no';fb.textContent='Enter a number.';return}
 const ok=Math.abs(n-E.answer)<=E.tol;fb.className='fb '+(ok?'ok':'no');fb.textContent=ok?E.right:E.wrong};
$('#ans').addEventListener('keydown',e=>{if(e.key=='Enter')$('#chk').click()});
// chart
function draw(){const box=$('#chartbox');if(!window.Chart){box.innerHTML='<div class="err">Couldn\'t load figures. Refresh to try again.</div>';return}
 box.innerHTML='<canvas role="img" aria-label="'+esc(L.chart.unit)+' chart"></canvas>';
 const A=css('--a'),T=css('--t'),M=css('--m'),D=css('--d'),LOSS=css('--l'),NEU='#3A3A3A',ch=L.chart,phone=innerWidth<600;
 const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;Chart.defaults.font.family='Geist';Chart.defaults.color=M;
 const fmt=v=>ch.fmt=='x'?v.toFixed(1)+'x':ch.fmt=='%'?v.toFixed(1)+'%':(Math.abs(v)>=100?Math.round(v).toLocaleString('en-AU'):v.toFixed(1));
 let labels,data,colors,datasets,horiz=false;
 if(ch.type=='waterfall'){horiz=phone;let run=0;labels=ch.steps.map(s=>s[0]);data=[];colors=[];
  ch.steps.forEach(([n,v,k])=>{v=v/ch.scale;if(k){data.push([0,v]);run=v;colors.push(k=='result'?A:NEU)}else{data.push([run,run+v]);run+=v;colors.push(v<0?LOSS:css('--g'))}});
  datasets=[{data,backgroundColor:colors,borderRadius:2}]}
 else if(ch.type=='bars'){horiz=phone;labels=ch.bars.map(b=>b[0]);datasets=[{data:ch.bars.map(b=>b[1]),backgroundColor:ch.bars.map(b=>b[2]=='result'?A:b[2]=='cost'?LOSS:NEU),borderRadius:2}]}
 else{horiz=phone;labels=ch.labels;datasets=[{label:ch.a.name,data:ch.a.d,backgroundColor:A,borderRadius:2},{label:ch.b.name,data:ch.b.d,backgroundColor:M,borderRadius:2}]}
 if(horiz)box.style.height=Math.max(280,labels.length*(ch.type=='pair'?56:40)+40)+'px';
 const vAxis={grid:{color:D},border:{display:false},ticks:{callback:v=>fmt(+v),maxTicksLimit:phone?4:6}},cAxis={grid:{display:false},border:{color:D},ticks:{color:T,autoSkip:false,maxRotation:0,font:{size:phone?12:13}}};
 if(!horiz)cAxis.ticks.callback=function(v){const s=this.getLabelForValue(v);return s.length>12?s.split(' '):s};
 new Chart(box.firstChild,{type:'bar',data:{labels,datasets},options:{indexAxis:horiz?'y':'x',maintainAspectRatio:false,animation:reduce?false:{duration:400},
  plugins:{legend:{display:ch.type=='pair',labels:{color:T,boxWidth:12}},tooltip:{callbacks:{label:x=>{const r=x.raw;return (x.dataset.label?x.dataset.label+': ':'')+fmt(Array.isArray(r)?r[1]-r[0]:r)}}}},
  scales:horiz?{x:vAxis,y:cAxis}:{x:cAxis,y:vAxis}}})}
setTimeout(draw,0);
})();
