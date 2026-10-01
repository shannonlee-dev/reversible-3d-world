// Fictional time model: world time t and the traveller's lived time are independent.
// Connections below represent retained experience, not neuron counts or entropy units.
const portalPosition=v3(3,terrain(3,0)+1.8,0);
const portal=new T.Group();portal.position.copy(portalPosition);scene.add(portal);
const portalMaterial=new T.MeshBasicMaterial({color:0xb8ffe0,transparent:true,opacity:.8});
mesh(new T.TorusGeometry(1.65,.065,10,80),portalMaterial,null,null,portal,false);
const portalVeil=mesh(new T.CircleGeometry(1.57,64),new T.MeshBasicMaterial({color:0xa3ffe0,transparent:true,opacity:.09,side:T.DoubleSide,depthWrite:false}),null,null,portal,false);
for(const x of [-1.8,1.8])mesh(box,darkstone,v3(x,-.75,0),v3(.24,2.5,.35),portal);
function sceneLabel(text){const canvas=document.createElement('canvas');canvas.width=512;canvas.height=96;const ctx=canvas.getContext('2d');ctx.fillStyle='#10251ed9';ctx.fillRect(0,0,512,96);ctx.fillStyle='#e5ffe8';ctx.font='28px "Forest Sans", sans-serif';ctx.textAlign='center';ctx.fillText(text,256,58);const sprite=new T.Sprite(new T.SpriteMaterial({map:new T.CanvasTexture(canvas),depthTest:false}));sprite.scale.set(2.5,.47,1);return sprite;}
const portalLabel=sceneLabel('포탈 · 통과하면 시간 반전');portalLabel.position.set(0,2.1,0);portal.add(portalLabel);
const previousPortalPosition=v3();
function checkPortal(){
 if(!state.entered){previousPortalPosition.copy(camera.position);return;}
 const now=camera.position,prev=previousPortalPosition;
 if(!state.portalArmed&&Math.abs(now.z-portalPosition.z)>1.2)state.portalArmed=true;
 if(state.playing&&state.portalArmed&&((prev.z>portalPosition.z&&now.z<=portalPosition.z)||(prev.z<portalPosition.z&&now.z>=portalPosition.z))){
  const f=(portalPosition.z-prev.z)/(now.z-prev.z),x=mix(prev.x,now.x,f),y=mix(prev.y,now.y,f);
  if(Math.hypot(x-portalPosition.x,y-portalPosition.y)<1.52)crossPortal();
 }
 previousPortalPosition.copy(now);
 portalMaterial.color.setHex(state.observer==='b'?0xffdb90:0xb8ffe0);
 portalVeil.material.opacity=reduced?.1:.09+Math.sin(state.personalTime*2)*.025;
 $('#journey-hint').textContent=state.crossings? '이전 기억 + 새로운 경험 · 사람을 클릭해 A와 비교하세요':'사람을 클릭해 기억 관찰 · 빛나는 포탈로 걸어가세요';
}
// A has one deterministic history: run, lose footing, fall backwards, lie belly-up.
const runner=new T.Group();scene.add(runner);
const body=new T.Group();runner.add(body);
const shirt=mat(0xdd794d),trousers=mat(0x344c61),runnerSkin=mat(0xe3b491),shoes=mat(0x263332);
mesh(box,shirt,v3(0,.3,0),v3(.48,.6,.29),body);
mesh(new T.SphereGeometry(.18,14,10),runnerSkin,v3(0,.83,0),v3(.9,1.1,.9),body);
// Face and chest mark the front, so the final belly-up pose is unambiguous.
for(const x of [-.06,.06])mesh(new T.SphereGeometry(.022,8,6),shoes,v3(x,.86,.155),null,body);
mesh(box,mat(0xffd890),v3(0,.34,.15),v3(.11,.25,.025),body);
const limbs=[];
for(const side of [-1,1]){
 const leg=new T.Group();leg.position.set(side*.14,0,0);body.add(leg);
 mesh(box,trousers,v3(0,-.22,0),v3(.18,.44,.20),leg);
 const knee=new T.Group();knee.position.y=-.44;leg.add(knee);
 mesh(box,trousers,v3(0,-.20,0),v3(.15,.4,.17),knee);
 mesh(box,shoes,v3(0,-.41,.07),v3(.20,.12,.32),knee);
 const arm=new T.Group();arm.position.set(side*.33,.53,0);body.add(arm);
 mesh(box,shirt,v3(0,-.16,0),v3(.15,.32,.17),arm);
 mesh(box,runnerSkin,v3(0,-.39,.08),v3(.12,.24,.13),arm);
 limbs.push({side,leg,knee,arm});
}
const runnerLabel=sceneLabel('A · 클릭하여 기억 관찰');scene.add(runnerLabel);
const selection=mesh(new T.RingGeometry(.65,.7,48),new T.MeshBasicMaterial({color:0xffdb90,side:T.DoubleSide,transparent:true,opacity:.8}),null,null,scene,false);selection.rotation.x=-Math.PI/2;
function runnerPhase(){return state.t<.24?'달리기':state.t<.32?'뒤로 넘어짐':'배를 위로 향해 누움';}
function runnerMemory(){return state.t*48;}
function updateRunner(){
 const t=state.t,fall=smooth(.24,.32,t),stride=Math.sin(t*48*10),run=1-smooth(.23,.27,t);
 runner.position.set(mix(-2,3.7,smooth(0,.24,t)),terrain(3.7,5)+.02,5);runner.rotation.y=Math.PI/2;
 body.position.y=mix(.96,.33,fall)+Math.abs(stride)*.055*run+Math.sin(fall*Math.PI)*.23;
 body.rotation.x=mix(.12,-Math.PI/2,fall);
 for(const l of limbs){l.leg.rotation.x=l.side*stride*.85*run+Math.sin(fall*Math.PI)*.6;l.knee.rotation.x=Math.max(0,-l.side*stride)*1.05*run+Math.sin(fall*Math.PI)*1.15;l.arm.rotation.x=-l.side*stride*.9*run-Math.sin(fall*Math.PI)*2;l.arm.rotation.z=l.side*fall*.7;}
 runnerLabel.position.copy(runner.position).add(v3(0,fall>.8?1.1:2.2,0));runnerLabel.scale.set(2.1,.39,1);
 selection.position.copy(runner.position);selection.position.y+=.04;selection.visible=state.inspected==='runner';
}
const raycaster=new T.Raycaster();
function inspect(who){state.inspected=who;$('#inspect-self').setAttribute('aria-pressed',String(who==='self'));$('#inspect-runner').setAttribute('aria-pressed',String(who==='runner'));updateNeurons();}
function pickRunner(e){const rect=renderer.domElement.getBoundingClientRect();raycaster.setFromCamera(new T.Vector2((e.clientX-rect.left)/rect.width*2-1,-(e.clientY-rect.top)/rect.height*2+1),camera);scene.updateMatrixWorld(true);if(raycaster.intersectObjects([runner,runnerLabel],true).length)inspect('runner');}
function runnerScreen(){const point=runner.position.clone().add(v3(0,.65,0)).project(camera);return {x:(point.x+1)*innerWidth/2,y:(1-point.y)*innerHeight/2,visible:point.z>-1&&point.z<1&&Math.abs(point.x)<1&&Math.abs(point.y)<1};}
$('#inspect-self').addEventListener('click',()=>inspect('self'));$('#inspect-runner').addEventListener('click',()=>inspect('runner'));
const neuralCanvas=$('#neurons'),neural=neuralCanvas.getContext('2d');
// Seven large memory hubs, not literal neuron counts. Learned branches persist;
// the traveller's two experience streams are independent of world playback.
const neuralNodes=[{x:360,y:280},{x:166,y:116},{x:122,y:298},{x:224,y:454},{x:554,y:116},{x:598,y:298},{x:496,y:454}];
const neuralEdges=[{from:0,to:1,reverse:false,order:0},{from:1,to:2,reverse:false,order:1},{from:2,to:3,reverse:false,order:2},{from:0,to:4,reverse:true,order:0},{from:4,to:5,reverse:true,order:1},{from:5,to:6,reverse:true,order:2}];
function neuralBranchStrength(edge,self,forward,reverse){
 const order=self?edge.order:edge.order+(edge.reverse?3:0);
 const seconds=self&&edge.reverse?reverse:forward;
 return smooth(order*(self?8:4),order*(self?8:4)+(self?7:3.5),seconds);
}
function updateNeurons(){
 const self=state.inspected==='self',forward=self?state.forwardMemory:runnerMemory(),reverse=self?state.reverseMemory:0;
 const phase=self?state.personalTime:runnerMemory();
 neural.clearRect(0,0,720,560);neural.lineCap='round';neural.lineJoin='round';
 const circle=(x,y,r)=>{neural.beginPath();neural.arc(x,y,r,0,TAU);};
 // A quiet outline keeps the sparse network legible as one brain-like image.
 neural.strokeStyle='#bdffe110';neural.lineWidth=3;
 neural.beginPath();neural.moveTo(349,70);neural.bezierCurveTo(250,13,49,66,62,258);neural.bezierCurveTo(18,409,162,541,306,505);neural.stroke();
 neural.beginPath();neural.moveTo(371,70);neural.bezierCurveTo(470,13,671,66,658,258);neural.bezierCurveTo(702,409,558,541,414,505);neural.stroke();
 for(const edge of neuralEdges){
  const a=neuralNodes[edge.from],b=neuralNodes[edge.to],strength=neuralBranchStrength(edge,self,forward,reverse);
  const tint=self&&edge.reverse?'#a5ffe3':'#ffcc70';
  const line=(end)=>{neural.beginPath();neural.moveTo(a.x,a.y);neural.lineTo(mix(a.x,b.x,end),mix(a.y,b.y,end));neural.stroke();};
  neural.strokeStyle='#d6e9dd17';neural.lineWidth=3;line(1);
  if(strength>0){
   neural.save();neural.shadowColor=tint;neural.shadowBlur=20*strength;neural.strokeStyle=tint;neural.lineWidth=4+10*strength;neural.globalAlpha=.4+.6*strength;line(strength);neural.restore();
   // Large travelling flares run on the selected person's own history.
   if(!reduced&&strength>.15){
    const travel=((phase*.65+edge.order*.23)%1+1)%1,head=travel*strength,tail=Math.max(0,head-.22);
    neural.save();neural.strokeStyle='#fff9e9';neural.lineWidth=8;neural.shadowColor=tint;neural.shadowBlur=22;neural.globalAlpha=Math.sin(travel*Math.PI)*strength;
    neural.beginPath();neural.moveTo(mix(a.x,b.x,tail),mix(a.y,b.y,tail));neural.lineTo(mix(a.x,b.x,head),mix(a.y,b.y,head));neural.stroke();neural.restore();
   }
  }
  // Dormant rings swell into bright memory hubs as their connection is learned.
  const radius=10+strength*25,pulse=reduced?0:Math.sin(phase*2.5-edge.order)*3*strength;
  neural.strokeStyle='#d8ecdf45';neural.lineWidth=3;circle(b.x,b.y,12);neural.stroke();
  if(strength>0){
   neural.save();const glow=neural.createRadialGradient(b.x,b.y,0,b.x,b.y,radius+24);glow.addColorStop(0,tint+'99');glow.addColorStop(1,tint+'00');neural.fillStyle=glow;circle(b.x,b.y,radius+24);neural.fill();
   neural.globalAlpha=strength;neural.strokeStyle=tint;neural.lineWidth=5;circle(b.x,b.y,radius+8+pulse);neural.stroke();
   neural.fillStyle=tint;circle(b.x,b.y,radius);neural.fill();neural.fillStyle='#fff8e4';circle(b.x-5,b.y-5,5+strength*7);neural.fill();
   // One expanding halo follows each learning transition; it shrinks for A in rewind.
   if(!reduced&&strength<1){neural.globalAlpha=Math.sin(strength*Math.PI)*.75;neural.lineWidth=4;circle(b.x,b.y,18+strength*52);neural.stroke();}
   neural.restore();
  }
 }
 // The central clock keeps advancing for the traveller, including after the portal.
 neural.fillStyle='#183d30';neural.strokeStyle=self?'#fff2d5':'#dd794d';neural.lineWidth=6;circle(360,280,43);neural.fill();neural.stroke();
 const angle=phase*.8-Math.PI/2;neural.strokeStyle='#fff2d5';neural.lineWidth=6;neural.beginPath();neural.moveTo(360,280);neural.lineTo(360+Math.cos(angle)*27,280+Math.sin(angle)*27);neural.stroke();
 neural.fillStyle='#fff2d5';circle(360,280,6);neural.fill();
 neuralCanvas.setAttribute('aria-label',self?`나의 기억: 순방향 ${forward.toFixed(1)}초, 역방향 ${reverse.toFixed(1)}초. 이전 기억은 유지됩니다.`:`달리는 사람의 기억: ${forward.toFixed(1)}초. ${state.observer==='b'?'과거를 향해 줄어드는 순서로 관찰 중입니다.':'경험이 쌓이고 있습니다.'}`);
}
