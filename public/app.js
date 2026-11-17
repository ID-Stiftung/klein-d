
const T=THREE, isTouch=matchMedia('(pointer:coarse)').matches;
const renderer=new T.WebGLRenderer({antialias:true,logarithmicDepthBuffer:true}); renderer.setPixelRatio(Math.min(devicePixelRatio,2)); renderer.setSize(innerWidth,innerHeight);
renderer.outputEncoding=T.sRGBEncoding; renderer.toneMapping=T.ACESFilmicToneMapping; renderer.toneMappingExposure=1.25;
renderer.shadowMap.enabled=true; renderer.shadowMap.type=T.PCFSoftShadowMap; document.body.appendChild(renderer.domElement);
const scene=new T.Scene(); scene.background=new T.Color(0xc9dbea); scene.fog=new T.Fog(0xcfdfee,260,900);
const camera=new T.PerspectiveCamera(58,innerWidth/innerHeight,0.15,4000); camera.rotation.order='YXZ';
const hemi=new T.HemisphereLight(0xeef4ff,0x6d7a55,0.95); scene.add(hemi);
const sun=new T.DirectionalLight(0xfff1dc,1.6); sun.position.set(30,65,28); sun.castShadow=true;
const sm=isTouch?2048:4096; sun.shadow.mapSize.set(sm,sm); Object.assign(sun.shadow.camera,{left:-62,right:62,top:62,bottom:-62,near:1,far:260});
sun.shadow.bias=-0.0004; sun.shadow.normalBias=0.03; scene.add(sun);
// Blender (x,y,z) -> three (x,z,-y)
const B=(x,y,z=0)=>new T.Vector3(x,z,-y);
let model=null, scan=null; const colliders=[];
function b64buf(b){ let u=new Uint8Array(ASSET[b]); if(u[0]===0x1f&&u[1]===0x8b) u=pako.inflate(u); return u.buffer.slice(u.byteOffset,u.byteOffset+u.byteLength); }
const GLB='bestand.bin';
const TEXB={sky:'assets/tex/sky.jpg',sky_w:'assets/tex/sky_w.jpg',grass_w:'assets/tex/grass_w.jpg',field_w:'assets/tex/field_w.jpg',hedge_w:'assets/tex/hedge_w.jpg',woods_w:'assets/tex/woods_w.jpg'};
const TX={}; const tl=new T.TextureLoader();
for(const k in TEXB){ const t=tl.load(TEXB[k]); t.encoding=T.sRGBEncoding; if(k.startsWith('sky')){ t.mapping=T.EquirectangularReflectionMapping; } else { t.flipY=false; t.wrapS=t.wrapT=T.RepeatWrapping; t.anisotropy=8; } TX[k]=t; }
const sky=new T.Mesh(new T.SphereGeometry(3000,32,16), new T.MeshBasicMaterial({map:TX.sky,side:T.BackSide,fog:false,depthWrite:false})); sky.material.map.mapping=T.UVMapping; scene.add(sky);
const WMAP={Rasen:'grass_w',Feld_Getreide:'field_w',Feld_hell:'field_w',Feld_gruen:'field_w',Buchenhecke:'hedge_w',Fernwald:'woods_w'}, WCOL={Beet:0x4a4234,Erdhuegel:0x5a6a40,Blumen:0x6a5a48,Blumen_gelb:0x6a5a48};
const DECID=new Set(['Laub','Laub_dunkel','Birkenlaub','Walnusslaub','Goldahorn','Wilder_Wein']); const mats=new Map(); let winter=false;
function setSeason(w){ winter=w; if(!model) return;
 ALLR().forEach(R=>R.traverse(o=>{ if(!o.isMesh) return; const m=o.material, n=m.name; if(DECID.has(n)) o.visible=!w&&!o.userData.vh;
  if(!mats.has(m)) mats.set(m,{map:m.map,color:m.color.clone()}); const s0=mats.get(m);
  if(WMAP[n]){ m.map=w?TX[WMAP[n]]:s0.map; m.needsUpdate=true; } if(WCOL[n]!==undefined){ if(w) m.color.setHex(WCOL[n]).convertSRGBToLinear(); else m.color.copy(s0.color); } }));
 sky.material.map=w?TX.sky_w:TX.sky; sky.material.needsUpdate=true; scene.fog.color.setHex(w?0xd6d8d6:0xcfdfee); scene.fog.near=w?180:260; scene.fog.far=w?700:900;
 sun.intensity=w?1.0:1.6; sun.color.setHex(w?0xffeedd:0xfff1dc); sunDir.set(30,w?30:65,28); hemi.intensity=w?0.9:0.95; hemi.color.setHex(w?0xe6ebf2:0xeef4ff); hemi.groundColor.setHex(w?0x6a6f60:0x6d7a55);
 document.getElementById('bSeason').textContent=w?'Sommer':'Winter'; }
