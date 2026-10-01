const assert=require('node:assert/strict');
const {Story}=require('../source/story.js');
for(let s=0;s<=48;s+=.25){
 const p=Story.sample(s);
 assert.equal(p.forward+p.backward,s);
 assert.equal(p.worldTime,s<24?s:48-s);
 if(s>=24)assert.equal(p.forward,24);
 const observed=Story.atWorld(p.worldTime,s>=24);
 assert.equal(observed.seconds,s);
}
assert.equal(Story.sample(27).flip,0);
assert.equal(Story.sample(29).flip,1);
assert.equal(Story.sample(34).sit,1);
assert.equal(Story.sample(48).sit,1);
assert.equal(Story.sample(32).turn,1);
assert.ok(Math.abs(Story.sample(34).yaw)<.1);
assert.ok(Story.atWorld(12,true).backward>Story.atWorld(20,true).backward);
assert.equal(Story.atWorld(25,true),null);
assert.equal(Story.atWorld(25,false),null);
console.log('PASS: continuous memory, shared worldline, one flip, seated ending, A chronology');
