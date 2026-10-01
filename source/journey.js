const Journey=(()=>{
 function interpolate(before,after,fraction){
  const sample={};
  for(const key of Object.keys(before))sample[key]=before[key]+(after[key]-before[key])*fraction;
  const turn=Math.atan2(Math.sin(after.yaw-before.yaw),Math.cos(after.yaw-before.yaw));
  sample.yaw=before.yaw+turn*fraction;return sample;
 }
 function create(pose){
  const journey={worldTime:0,personalTime:0,forwardMemory:0,reverseMemory:0,direction:1,segments:[]};
  journey.segments.push({direction:1,samples:[{...pose,worldTime:0,personalTime:0,forwardMemory:0,reverseMemory:0}]});return journey;
 }
 function append(journey,seconds,pose){
  journey.worldTime+=seconds*journey.direction;journey.personalTime+=seconds;
  if(journey.direction>0)journey.forwardMemory+=seconds;else journey.reverseMemory+=seconds;
  journey.segments.at(-1).samples.push({...pose,worldTime:journey.worldTime,personalTime:journey.personalTime,forwardMemory:journey.forwardMemory,reverseMemory:journey.reverseMemory});
 }
 function advance(journey,seconds,pose,crossing=null){
  if(seconds<=0)return;
  if(crossing===null){append(journey,seconds,pose);return;}
  const previous=journey.segments.at(-1).samples.at(-1),portalPose=interpolate(previous,{...previous,...pose},crossing);
  append(journey,seconds*crossing,portalPose);
  const shared={...journey.segments.at(-1).samples.at(-1)};
  journey.direction*=-1;journey.segments.push({direction:journey.direction,samples:[shared]});
  append(journey,seconds*(1-crossing),pose);
 }
 function atWorld(segment,seconds){
  const samples=segment.samples,direction=segment.direction,target=seconds*direction;
  if(target<samples[0].worldTime*direction||target>samples.at(-1).worldTime*direction)return null;
  let low=0,high=samples.length-1;
  while(low<high){const middle=Math.floor((low+high)/2);if(samples[middle].worldTime*direction<target)low=middle+1;else high=middle;}
  const after=samples[low],before=samples[Math.max(0,low-1)],span=after.worldTime-before.worldTime;
  return span===0?{...after}:interpolate(before,after,(seconds-before.worldTime)/span);
 }
 return {create,advance,atWorld};
})();
if(typeof module!=='undefined')module.exports={Journey};
