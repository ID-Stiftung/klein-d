
// ---- Laubkarten der Bäume: Maske aus dem Grün-Kanal, Schatten mit Löchern, Sommer/Winter-Textur
(function(){ const A=/^Laubkarte_/;
 const fix=()=>ALLR().forEach(R=>R.traverse(o=>{ if(!o.isMesh||!A.test(o.material.name)) return; const m=o.material;
  if(m.alphaMap!==m.map){ m.alphaMap=m.map; m.alphaTest=.2; m.transparent=false; m.needsUpdate=true; }
  if(!o.customDepthMaterial) o.customDepthMaterial=new T.MeshDepthMaterial({depthPacking:T.RGBADepthPacking,alphaTest:.2,side:T.DoubleSide});
  if(o.customDepthMaterial.alphaMap!==m.map){ o.customDepthMaterial.alphaMap=m.map; o.customDepthMaterial.needsUpdate=true; } }));
 const _s=setSeason; setSeason=w=>{ _s(w); fix(); }; const _v=setVariant; setVariant=i=>{ _v(i); fix(); };
 const t=setInterval(()=>{ const L=document.getElementById('load'); if(model&&(!L||L.style.display==='none')){ clearInterval(t); fix(); } },250); })();
// ---- Flächen (m² je Raum) in Übersicht, Rundgang und Grundriss; Grundriss als eigener Modus
(function(){
 const fmt=v=>v.toFixed(1).replace('.',','), pip=(x,y,P)=>{ let c=false; for(let i=0,j=P.length-1;i<P.length;j=i++){ const a=P[i],b=P[j]; if(((a[1]>y)!==(b[1]>y))&&(x<(b[0]-a[0])*(y-a[1])/(b[1]-a[1])+a[0])) c=!c; } return c; };
 const CUT={EG:1.3,OG:1.1}, HIDERX=/^(Haus_(Dachpfanne|Ortgang|Schiefer|Schuessel|Gaubendach|Schornsteinkopf)|Innen_Dachschraege|Schraege_)/;
 const narrow=()=>innerWidth<=640;
 const lab=document.createElement('div'); lab.id='rlab'; document.body.appendChild(lab);
 const leg=document.createElement('div'); leg.id='rleg'; document.body.appendChild(leg); leg.onclick=()=>leg.classList.toggle('full');
 const here=document.createElement('div'); here.id='rhere'; document.body.appendChild(here);
 const grp=new T.Group(); grp.visible=false; scene.add(grp); let items=[], areas=false, autoRoof=false, saved=null, planSeen=false, frame=0;
 const RD=()=>VARS[vi].rooms;
 // --- Bedienelemente: m²-Knopf in der Leiste, Modus Grundriss neben Übersicht/Rundgang, Geschosswahl
 const hud=document.querySelector('.hud'), bOpt=document.getElementById('bOpt');
 const bA=document.createElement('button'); bA.className='btn'; bA.id='bArea'; bA.textContent='m²'; bA.title='Raumgrößen anzeigen'; hud.insertBefore(bA,bOpt);
 const btns=document.querySelector('.btns'), bO=document.getElementById('bOrbit'), bW=document.getElementById('bWalk');
 const bP=document.createElement('button'); bP.className='btn'; bP.id='bPlan'; bP.textContent='Grundriss'; btns.appendChild(bP);
 const lbl=()=>{ const n=narrow(); bO.textContent=n?'3D':'Übersicht'; bW.textContent=n?'Gehen':'Rundgang'; bP.textContent=n?'Plan':'Grundriss'; }; lbl(); addEventListener('resize',lbl);
 const fs=document.createElement('div'); fs.id='flsw'; fs.innerHTML='<button class="btn" data-f="EG">EG</button><button class="btn" data-f="OG">OG</button>'; document.body.appendChild(fs);
 const bOG=document.getElementById('bOG'), bRoof=document.getElementById('bRoof');
 const ogHidden=()=>bOG.classList.contains('on');
 function build(){ while(grp.children.length) grp.remove(grp.children[0]); lab.innerHTML=''; items=[]; const D=RD(); if(!D) return;
  ['EG','OG'].forEach(fl=>{ const z=D[fl].z;
   if(D[fl].m){ const [x0,x1,y0,y1]=D[fl].mb, tx=new T.TextureLoader().load(D[fl].m); const pm=new T.Mesh(new T.PlaneGeometry(x1-x0,y1-y0),new T.MeshBasicMaterial({color:0x2a2724,alphaMap:tx,transparent:true,depthTest:false,depthWrite:false}));
    pm.rotation.x=-Math.PI/2; pm.position.copy(B((x0+x1)/2,(y0+y1)/2,z+CUT[fl]-.01)); pm.renderOrder=10; pm.userData={fl,plan:1}; grp.add(pm); }
   D[fl].rooms.forEach(r=>{ const pts=r.p.map(q=>B(q[0],q[1],z+.03)); pts.push(pts[0].clone());
    const ln=new T.Line(new T.BufferGeometry().setFromPoints(pts),new T.LineBasicMaterial({color:0x2f6fd0})); ln.userData={fl,area:1}; grp.add(ln);
    const el=document.createElement('div'); el.className='rl'+(r.n==='Abseite'?' sm':''); el.innerHTML='<b>'+r.n+'</b><span>'+fmt(r.a)+' m²'+(fl==='OG'?'<br>Wohnfl. '+fmt(r.w)+' m²':'')+'</span>'; lab.appendChild(el);
    items.push({el,p:B(r.x,r.y,z+.05),pw:B(r.x,r.y,z+1.95),fl,ab:r.n==='Abseite',vis:true}); });
   if(fl==='OG') [['h2',0x2f6fd0],['h1',0xc8502c]].forEach(([k,c])=>(D.OG[k]||[]).forEach(l=>{ const L=new T.Line(new T.BufferGeometry().setFromPoints(l.map(q=>B(q[0],q[1],z+.035))),new T.LineDashedMaterial({color:c,dashSize:.18,gapSize:.12})); L.computeLineDistances(); L.userData={fl:'OG',area:1,plan:1}; grp.add(L); }));
  }); }
 const curFl=()=>PLAN||(mode==='walk'?(camera.position.y>3.1?'OG':'EG'):(ogHidden()?'EG':'OG'));
 function legend(fl){ const D=RD(); if(!D){ leg.style.display='none'; return; } const sum=(f,k)=>D[f].rooms.reduce((s,r)=>s+r[k],0);
  let h='<b>Flächen '+fl+'</b>';
  h+=fl==='EG'?'<div>Grundfläche '+fmt(sum('EG','a'))+' m²</div>':'<div>Grundfläche '+fmt(sum('OG','a'))+' m² · Wohnfläche '+fmt(sum('OG','w'))+' m²</div>';
  h+='<div class="g">'+(fl==='EG'?'OG: Grundfläche '+fmt(sum('OG','a'))+' m² · Wohnfläche '+fmt(sum('OG','w'))+' m²':'EG: Grundfläche '+fmt(sum('EG','a'))+' m²')+'</div>';
  h+='<div class="g">Haus gesamt Wohnfläche '+fmt(sum('EG','w')+sum('OG','w'))+' m²</div>';
  if(fl==='OG'&&PLAN) h+='<div class="g"><i style="border-color:#2f6fd0"></i>2 m lichte Höhe <i style="border-color:#c8502c"></i>1 m — Wohnfläche: unter 2 m halb, unter 1 m nicht (WoFlV)</div>';
  if(PLAN){ const ppm=innerHeight/orbit.r; let m=[1,2,5,10,20,50].find(q=>q*ppm>=70)||50; h+='<div class="sc"><span style="width:'+Math.round(m*ppm)+'px"></span>'+m+' m · Straße ↑</div>'; }
  h+='<div class="g">Aus dem Modell berechnet, Werte ca.</div>'; if(leg.innerHTML!==h) leg.innerHTML=h; leg.style.display='block'; }
 const v=new T.Vector3(), rc=new T.Raycaster(), dv=new T.Vector3();
 (function tick(){ requestAnimationFrame(tick); frame++;
  const showSw=!!PLAN||(areas&&mode==='orbit'); fs.style.display=showSw?'flex':'none';
  if(showSw){ const f=curFl(); fs.querySelectorAll('.btn').forEach(b=>b.classList.toggle('on',b.dataset.f===f)); }
  const on=areas||!!PLAN; grp.visible=on;
  if(!on){ lab.style.display=leg.style.display=here.style.display='none'; return; }
  const fl=curFl(); grp.children.forEach(o=>o.visible=o.userData.fl===fl&&(o.userData.plan?!!PLAN&&(!o.userData.area||areas):(areas&&mode!=='walk')));
  if(areas&&mode!=='walk') legend(fl); else leg.style.display='none';
  if(!areas){ lab.style.display=here.style.display='none'; return; }
  const w=innerWidth,h=innerHeight;
  if(mode==='walk'){ const D=RD(); let t=''; if(D){ const r=D[fl].rooms.find(r=>pip(camera.position.x,-camera.position.z,r.p)); if(r) t='Du stehst in: <b>'+r.n+'</b> · '+fmt(r.a)+' m²'+(fl==='OG'?' · Wohnfläche '+fmt(r.w)+' m²':''); }
   here.innerHTML=t; here.style.display=t?'block':'none'; lab.style.display='block'; const chk=frame%6===0;
   items.forEach(it=>{ it.el.classList.add('w'); if(it.fl!==fl||it.ab){ it.el.style.display='none'; return; }
    const d=camera.position.distanceTo(it.pw); if(d>11){ it.el.style.display='none'; return; }
    if(chk){ dv.copy(it.pw).sub(camera.position).normalize(); rc.set(camera.position,dv); rc.far=d-.25; it.vis=rc.intersectObjects(colliders,false).length===0; }
    v.copy(it.pw).project(camera); if(!it.vis||v.z>1||v.z<-1||Math.abs(v.x)>1.05||Math.abs(v.y)>1.05){ it.el.style.display='none'; return; }
    it.el.style.display='block'; it.el.style.transform='translate('+((v.x+1)/2*w).toFixed(1)+'px,'+((1-v.y)/2*h).toFixed(1)+'px) translate(-50%,-50%)'; }); return; }
  here.style.display='none'; lab.style.display=(!PLAN&&orbit.r>32)?'none':'block';
  items.forEach(it=>{ it.el.classList.remove('w'); if(it.fl!==fl||(it.ab&&!PLAN)){ it.el.style.display='none'; return; } v.copy(it.p).project(camera); if(v.z>1||v.z<-1||Math.abs(v.x)>1.1||Math.abs(v.y)>1.1){ it.el.style.display='none'; return; }
   it.el.style.display='block'; it.el.style.transform='translate('+((v.x+1)/2*w).toFixed(1)+'px,'+((1-v.y)/2*h).toFixed(1)+'px) translate(-50%,-50%)'; }); })();
 function planMats(on){ ALLR().forEach(R=>R.traverse(o=>{ if(!o.isMesh) return;
  if(HIDERX.test(o.name)){ if(on){ if(o.userData.pv===undefined){ o.userData.pv=o.visible; o.visible=false; } } else if(o.userData.pv!==undefined){ o.visible=o.userData.pv; delete o.userData.pv; } } })); }
 function enterPlan(fl,keep){ const D=RD(); if(!saved) saved={fog:scene.fog,fov:camera.fov}; if(PLAN) planMats(false); PLAN=fl; if(!planSeen){ planSeen=true; if(!areas) setAreas(true); }
  const z=D?D[fl].z:(fl==='EG'?.3:2.94); scene.fog=null; camera.fov=2; camera.updateProjectionMatrix(); setMode('orbit',true); bO.classList.remove('on'); bP.classList.add('on');
  renderer.clippingPlanes=[new T.Plane(new T.Vector3(0,-1,0),z+CUT[fl])]; sun.castShadow=false; planMats(true);
  if(!keep){ const wide=innerWidth>innerHeight; orbit.r=wide?18.5:Math.min(40,17.5*innerHeight/innerWidth); orbit.target.copy(B(wide?-1.2:-3,wide?-7.4:-5.6,z)); } orbit.target.y=z; orbit.theta=0; orbit.phi=1e-4;
  if(!keep) showHint(isTouch?'Ziehen = verschieben · zwei Finger = zoomen':'Ziehen = verschieben · Rad = zoomen'); }
 function exitPlan(){ if(!PLAN) return; PLAN=null; planMats(false); scene.fog=saved.fog; camera.fov=saved.fov; camera.updateProjectionMatrix(); saved=null; renderer.clippingPlanes=[]; sun.castShadow=true; orbit.phi=.9; orbit.r=Math.min(orbit.r*1.6,40); bP.classList.remove('on'); setCut(false); }
 window.exitPlan=exitPlan;
 Object.keys(VIEWS).forEach(k=>{ const f=VIEWS[k]; VIEWS[k]=()=>{ exitPlan(); f(); }; });
 VIEWS.grundriss=()=>{ setCut(false); enterPlan('EG'); }; VIEWS.grundriss_og=()=>{ setCut(false); enterPlan('OG'); };
 bO.addEventListener('click',()=>{ if(PLAN){ exitPlan(); bO.classList.add('on'); } }); bW.addEventListener('click',()=>{ if(PLAN) exitPlan(); });
 bP.onclick=()=>{ if(PLAN) return; enterPlan(ogHidden()?'EG':(mode==='walk'&&camera.position.y>3.1?'OG':'EG')); };
 fs.addEventListener('click',e=>{ const b=e.target.closest('.btn'); if(!b) return; const f=b.dataset.f;
  if(PLAN){ enterPlan(f,true); return; } if((f==='EG')!==ogHidden()) bOG.click(); });
 bOG.addEventListener('click',()=>{ if(PLAN){ exitPlan(); } });
 const keepPlan=fn=>(...a)=>{ const p=PLAN; if(p) planMats(false); fn(...a); if(p){ planMats(true); renderer.clippingPlanes=[new T.Plane(new T.Vector3(0,-1,0),(RD()?RD()[p].z:0)+CUT[p])]; } };
 const _sv=setVariant; setVariant=i=>{ keepPlan(_sv)(i); build(); }; const _ss=setSeason; setSeason=keepPlan(_ss);
 function setAreas(a){ areas=a; bA.classList.toggle('on',areas);
  if(areas&&!PLAN&&!bRoof.classList.contains('on')){ bRoof.click(); autoRoof=true; } if(!areas&&autoRoof){ if(bRoof.classList.contains('on')) bRoof.click(); autoRoof=false; } }
 bA.onclick=()=>{ setAreas(!areas);
  if(areas&&!PLAN&&mode==='orbit'){ if(orbit.r>30) orbitTo(B(-3,-7.4,3),24,B(-3+Math.sin(orbit.theta)*10,-7.4-Math.cos(orbit.theta)*10),.75); showHint('Raumgrößen · oben EG/OG wählen'); }
  if(areas&&mode==='walk') showHint('Raumgrößen: Schilder in den Räumen'); };
 const t0=setInterval(()=>{ if(model){ clearInterval(t0); build(); } },200);
})();

