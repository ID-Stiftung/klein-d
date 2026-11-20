
// ---- Flächen (m² je Raum) und 2D-Grundriss mit Schnitt durchs Geschoss
(function(){
 const fmt=v=>v.toFixed(1).replace('.',','), pip=(x,y,P)=>{ let c=false; for(let i=0,j=P.length-1;i<P.length;j=i++){ const a=P[i],b=P[j]; if(((a[1]>y)!==(b[1]>y))&&(x<(b[0]-a[0])*(y-a[1])/(b[1]-a[1])+a[0])) c=!c; } return c; };
 const CUT={EG:1.3,OG:1.1}, HIDERX=/^(Haus_(Dachpfanne|Ortgang|Schiefer|Schuessel|Gaubendach|Schornsteinkopf)|Innen_Dachschraege|Schraege_)/;
 const lab=document.createElement('div'); lab.id='rlab'; document.body.appendChild(lab);
 const leg=document.createElement('div'); leg.id='rleg'; document.body.appendChild(leg);
 leg.onclick=()=>leg.classList.toggle('full');
 const here=document.createElement('div'); here.id='rhere'; document.body.appendChild(here);
 const grp=new T.Group(); grp.visible=false; scene.add(grp); let items=[], areas=false, autoRoof=false, saved=null;
 const RD=()=>VARS[vi].rooms;
 function build(){ while(grp.children.length) grp.remove(grp.children[0]); lab.innerHTML=''; items=[]; const D=RD(); if(!D) return;
  ['EG','OG'].forEach(fl=>{ const z=D[fl].z;
   if(D[fl].m){ const [x0,x1,y0,y1]=D[fl].mb, tx=new T.TextureLoader().load(D[fl].m); const pm=new T.Mesh(new T.PlaneGeometry(x1-x0,y1-y0),new T.MeshBasicMaterial({color:0x2a2724,alphaMap:tx,transparent:true,depthTest:false,depthWrite:false}));
    pm.rotation.x=-Math.PI/2; pm.position.copy(B((x0+x1)/2,(y0+y1)/2,z+CUT[fl]-.01)); pm.renderOrder=10; pm.userData.fl=fl; pm.userData.h=1; grp.add(pm); }
   D[fl].rooms.forEach(r=>{ const pts=r.p.map(q=>B(q[0],q[1],z+.03)); pts.push(pts[0].clone());
    const ln=new T.Line(new T.BufferGeometry().setFromPoints(pts),new T.LineBasicMaterial({color:0x2f6fd0})); ln.userData.fl=fl; grp.add(ln);
    const el=document.createElement('div'); el.className='rl'+(r.n==='Abseite'?' sm':''); el.innerHTML='<b>'+r.n+'</b><span>'+fmt(r.a)+' m²'+(fl==='OG'?'<br>Wohnfl. '+fmt(r.w)+' m²':'')+'</span>'; lab.appendChild(el);
    items.push({el,p:B(r.x,r.y,z+.05),fl,ab:r.n==='Abseite'}); });
   if(fl==='OG') [['h2',0x2f6fd0],['h1',0xc8502c]].forEach(([k,c])=>(D.OG[k]||[]).forEach(l=>{ const L=new T.Line(new T.BufferGeometry().setFromPoints(l.map(q=>B(q[0],q[1],z+.035))),new T.LineDashedMaterial({color:c,dashSize:.18,gapSize:.12})); L.computeLineDistances(); L.userData.fl='OG'; L.userData.h=1; grp.add(L); }));
  }); }
 const curFl=()=>PLAN||(mode==='walk'?(camera.position.y>3.1?'OG':'EG'):(document.getElementById('bOG').classList.contains('on')?'EG':'OG'));
 function legend(fl){ const D=RD(); if(!D){ leg.style.display='none'; return; } const sum=(f,k)=>D[f].rooms.reduce((s,r)=>s+r[k],0);
  let h='<b>'+(PLAN?'Grundriss ':'Flächen ')+fl+'</b>';
  h+=fl==='EG'?'<div>Grundfläche '+fmt(sum('EG','a'))+' m²</div>':'<div>Grundfläche '+fmt(sum('OG','a'))+' m² · Wohnfläche '+fmt(sum('OG','w'))+' m²</div>';
  h+='<div class="g">'+(fl==='EG'?'OG: Grundfläche '+fmt(sum('OG','a'))+' m² · Wohnfläche '+fmt(sum('OG','w'))+' m²':'EG: Grundfläche '+fmt(sum('EG','a'))+' m²')+'</div>';
  h+='<div class="g">Haus gesamt Wohnfläche '+fmt(sum('EG','w')+sum('OG','w'))+' m²</div>';
  if(fl==='OG') h+='<div class="g"><i style="border-color:#2f6fd0"></i>2 m lichte Höhe <i style="border-color:#c8502c"></i>1 m — Wohnfläche: unter 2 m halb, unter 1 m nicht (WoFlV)</div>';
  if(PLAN){ const ppm=innerHeight/orbit.r; let m=[1,2,5,10,20,50].find(q=>q*ppm>=70)||50; h+='<div class="sc"><span style="width:'+Math.round(m*ppm)+'px"></span>'+m+' m · Straße ↑</div>'; }
  h+='<div class="g">Aus dem Modell berechnet, Werte ca.</div>'; if(leg.innerHTML!==h) leg.innerHTML=h; leg.style.display='block'; }
 const v=new T.Vector3();
 (function tick(){ requestAnimationFrame(tick); const on=areas||!!PLAN; grp.visible=on;
  if(!on){ lab.style.display=leg.style.display=here.style.display='none'; return; }
  const fl=curFl(); grp.children.forEach(o=>o.visible=o.userData.fl===fl&&(!o.userData.h||!!PLAN)); if(mode==='walk') leg.style.display='none'; else legend(fl);
  if(mode==='walk'){ lab.style.display='none'; const D=RD(); let t=''; if(D){ const r=D[fl].rooms.find(r=>pip(camera.position.x,-camera.position.z,r.p)); if(r) t='<b>'+r.n+'</b> · '+fmt(r.a)+' m²'+(fl==='OG'?' · Wohnfläche '+fmt(r.w)+' m²':''); }
   here.innerHTML=t; here.style.display=t?'block':'none'; return; }
  here.style.display='none'; lab.style.display=(!PLAN&&orbit.r>32)?'none':'block'; const w=innerWidth,h=innerHeight;
  items.forEach(it=>{ if(it.fl!==fl||(it.ab&&!PLAN)){ it.el.style.display='none'; return; } v.copy(it.p).project(camera); if(v.z>1||v.z<-1||Math.abs(v.x)>1.1||Math.abs(v.y)>1.1){ it.el.style.display='none'; return; }
   it.el.style.display='block'; it.el.style.transform='translate('+((v.x+1)/2*w).toFixed(1)+'px,'+((1-v.y)/2*h).toFixed(1)+'px) translate(-50%,-50%)'; }); })();
 function planMats(on){ ALLR().forEach(R=>R.traverse(o=>{ if(!o.isMesh) return;
  if(HIDERX.test(o.name)){ if(on){ if(o.userData.pv===undefined){ o.userData.pv=o.visible; o.visible=false; } } else if(o.userData.pv!==undefined){ o.visible=o.userData.pv; delete o.userData.pv; } } })); }
 function enterPlan(fl,keep){ const D=RD(); if(!saved) saved={fog:scene.fog,fov:camera.fov}; if(PLAN) planMats(false); PLAN=fl;
  const z=D?D[fl].z:(fl==='EG'?.3:2.94); scene.fog=null; camera.fov=2; camera.updateProjectionMatrix(); setMode('orbit',true);
  renderer.clippingPlanes=[new T.Plane(new T.Vector3(0,-1,0),z+CUT[fl])]; sun.castShadow=false; planMats(true);
  if(!keep){ const wide=innerWidth>innerHeight; orbit.r=wide?18.5:Math.min(40,17.5*innerHeight/innerWidth); orbit.target.copy(B(wide?-1.2:-3,wide?-7.4:-5.6,z)); } orbit.target.y=z; orbit.theta=0; orbit.phi=1e-4;
  showHint(isTouch?'Ziehen = verschieben · zwei Finger = zoomen':'Ziehen = verschieben · Rad = zoomen'); }
 function exitPlan(){ if(!PLAN) return; PLAN=null; planMats(false); scene.fog=saved.fog; camera.fov=saved.fov; camera.updateProjectionMatrix(); saved=null; renderer.clippingPlanes=[]; sun.castShadow=true; orbit.phi=.9; orbit.r=Math.min(orbit.r*1.6,40); }
 window.exitPlan=exitPlan;
 Object.keys(VIEWS).forEach(k=>{ const f=VIEWS[k]; VIEWS[k]=()=>{ exitPlan(); f(); }; });
 VIEWS.grundriss=()=>{ setCut(false); enterPlan('EG'); }; VIEWS.grundriss_og=()=>{ setCut(false); enterPlan('OG'); };
 ['bOrbit','bWalk'].forEach(id=>document.getElementById(id).addEventListener('click',()=>{ if(PLAN){ exitPlan(); setCut(false); } }));
 document.getElementById('bOG').addEventListener('click',()=>{ if(PLAN){ const p=PLAN; exitPlan(); setCut(false); } });
 const keepPlan=fn=>(...a)=>{ const p=PLAN; if(p) planMats(false); fn(...a); if(p){ planMats(true); renderer.clippingPlanes=[new T.Plane(new T.Vector3(0,-1,0),(RD()?RD()[p].z:0)+CUT[p])]; } };
 const _sv=setVariant; setVariant=i=>{ keepPlan(_sv)(i); build(); }; const _ss=setSeason; setSeason=keepPlan(_ss);
 const po=document.getElementById('pOpt'), bA=document.createElement('button'); bA.className='btn'; bA.id='bArea'; bA.textContent='Flächen anzeigen'; po.insertBefore(bA,po.firstChild);
 const bRoof=document.getElementById('bRoof');
 bA.onclick=()=>{ areas=!areas; bA.textContent=areas?'Flächen ausblenden':'Flächen anzeigen'; bA.classList.toggle('on',areas);
  if(areas&&!PLAN&&!bRoof.classList.contains('on')){ bRoof.click(); autoRoof=true; } if(!areas&&autoRoof){ if(bRoof.classList.contains('on')) bRoof.click(); autoRoof=false; }
  if(areas&&!PLAN&&mode==='orbit'&&orbit.r>30){ orbitTo(B(-3,-7.4,3),24,B(-3+Math.sin(orbit.theta)*10,-7.4-Math.cos(orbit.theta)*10),.75); }
  if(areas&&!PLAN&&mode==='orbit') showHint('Flächen im Obergeschoss · „Obergeschoss ausblenden“ zeigt das Erdgeschoss'); };
 const t0=setInterval(()=>{ if(model){ clearInterval(t0); build(); } },200);
})();