const sunDir=new T.Vector3(30,65,28);
const VARS=[{n:'Bestand',g:'ohne',k:'Haus wie heute (Bestand)',info:['Haus und Grundstück wie heute – Ausgangspunkt für alle Varianten.','Maße sind noch geschätzt und werden mit dem Aufmaß nachgezogen.']},{n:"Haus geteilt · 2. Terrasse",g:"ohne",k:"Haus geteilt · 2. Terrasse",info:["Das Haus wird in zwei Hälften geteilt, das Grundstück bleibt ganz.", "Zweite Holzterrasse vor dem Wohnzimmer, das Fenster wird zur Terrassentür.", "Holz-Sichtschutz und Büsche trennen die beiden Gartenteile Richtung Nussbaum.", "Dachterrasse auf dem Anbau mit Geländer und Sichtschutz, Holztreppe an der Birkenseite.", "Noch offen: Die Trennwand im Haus ist nicht eingebaut."],hide:["Haus_Blende", "Haus_Carport_Holz", "Haus_Fensterrahmen", "Haus_Glas_Haus", "Haus_Klinker", "Haus_Rollschicht", "Haus_Terrassenholz", "Haus_Zink", "Innen_Holz_dunkel", "Innen_Lack_weiss", "Innen_Wand_innen", "Terrasse_Beet", "Terrasse_Blende", "Terrasse_Carport_Holz", "Terrasse_Efeu", "Terrasse_Findling", "Terrasse_Laub", "Terrasse_Laub_dunkel", "Terrasse_Terrassenholz", "Vegetation_Laub", "Vegetation_Laub_dunkel", "Vegetation_Zweige"],glb:'variante1.bin'},{n:"Haus geteilt · mit Vorgarten",g:"ohne",k:"Haus geteilt · Vorgarten",info:["Wie „Haus geteilt · 2. Terrasse“, zusätzlich mit gestaltetem Vorgarten.", "Trittsteinweg im Rasen an der Straßenhecke entlang zum Hintereingang.", "Lockere Büsche statt Hecke, Beet vor dem Giebel.", "Eingangshof am Hintereingang mit Vordach, Bank und Fahrradbügeln.", "Noch offen: Die Trennwand im Haus ist nicht eingebaut."],hide:["Haus_Blende", "Haus_Carport_Holz", "Haus_Fensterrahmen", "Haus_Glas_Haus", "Haus_Klinker", "Haus_Putz_weiss", "Haus_Rollschicht", "Haus_Terrassenholz", "Haus_Zink", "Innen_Holz_dunkel", "Innen_Lack_weiss", "Innen_Wand_innen", "Terrasse_Beet", "Terrasse_Blende", "Terrasse_Carport_Holz", "Terrasse_Efeu", "Terrasse_Findling", "Terrasse_Laub", "Terrasse_Laub_dunkel", "Terrasse_Terrassenholz", "Vegetation_Laub", "Vegetation_Laub_dunkel", "Vegetation_Zweige", "Wege_Beet", "Wege_Findling", "Wege_Terrasse_Pflaster", "Wege_Wegplatten"],glb:'variante2.bin'},{n:"Baugrundstück abgetrennt",g:"mit",k:"Haus wie heute",info:["Der Streifen an der Birkenseite wird als eigenes Baugrundstück abgetrennt.", "Sichtschutzzaun (1,8 m) als neue Grenze, kleine Pflanzen auf unserer Seite.", "Eigene Zufahrt von der Straße, dort endet die Hecke.", "Platzhalter-Neubau: zweigeschossig mit Flachdach, ca. 6,5 × 9 m.", "Geräteschuppen und Feuerstelle entfallen, Bäume bleiben nur am Feldrand.", "Unser Haus bleibt wie heute."],hide:["Feuerstelle_Erdhuegel", "Feuerstelle_Findling", "Feuerstelle_Flachdach", "Haus_Blende", "Haus_Fensterrahmen", "Haus_Flachdach", "Haus_Glas", "Haus_Haustuer", "Haus_Putz_weiss", "Hecke_Buchenhecke", "Hecke_Carport_Holz", "Vegetation_Birkenlaub", "Vegetation_Birkenrinde", "Vegetation_Blende", "Vegetation_Dach_Nachbar", "Vegetation_Immergruen", "Vegetation_Laub", "Vegetation_Laub_dunkel", "Vegetation_Rinde", "Vegetation_Schuppen_rot", "Vegetation_Zweige", "Wege_Kies", "Wege_Terrasse_Pflaster", "Wege_Wegplatten"],glb:'variante3.bin'},{n:"Haus geteilt · 2. Terrasse + Baugrundstück",g:"mit",k:"Haus geteilt · 2. Terrasse",info:["Haus geteilt mit zweiter Terrasse und Dachterrasse – und zusätzlich das abgetrennte Baugrundstück.", "Sichtschutzzaun (1,8 m) als neue Grenze an der Birkenseite, eigene Zufahrt für das Baugrundstück.", "Platzhalter-Neubau: zweigeschossig mit Flachdach, ca. 6,5 × 9 m.", "Geräteschuppen und Feuerstelle entfallen, Bäume bleiben nur am Feldrand.", "Noch offen: Die Trennwand im Haus ist nicht eingebaut."],hide:["Feuerstelle_Erdhuegel", "Feuerstelle_Findling", "Feuerstelle_Flachdach", "Haus_Blende", "Haus_Carport_Holz", "Haus_Fensterrahmen", "Haus_Flachdach", "Haus_Glas", "Haus_Glas_Haus", "Haus_Haustuer", "Haus_Klinker", "Haus_Putz_weiss", "Haus_Rollschicht", "Haus_Terrassenholz", "Haus_Zink", "Hecke_Buchenhecke", "Hecke_Carport_Holz", "Innen_Holz_dunkel", "Innen_Lack_weiss", "Innen_Wand_innen", "Terrasse_Beet", "Terrasse_Blende", "Terrasse_Carport_Holz", "Terrasse_Efeu", "Terrasse_Findling", "Terrasse_Laub", "Terrasse_Laub_dunkel", "Terrasse_Terrassenholz", "Vegetation_Birkenlaub", "Vegetation_Birkenrinde", "Vegetation_Blende", "Vegetation_Dach_Nachbar", "Vegetation_Immergruen", "Vegetation_Laub", "Vegetation_Laub_dunkel", "Vegetation_Rinde", "Vegetation_Schuppen_rot", "Vegetation_Zweige", "Wege_Kies", "Wege_Terrasse_Pflaster", "Wege_Wegplatten"],glb:'variante4.bin'},{n:"Haus geteilt · Vorgarten + Baugrundstück",g:"mit",k:"Haus geteilt · Vorgarten",info:["Haus geteilt mit zweiter Terrasse, Dachterrasse und Vorgarten – und zusätzlich das abgetrennte Baugrundstück.", "Sichtschutzzaun (1,8 m) als neue Grenze an der Birkenseite, eigene Zufahrt für das Baugrundstück.", "Platzhalter-Neubau: zweigeschossig mit Flachdach, ca. 6,5 × 9 m.", "Geräteschuppen und Feuerstelle entfallen, Bäume bleiben nur am Feldrand.", "Noch offen: Die Trennwand im Haus ist nicht eingebaut."],hide:["Feuerstelle_Erdhuegel", "Feuerstelle_Findling", "Feuerstelle_Flachdach", "Haus_Blende", "Haus_Carport_Holz", "Haus_Fensterrahmen", "Haus_Flachdach", "Haus_Glas", "Haus_Glas_Haus", "Haus_Haustuer", "Haus_Klinker", "Haus_Putz_weiss", "Haus_Rollschicht", "Haus_Terrassenholz", "Haus_Zink", "Hecke_Buchenhecke", "Hecke_Carport_Holz", "Innen_Holz_dunkel", "Innen_Lack_weiss", "Innen_Wand_innen", "Terrasse_Beet", "Terrasse_Blende", "Terrasse_Carport_Holz", "Terrasse_Efeu", "Terrasse_Findling", "Terrasse_Laub", "Terrasse_Laub_dunkel", "Terrasse_Terrassenholz", "Vegetation_Birkenlaub", "Vegetation_Birkenrinde", "Vegetation_Blende", "Vegetation_Dach_Nachbar", "Vegetation_Immergruen", "Vegetation_Laub", "Vegetation_Laub_dunkel", "Vegetation_Rinde", "Vegetation_Schuppen_rot", "Vegetation_Zweige", "Wege_Beet", "Wege_Findling", "Wege_Kies", "Wege_Terrasse_Pflaster", "Wege_Wegplatten"],glb:'variante5.bin'}]; let vi=0;
const ALLR=()=>[model].concat(VARS.filter(v=>v.root).map(v=>v.root));
const loader=new T.GLTFLoader(); let pending=1;
function done(){ if(--pending===0){ document.getElementById('load').style.display='none'; setMode('orbit'); } }
loader.parse(b64buf(GLB),'',g=>{ model=g.scene; PREP(model); scene.add(model); VARS.forEach(v=>{ if(!v.glb) return; pending++; loader.parse(b64buf(v.glb),'',g2=>{ v.root=g2.scene; v.root.visible=false; const BMAT={}; model.traverse(o=>{ if(o.isMesh) BMAT[o.material.name]=o.userData.m0||o.material; }); v.root.traverse(o=>{ if(o.isMesh&&BMAT[o.material.name]) o.material=BMAT[o.material.name]; }); PREP(v.root); scene.add(v.root); setSeason(winter); done(); }); }); setSeason(false); setVariant(0); done(); },e=>{document.getElementById('load').textContent='Fehler beim Laden';});
function PREP(R){ R.traverse(o=>{ if(o.isMesh){ o.castShadow=!/^(Gelaende|Wege|Umgebung)_/.test(o.name); o.receiveShadow=true;
  if(o.material.map){ o.material.map.anisotropy=renderer.capabilities.getMaxAnisotropy(); } o.material.side=T.DoubleSide; if(o.material.name==='Glas'){ o.material.envMap=TX.sky; o.material.envMapIntensity=0.9; }
  if(/^(Haus|Carport|Nachbar|Hecke|Innen)_/.test(o.name)&&!/Laub|Wein|Boden|Decke|Glas_Haus|Fliegengitter|Lampen|Teppich/.test(o.name)) o.userData.col=true; if(o.material.name==='Fliegengitter'){ o.material.transparent=true; o.material.opacity=0.45; o.material.depthWrite=false; o.castShadow=false; } if(o.material.name==='Glas_Haus'){ o.material.transparent=true; o.material.opacity=0.22; o.material.depthWrite=false; o.material.envMap=TX.sky; o.material.roughness=0.05; o.castShadow=false; } }}); }
