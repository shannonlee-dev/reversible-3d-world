// One worldline, indexed by the traveller's own continuously increasing time.
// The portal turns the worldline at A-time 24; it does not erase memories.
const Story=(()=>{
 const portal=24,duration=48;
 const clamp=x=>Math.max(0,Math.min(1,x));
 const ease=x=>{x=clamp(x);return x*x*(3-2*x);};
 function sample(seconds){
  const s=Math.max(0,Math.min(duration,seconds)),reverse=s>=portal,r=Math.max(0,s-portal);
  const flip=ease((r-3)/2),sit=ease((r-8)/2);
  const z=reverse?-5*ease(r/3):12*(1-ease(s/portal));
  const x=reverse?3+3*ease(r/3):-1+4*ease(s/portal);
  const turn=ease((r-6)/2),facingA=Math.atan2(6.84-x,11-z);
  const yaw=Math.PI+(facingA-Math.PI)*turn;
  return {seconds:s,worldTime:reverse?48-s:s,reverse,x,z,flip,sit,yaw,turn,
   lift:Math.sin(flip*Math.PI)*1.8,forward:Math.min(s,portal),backward:r,
   phase:!reverse?'순방향으로 포탈에 접근':r<3?'포탈 통과 · 과거로 이동':r<5?'공중제비 한 번':r<6?'착지':r<8?'A 쪽으로 돌아서기':r<10?'A를 바라보며 앉기':'앉아서 A 관찰'};
 }
 function atWorld(t,reverse){return t>=0&&t<=portal?sample(reverse?48-t:t):null;}
 return {portal,duration,sample,atWorld};
})();
if(typeof module!=='undefined')module.exports={Story};
