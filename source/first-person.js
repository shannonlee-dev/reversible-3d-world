let freeJourney=null,watchRaised=false,lastWatchText='';
const pastTravellers=[];
const pastWatchGeometry=new T.CircleGeometry(.045,16),pastHandGeometry=new T.BoxGeometry(.006,.035,.004);
const watchCanvas=document.createElement('canvas');watchCanvas.width=384;watchCanvas.height=128;
const watchContext=watchCanvas.getContext('2d'),watchTexture=new T.CanvasTexture(watchCanvas);
const watchReadout=mesh(new T.PlaneGeometry(.12,.04),new T.MeshBasicMaterial({map:watchTexture,transparent:true,depthTest:false}),v3(0,-.036,.029),null,watchGroup,false);
const worldClock=new T.Group();worldClock.position.set(5,terrain(5,0)+1.5,0);scene.add(worldClock);
mesh(new T.CylinderGeometry(.48,.48,.08,40),darkstone,null,null,worldClock).rotation.x=Math.PI/2;
mesh(new T.CircleGeometry(.43,40),mat(0x1a3028),v3(0,0,.05),null,worldClock);
for(let tick=0;tick<12;tick++){
 const angle=tick/12*TAU;const marker=mesh(box,gold,v3(Math.sin(angle)*.36,Math.cos(angle)*.36,.06),v3(.025,.07,.015),worldClock,false);marker.rotation.z=-angle;
}
const worldClockHand=new T.Group();worldClock.add(worldClockHand);mesh(box,gold,v3(0,.15,.075),v3(.024,.3,.02),worldClockHand,false);
mesh(box,darkstone,v3(0,-.95,0),v3(.12,1.4,.12),worldClock);
function freePose(moving=0){return {x:camera.position.x,y:camera.position.y,z:camera.position.z,yaw:state.lookYaw,stride:footstep,moving};}
function resetFreeJourney(){
 state.cinema=false;watchRaised=false;footstep=0;
 camera.position.set(3,terrain(3,6)+1.73,6);camera.rotation.set(0,0,0);state.lookYaw=0;state.lookPitch=0;
 previousPortalPosition.copy(camera.position);freeJourney=Journey.create(freePose());
 for(const actor of pastTravellers){scene.remove(actor.group);actor.material.dispose();}pastTravellers.length=0;
 $('#watch').setAttribute('aria-pressed','false');
}
function advanceFreeJourney(seconds){
 let remaining=seconds;
 while(remaining>1e-8){
  const step=Math.min(remaining,1/30),before=camera.position.clone();
  updateCamera(step,step);
  const crossing=checkPortal();
  Journey.advance(freeJourney,step,freePose(Math.min(1,Math.hypot(camera.position.x-before.x,camera.position.z-before.z)/(step*2.9))),crossing);
  state.t=freeJourney.worldTime/48;state.personalTime=freeJourney.personalTime;state.forwardMemory=freeJourney.forwardMemory;state.reverseMemory=freeJourney.reverseMemory;
  if(crossing!==null)crossPortal();
  remaining-=step;
 }
}
function makePastTraveller(){
 const group=runner.clone(true),material=shirt.clone();material.color.copy(cloth.color);
 group.traverse(object=>{if(object.isMesh&&object.material===shirt)object.material=material;else if(object.isMesh&&object.material===runnerSkin)object.material=skin;});scene.add(group);
 const torso=group.children[0],joints=torso.children.filter(object=>object.type==='Group');
 mesh(pastWatchGeometry,gold,v3(0,-.38,.15),null,joints[1],false);
 const hand=new T.Group();hand.position.set(0,-.38,.156);joints[1].add(hand);mesh(pastHandGeometry,glove,v3(0,.015,0),null,hand,false);
 return {group,material,torso,joints,hand,sample:null};
}
function updatePastTravellers(){
 const count=state.mode==='basic'?freeJourney.segments.length-1:0;
 while(pastTravellers.length<count)pastTravellers.push(makePastTraveller());
 for(let index=0;index<pastTravellers.length;index++){
  const actor=pastTravellers[index],sample=index<count?Journey.atWorld(freeJourney.segments[index],state.t*48):null;
  actor.sample=sample;actor.group.visible=!!sample&&Math.hypot(sample.x-camera.position.x,sample.y-camera.position.y,sample.z-camera.position.z)>.38;
  if(!sample)continue;
  actor.group.position.set(sample.x,sample.y-1.73,sample.z);actor.group.rotation.set(0,sample.yaw+Math.PI,0);
  actor.torso.position.y=.96;actor.torso.rotation.set(0,0,0);
  actor.hand.rotation.z=-sample.personalTime/60*TAU;
  const stride=Math.sin(sample.stride)*.65*sample.moving;
  actor.joints.forEach((joint,index)=>{const side=index<2?-1:1,leg=index%2===0;joint.rotation.set(leg?side*stride:-side*stride,0,0);if(leg)joint.children.find(object=>object.type==='Group').rotation.x=Math.max(0,-side*stride);});
 }
}
function updateFirstPerson(){
 const basic=state.mode==='basic';worldClock.visible=basic;watchReadout.visible=basic;portalLabel.visible=!basic;
 updatePastTravellers();
 if(!basic){hands.position.set(mobile?.14:.42,-.27,-.82);hands.scale.setScalar(mobile?.62:.78);return;}
 selection.visible=false;
 worldClockHand.rotation.z=-state.t*48/60*TAU;
 clockHand.rotation.z=-state.personalTime/60*TAU;hourHand.rotation.z=-state.personalTime/3600*TAU;
 for(let index=0;index<memories.length;index++){
  const active=[state.forwardMemory>0,state.reverseMemory>0,state.crossings>1][index],tint=index===0?0xffdb90:0xb8ffe0;
  memories[index].material.color.setHex(active?tint:0x344e42);memories[index].material.emissive.setHex(tint);memories[index].material.emissiveIntensity=active?2.5:.03;
 }
 const wristText=`${state.personalTime.toFixed(1)} / ${state.forwardMemory.toFixed(1)} / ${state.reverseMemory.toFixed(1)}`;
 if(wristText!==lastWatchText){
  lastWatchText=wristText;watchContext.clearRect(0,0,384,128);watchContext.fillStyle='#12372f';watchContext.fillRect(0,0,384,128);
  watchContext.textAlign='center';watchContext.font='32px "Forest Sans", sans-serif';watchContext.fillStyle='#fff1c3';watchContext.fillText(`나의 시간 ${state.personalTime.toFixed(1)}초`,192,45);
  watchContext.font='25px "Forest Sans", sans-serif';watchContext.fillStyle='#b8ffe0';watchContext.fillText(`기억  → ${state.forwardMemory.toFixed(1)}   ← ${state.reverseMemory.toFixed(1)}`,192,94);watchTexture.needsUpdate=true;
 }
 $('#time-caption').textContent=`숲의 시간 ${Number((state.t*48).toFixed(1))}초 · 나의 시간 ${state.personalTime.toFixed(1)}초`;
 $('#journey-hint').textContent=mobile?'조이스틱으로 걷기 · 화면을 드래그해 둘러보기':'WASD 걷기 · 드래그 둘러보기 · F 손목 보기';
 const target=v3(watchRaised?.02:mobile?.14:.42,watchRaised?-.03:-.27,watchRaised?-.43:-.82);
 hands.position.copy(target);hands.scale.setScalar(watchRaised?1.05:mobile?.62:.78);
}
function toggleWatch(){if(state.mode!=='basic')return;watchRaised=!watchRaised;$('#watch').setAttribute('aria-pressed',String(watchRaised));}
$('#watch').addEventListener('click',toggleWatch);