function setVariant(i){ vi=i; const hide=new Set(VARS[i].hide||[]); model.traverse(o=>{ if(o.isMesh){ o.userData.vh=hide.has(o.name); o.visible=!o.userData.vh&&!(winter&&DECID.has(o.material.name)); }});
 VARS.forEach((v,j)=>{ if(v.root) v.root.visible=(j===i); }); colliders.length=0; [model,VARS[i].root].forEach(R=>R&&R.traverse(o=>{ if(o.isMesh&&o.userData.col&&!o.userData.vh) colliders.push(o); }));
 const b=document.getElementById('bVar'); if(b){ b.textContent='Variante: '+VARS[i].n; b.style.display=VARS.length>1?'':'none'; } }
let mode='orbit';
const orbit={target:B(-1,-6,2), r:38, theta:0, phi:0.95}; orbit.theta=Math.atan2(14+1,-(20+6));
const walk={pos:new T.Vector3(), yaw:0, pitch:0};
function lookFrom(p,t){ walk.pos.copy(p).setY(1.65); const dx=t.x-p.x, dz=t.z-p.z; walk.yaw=Math.atan2(-dx,-dz); walk.pitch=-0.03; }
function orbitTo(t,r,from,phi){ orbit.target.copy(t); orbit.r=r; orbit.theta=Math.atan2(from.x-t.x,from.z-t.z); orbit.phi=phi; }
const VIEWS={
 eingang:()=>{ setMode('walk',true); lookFrom(B(3.7,10.5),B(3.7,-5)); },
 strasse:()=>{ setMode('walk',true); lookFrom(B(-3.2,6.2),B(-0.6,-1)); walk.pitch=0.12; },
 hinten:()=>{ setMode('walk',true); lookFrom(B(-13,1),B(-5,-6)); walk.pitch=0.05; },
 garten:()=>{ setMode('walk',true); lookFrom(B(-0.8,-30),B(-1.5,-12)); walk.pitch=0.04; },
 terrasse:()=>{ setMode('orbit',true); orbitTo(B(-3,-12,1.5),22,B(9,-27),0.98); },
 drohne:()=>{ setMode('orbit',true); orbitTo(B(-1,-6,2),34,B(14,20),0.95); },
 oben:()=>{ setMode('orbit',true); orbitTo(B(-2,-6,0),70,B(-2,-6.01),0.02); },
 umgebung:()=>{ setMode('orbit',true); orbitTo(B(-10,-5,0),170,B(60,-200),1.18); },
 grundriss:()=>{ setCut(true); setMode('orbit',true); orbitTo(B(-3,-7.5,0),26,B(-3,-7.4),0.02); },
 esszimmer:()=>{ setMode('walk',true); lookFrom(B(1.9,-11.0),B(-3,-8.6)); walk.pos.y=2.0; },
 esszimmer2:()=>{ setMode('walk',true); lookFrom(B(-3.6,-11.2),B(1,-8.5)); walk.pos.y=2.0; },
 essf:()=>{ setMode('walk',true); lookFrom(B(.8,-8.4),B(-1.6,-11.7)); walk.pos.y=2.0; },
 wzf:()=>{ setMode('walk',true); lookFrom(B(-9.6,-11.6),B(-6.6,-14.7)); walk.pos.y=2.0; },
 flur:()=>{ setMode('walk',true); lookFrom(B(4.4,-6.2),B(-1,-6.3)); walk.pos.y=2.0; },
 kueche:()=>{ setMode('walk',true); lookFrom(B(-1.5,-6.6),B(-4.1,-4.2)); walk.pos.y=2.0; },
 kueche2:()=>{ setMode('walk',true); lookFrom(B(-3.5,-4.6),B(-1.5,-7.5)); walk.pos.y=2.0; },
 waschk:()=>{ setMode('walk',true); lookFrom(B(-6.6,-7.2),B(-5,-6.2)); walk.pos.y=2.0; },
 wohnzimmer:()=>{ setMode('walk',true); lookFrom(B(-6.6,-13.2),B(-11,-11.6)); walk.pos.y=2.0; },
 wohnzimmer2:()=>{ setMode('walk',true); lookFrom(B(-8.2,-12.6),B(-5.2,-9)); walk.pos.y=2.0; },
};
document.querySelectorAll('.views .btn').forEach(b=>b.onclick=()=>VIEWS[b.dataset.v]());
lookFrom(B(3.7,10.5),B(3.7,-5));
const keys=new Set(), pointers=new Map(); let joy=null, lastPinch=null;
const joyEl=document.getElementById('joy'), knob=document.getElementById('knob');
addEventListener('keydown',e=>keys.add(e.key.toLowerCase())); addEventListener('keyup',e=>keys.delete(e.key.toLowerCase()));
const cv=renderer.domElement; cv.addEventListener('contextmenu',e=>e.preventDefault());
cv.addEventListener('pointerdown',e=>{ cv.setPointerCapture(e.pointerId); let role='look';
 if(mode==='walk'&&e.pointerType!=='mouse'&&e.clientX<innerWidth*.45&&e.clientY>innerHeight*.35&&!joy){ role='joy'; joy={x0:e.clientX,y0:e.clientY,dx:0,dy:0}; joyEl.style.display='block'; joyEl.style.left=e.clientX+'px'; joyEl.style.top=e.clientY+'px'; knob.style.transform='translate(0,0)'; }
 pointers.set(e.pointerId,{x:e.clientX,y:e.clientY,role,btn:e.button}); lastPinch=null; });
