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
 if(state.mode!=='basic')return;
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
const selection=mesh(new T.RingGeometry(.65,.7,48),new T.MeshBasicMaterial({color:0xffdb90,side:T.DoubleSide,transparent:true,opacity:.8}),null,null,scene,false);selection.rotation.x=-Math.PI/2;
function runnerPhase(){return state.t<.24?'달리기':state.t<.32?'뒤로 넘어짐':'배를 위로 향해 누움';}
function runnerMemory(){return state.t*48;}
function updateRunner(){
 const t=state.t,fall=smooth(.24,.32,t),stride=Math.sin(t*48*10),run=1-smooth(.23,.27,t);
 const offset=state.mode==='basic'?0:4,z=state.mode==='basic'?5:11;
 runner.position.set(mix(-2,3.7,smooth(0,.24,t))+offset,terrain(3.7+offset,z)+.02,z);runner.rotation.y=Math.PI/2;
 body.position.y=mix(.96,.33,fall)+Math.abs(stride)*.055*run+Math.sin(fall*Math.PI)*.23;
 body.rotation.x=mix(.12,-Math.PI/2,fall);
 for(const l of limbs){l.leg.rotation.x=l.side*stride*.85*run+Math.sin(fall*Math.PI)*.6;l.knee.rotation.x=Math.max(0,-l.side*stride)*1.05*run+Math.sin(fall*Math.PI)*1.15;l.arm.rotation.x=-l.side*stride*.9*run-Math.sin(fall*Math.PI)*2;l.arm.rotation.z=l.side*fall*.7;}
 selection.position.copy(runner.position);selection.position.y+=.04;selection.visible=state.inspected==='runner';
}
const raycaster=new T.Raycaster();
function inspect(who){state.inspected=state.mode==='runner'?(who==='self'?'reverse':who==='runner'?'forward':who):who;$('#inspect-self').setAttribute('aria-pressed',String(['self','reverse'].includes(state.inspected)));$('#inspect-runner').setAttribute('aria-pressed',String(['runner','forward'].includes(state.inspected)));updateNeurons();}
function pickRunner(e){const rect=renderer.domElement.getBoundingClientRect();raycaster.setFromCamera(new T.Vector2((e.clientX-rect.left)/rect.width*2-1,-(e.clientY-rect.top)/rect.height*2+1),camera);scene.updateMatrixWorld(true);
 if(state.mode==='runner'){
  const hits=raycaster.intersectObjects(travellers.filter(p=>p.group.visible).map(p=>p.group),true);
  if(hits.length){let o=hits[0].object;while(o&&!o.userData.traveller)o=o.parent;if(o)inspect(o.userData.traveller);}return;
 }
 if(raycaster.intersectObject(runner,true).length)inspect('runner');}
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
 const selected=selectedMemory(),self=selected.traveller,forward=selected.forward,reverse=selected.reverse;
 const phase=forward+reverse;
 neural.clearRect(0,0,720,560);neural.lineCap='round';neural.lineJoin='round';
 if(!selected.present){neuralCanvas.setAttribute('aria-label','이 시간좌표에는 여행자가 없습니다');return;}
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
 neuralCanvas.setAttribute('aria-label',self?`${selected.name} 기억: 순방향 ${forward.toFixed(1)}초, 역방향 ${reverse.toFixed(1)}초. 포탈 이전 기억은 유지됩니다.`:`달리는 사람의 기억: ${forward.toFixed(1)}초. ${state.observer==='b'?'과거를 향해 줄어드는 순서로 관찰 중입니다.':'경험이 쌓이고 있습니다.'}`);
}