cv.addEventListener('pointermove',e=>{ const p=pointers.get(e.pointerId); if(!p) return; const dx=e.clientX-p.x, dy=e.clientY-p.y; p.x=e.clientX; p.y=e.clientY;
 if(p.role==='joy'){ let jx=e.clientX-joy.x0, jy=e.clientY-joy.y0; const l=Math.hypot(jx,jy),m=45; if(l>m){jx*=m/l;jy*=m/l;} joy.dx=jx/m; joy.dy=jy/m; knob.style.transform=`translate(${jx}px,${jy}px)`; return; }
 if(mode==='walk'){ walk.yaw-=dx*.004; walk.pitch=Math.max(-1.3,Math.min(1.3,walk.pitch-dy*.004)); return; }
 const look=[...pointers.values()].filter(q=>q.role==='look');
 if(look.length>=2){ const [a,b]=look, d=Math.hypot(a.x-b.x,a.y-b.y), mx=(a.x+b.x)/2, my=(a.y+b.y)/2; if(lastPinch){ orbit.r=Math.max(5,Math.min(420,orbit.r*lastPinch.d/d)); pan(mx-lastPinch.mx,my-lastPinch.my);} lastPinch={d,mx,my}; }
 else if(p.btn===2||e.shiftKey) pan(dx,dy); else { orbit.theta-=dx*.006; orbit.phi=Math.max(.02,Math.min(1.5,orbit.phi-dy*.005)); } });
function endPtr(e){ const p=pointers.get(e.pointerId); if(p&&p.role==='joy'){joy=null;joyEl.style.display='none';} pointers.delete(e.pointerId); lastPinch=null; }
cv.addEventListener('pointerup',endPtr); cv.addEventListener('pointercancel',endPtr);
cv.addEventListener('wheel',e=>{ e.preventDefault(); if(mode==='orbit') orbit.r=Math.max(5,Math.min(420,orbit.r*Math.exp(e.deltaY*.001))); },{passive:false});
function pan(dx,dy){ const s=orbit.r*.0016, c=Math.cos(orbit.theta), sn=Math.sin(orbit.theta); orbit.target.x+=(-dx*c-dy*sn)*s; orbit.target.z+=(dx*sn-dy*c)*s; }
const ray=new T.Raycaster(), tmpO=new T.Vector3(), tmpD=new T.Vector3();
function blocked(dx,dz){ const L=Math.hypot(dx,dz); if(L<1e-6) return false; tmpO.set(walk.pos.x,1.0,walk.pos.z); tmpD.set(dx/L,0,dz/L); ray.set(tmpO,tmpD); ray.far=L+0.35; return ray.intersectObjects(colliders,false).length>0; }
const hint=document.getElementById('hint'); let hT;
function showHint(t){ hint.textContent=t; hint.style.opacity=1; clearTimeout(hT); hT=setTimeout(()=>hint.style.opacity=0,4500); }
function setMode(m,quiet){ mode=m; document.getElementById('bOrbit').classList.toggle('on',m==='orbit'); document.getElementById('bWalk').classList.toggle('on',m==='walk');
 if(quiet) return; showHint(m==='walk'?(isTouch?'Links unten ziehen = gehen · rechts ziehen = umsehen':'W A S D / Pfeile = gehen · Maus ziehen = umsehen · Shift = schneller'):(isTouch?'Ziehen = drehen · zwei Finger = zoomen & verschieben':'Ziehen = drehen · Rad = zoomen · Rechtsklick ziehen = verschieben')); }