// The two visible travellers are the two branches of the SAME worldline.
const travellers=['forward','reverse'].map((kind)=>{
 const group=runner.clone(true);group.userData.traveller=kind;
 group.traverse(o=>{if(o.isMesh&&o.material===shirt){o.material=shirt.clone();o.material.color.setHex(kind==='forward'?0xffcc70:0xa5ffe3);}});
 const label=sceneLabel(kind==='forward'?'순행 여행자 · 포탈 이전':'역행 여행자 · 포탈 이후');label.position.y=2.3;label.scale.set(1.6,.3,1);group.add(label);scene.add(group);group.visible=false;
 const torso=group.children[0],joints=torso.children.filter(o=>o.type==='Group');
 return {kind,group,torso,joints,label};
});
const neuralCaption=document.createElement('p');neuralCaption.id='neural-caption';neuralCaption.hidden=true;neuralCanvas.after(neuralCaption);
const modeSaves={};
const journeyKeys=['t','observer','playing','cinema','personalTime','forwardMemory','reverseMemory','inspected','crossings','portalArmed','lookYaw','lookPitch','storyTime'];
function selectedMemory(){
 if(state.mode==='runner'){
  const p=Story.atWorld(state.t*48,state.inspected==='reverse');
  return {present:!!p,traveller:true,forward:p?.forward||0,reverse:p?.backward||0,name:state.inspected==='reverse'?'역행 여행자':'순행 여행자'};
 }
 const self=state.inspected==='self';return {present:true,traveller:self,forward:self?state.forwardMemory:runnerMemory(),reverse:self?state.reverseMemory:0,name:self?'여행자':'A'};
}
function resetMode(){
 Object.assign(state,{t:0,observer:'a',personalTime:0,forwardMemory:0,reverseMemory:0,crossings:0,portalArmed:true,playing:!reduced,cinema:!reduced,storyTime:0,inspected:state.mode==='runner'?'reverse':'self'});
 cinemaTime=0;camera.position.copy(cameraPath.getPointAt(0));camera.lookAt(2,1.1,5);state.lookYaw=camera.rotation.y;state.lookPitch=camera.rotation.x;previousPortalPosition.copy(camera.position);
}
function setMode(mode){
 if(mode===state.mode)return;
 modeSaves[state.mode]={state:Object.fromEntries(journeyKeys.map(k=>[k,state[k]])),position:camera.position.clone(),rotation:camera.quaternion.clone(),cinemaTime};
 clearInputs();state.mode=mode;
 const saved=modeSaves[mode];if(saved){Object.assign(state,saved.state);camera.position.copy(saved.position);camera.quaternion.copy(saved.rotation);cinemaTime=saved.cinemaTime;}else resetMode();
 previousPortalPosition.copy(camera.position);document.body.dataset.mode=mode;
 for(const m of ['basic','story','runner'])$('#mode-'+m).setAttribute('aria-pressed',String(m===mode));
 $('#cinema').disabled=mode!=='basic';neuralCaption.hidden=mode==='basic';
 $('#inspect-self').setAttribute('aria-label',mode==='runner'?'역행 여행자 기억 관찰':'나의 기억 관찰');$('#inspect-runner').setAttribute('aria-label',mode==='runner'?'순행 여행자 기억 관찰':'달리는 사람의 기억 관찰');
 updateButtons();updateWorld();updateTravellers();updateScriptCamera();inspect(state.inspected);
}
for(const mode of ['basic','story','runner'])$('#mode-'+mode).addEventListener('click',()=>setMode(mode));
function advanceStory(dt){
 state.storyTime=Math.min(48,state.storyTime+dt);
 if(state.mode==='story'){
  const p=Story.sample(state.storyTime);state.t=p.worldTime/48;state.observer=p.reverse?'b':'a';state.personalTime=p.seconds;state.forwardMemory=p.forward;state.reverseMemory=p.backward;
  if(state.crossings===0&&p.reverse){$('#flash').classList.add('on');setTimeout(()=>$('#flash').classList.remove('on'),180);}
  state.crossings=p.reverse?1:0;
 }else{state.t=state.storyTime/48;state.personalTime=state.storyTime;state.forwardMemory=state.storyTime;}
 if(state.storyTime===48)state.playing=false;
 updateButtons();
}
function updateTravellers(){
 runner.visible=state.mode!=='runner';selection.visible=state.mode!=='runner'&&state.inspected==='runner';
 for(const actor of travellers){
  const p=Story.atWorld(state.t*48,actor.kind==='reverse');
  actor.group.visible=state.mode!=='basic'&&!!p&&(state.mode==='runner'||(actor.kind==='reverse')!==(state.observer==='b'));
  if(!p)continue;
  actor.group.position.set(p.x,terrain(p.x,p.z),p.z);actor.group.rotation.set(0,p.yaw,0);
  actor.torso.position.y=.96+p.lift-p.sit*.48;actor.torso.rotation.set(-p.flip*TAU,0,0);
  const walk=p.reverse?(p.seconds<27?1:0):1,stride=Math.sin(p.seconds*8)*.55*walk;
  actor.joints.forEach((joint,i)=>{const side=i<2?-1:1,isLeg=i%2===0;joint.rotation.set(isLeg?side*stride-p.sit*1.25:-side*stride-Math.sin(p.flip*Math.PI)*2,0,0);if(isLeg)joint.children.find(o=>o.type==='Group').rotation.x=p.sit*1.5;});
  actor.label.position.y=2.3+p.lift;
 }
 if(state.mode==='basic')return;
 const memory=selectedMemory();
 neuralCaption.textContent=!memory.present?'이 시간좌표에는 여행자가 없습니다':`${memory.name} · 순행 ${memory.forward.toFixed(1)}초 + 역행 ${memory.reverse.toFixed(1)}초`;
 $('#journey-hint').textContent=state.mode==='story'?Story.sample(state.storyTime).phase:state.t*48>24?'포탈 사건 이후 · A의 시간은 계속 흐릅니다': '금색·민트색은 같은 여행자의 포탈 전후 모습 · 클릭해 기억 비교';
 $('#time-caption').textContent=`A의 시간좌표 · ${(state.t*48).toFixed(1)}초${state.mode==='story'?` / 여행자 경험 · ${state.storyTime.toFixed(1)}초`:''}`;
}
function updateScriptCamera(){
 if(state.mode==='basic'||!state.entered)return false;
 hands.visible=state.mode==='story';
 if(state.mode==='story'){
  const actor=travellers[state.observer==='b'?1:0];actor.group.updateMatrixWorld(true);
  camera.position.copy(actor.torso.localToWorld(v3(0,.86,.19)));
  actor.torso.getWorldQuaternion(camera.quaternion);camera.rotateY(Math.PI);
 }else{
  runner.updateMatrixWorld(true);camera.position.copy(body.localToWorld(v3(0,.86,.14)));
  const fall=smooth(.24,.32,state.t),target=v3(mix(14,3.8,fall),mix(camera.position.y,1.3,fall),mix(11,-1,fall));camera.lookAt(target);
 }
 return true;
}
function travellerScreen(actor){const p=actor.group.position.clone().add(v3(0,1,0)).project(camera);return {kind:actor.kind,x:(p.x+1)*innerWidth/2,y:(1-p.y)*innerHeight/2,visible:actor.group.visible&&p.z>-1&&p.z<1&&Math.abs(p.x)<1&&Math.abs(p.y)<1};}