document.getElementById('bOrbit').onclick=()=>setMode('orbit');
document.getElementById('bWalk').onclick=()=>setMode('walk');
document.getElementById('bSeason').onclick=()=>setSeason(!winter);
const GRX=/^(Vegetation_(?!Carport_Holz|Schuppen_rot|Dach_Nachbar|Putz_weiss|Blende|Beet|Kies|Blumen)|Hecke_Buchenhecke|Terrasse_(Laub|Efeu)|Haus_(Laub|Wilder_Wein|Efeu)|Carport_Efeu)/; let ghost=false;
function setGhost(g){ ghost=g; ALLR().forEach(R=>R.traverse(o=>{ if(!o.isMesh||!GRX.test(o.name)) return; if(!o.userData.m0){ o.userData.m0=o.material; const c=o.material.clone(); c.transparent=true; c.opacity=0.1; c.depthWrite=false; o.userData.m1=c; o.userData.cs=o.castShadow; }
  o.material=g?o.userData.m1:o.userData.m0; o.castShadow=g?false:o.userData.cs; o.renderOrder=g?5:0; })); const b=document.getElementById('bGreen'); b.textContent=g?'Grün einblenden':'Grün ausblenden'; b.classList.toggle('on',g); }
document.getElementById('bGreen').onclick=()=>setGhost(!ghost);
document.querySelectorAll('#pad button').forEach(b=>{ const k=b.dataset.k, on=e=>{ e.preventDefault(); keys.add(k); b.classList.add('dn'); }, off=()=>{ keys.delete(k); b.classList.remove('dn'); };
 b.addEventListener('pointerdown',on); ['pointerup','pointercancel','pointerleave'].forEach(n=>b.addEventListener(n,off)); b.addEventListener('contextmenu',e=>e.preventDefault()); });
document.getElementById('bVar').onclick=()=>setVariant((vi+1)%VARS.length);
let cut=false; function setCut(c){ cut=c; renderer.clippingPlanes=c?[new T.Plane(new T.Vector3(0,-1,0),2.6)]:[]; sun.castShadow=!c; }
Object.keys(VIEWS).forEach(k=>{ if(k!=='grundriss'){ const f=VIEWS[k]; VIEWS[k]=()=>{ setCut(false); f(); }; } });
let last=performance.now();
function loop(now){ const dt=Math.min(.05,(now-last)/1000); last=now;
 if(mode==='walk'){ let f=0,s=0; if(keys.has('w')||keys.has('arrowup'))f+=1; if(keys.has('s')||keys.has('arrowdown'))f-=1; if(keys.has('a')||keys.has('arrowleft'))s-=1; if(keys.has('d')||keys.has('arrowright'))s+=1;
  if(joy){f-=joy.dy;s+=joy.dx;} const sp=(keys.has('shift')?7:3)*dt, sy=Math.sin(walk.yaw), cy=Math.cos(walk.yaw);
  const mx=(-sy*f+cy*s)*sp, mz=(-cy*f-sy*s)*sp; if(!blocked(mx,0)) walk.pos.x+=mx; if(!blocked(0,mz)) walk.pos.z+=mz;
  if(keys.has('pageup')) walk.pos.y=Math.min(40,walk.pos.y+3*dt); if(keys.has('pagedown')) walk.pos.y=Math.max(0.6,walk.pos.y-3*dt); if(keys.has('+')) walk.pitch=Math.min(1.3,walk.pitch+0.8*dt); if(keys.has('-')) walk.pitch=Math.max(-1.3,walk.pitch-0.8*dt);
  camera.position.copy(walk.pos); camera.rotation.set(walk.pitch,walk.yaw,0);
 } else { { let f=0,s=0; if(keys.has('w')||keys.has('arrowup'))f+=1; if(keys.has('s')||keys.has('arrowdown'))f-=1; if(keys.has('a')||keys.has('arrowleft'))s-=1; if(keys.has('d')||keys.has('arrowright'))s+=1;
  const sp=Math.max(4,orbit.r*0.7)*dt, sn=Math.sin(orbit.theta), cs=Math.cos(orbit.theta); orbit.target.x+=(-sn*f+cs*s)*sp; orbit.target.z+=(-cs*f-sn*s)*sp;
  if(keys.has('+')) orbit.r=Math.max(3,orbit.r*Math.exp(-1.3*dt)); if(keys.has('-')) orbit.r=Math.min(420,orbit.r*Math.exp(1.3*dt)); if(keys.has('pageup')) orbit.phi=Math.max(.02,orbit.phi-0.7*dt); if(keys.has('pagedown')) orbit.phi=Math.min(1.5,orbit.phi+0.7*dt); }
  const {target:t,r,theta,phi}=orbit; camera.position.set(t.x+r*Math.sin(phi)*Math.sin(theta), t.y+r*Math.cos(phi), t.z+r*Math.sin(phi)*Math.cos(theta)); camera.lookAt(t); }
 sky.position.copy(camera.position); const st=mode==='walk'?walk.pos:orbit.target; sun.target.position.set(st.x,0,st.z); sun.position.set(st.x+sunDir.x,sunDir.y,st.z+sunDir.z); sun.target.updateMatrixWorld();
 renderer.render(scene,camera); requestAnimationFrame(loop); }
requestAnimationFrame(loop);
addEventListener('resize',()=>{ camera.aspect=innerWidth/innerHeight; camera.updateProjectionMatrix(); renderer.setSize(innerWidth,innerHeight); });
