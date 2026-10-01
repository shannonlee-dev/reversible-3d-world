const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const path=require('node:path');
(async()=>{
 const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||undefined,headless:true,args:['--no-sandbox','--use-angle=swiftshader','--enable-webgl','--ignore-gpu-blocklist','--enable-unsafe-swiftshader']});
 try{
  const page=await browser.newPage({viewport:{width:1100,height:760},reducedMotion:'reduce'}),errors=[],requests=[];
  page.on('pageerror',error=>errors.push(error.message));page.on('request',request=>{if(/^https?:/.test(request.url()))requests.push(request.url());});
  await page.goto('file://'+path.resolve(__dirname,'../index.html'));
  await page.waitForFunction(()=>window.__forest?.ready&&!document.querySelector('#enter').disabled);
  await page.evaluate(()=>{THREE.Clock.prototype.getDelta=()=>{const delta=window.testDelta||0;window.testDelta=0;return delta;};});
  await page.locator('#enter').click();
  const snap=()=>page.evaluate(()=>window.__forest.snapshot());
  async function tick(delta){await page.evaluate(delta=>new Promise(resolve=>{window.testDelta=delta;requestAnimationFrame(()=>requestAnimationFrame(resolve));}),delta);}
  async function advance(seconds){for(let second=0;second<seconds;second++)await tick(1);}
  async function move(key,seconds){await page.keyboard.down(key);await advance(seconds);await page.keyboard.up(key);}
  const initial=await snap();assert.equal(initial.playing,false);assert.equal(initial.cinema,false);
  assert.equal(await page.locator('.neural-panel').isVisible(),false);assert.equal(await page.locator('#cinema').isVisible(),false);
  await page.locator('#watch').click();assert.equal((await snap()).watchRaised,true);
  await page.screenshot({path:'/tmp/opposite-free-watch.png'});
  await page.keyboard.press('KeyF');assert.equal((await snap()).watchRaised,false);
  await page.locator('#play').click();await advance(14);
  assert.equal((await snap()).runnerPhase,'뒤로 넘어짐');
  await move('KeyW',3);
  const reverse=await snap();assert.equal(reverse.observer,'b');assert.equal(reverse.crossings,1);assert.equal(reverse.segments,2);
  assert.ok(reverse.camera[2]<0);assert.ok(reverse.forwardMemory>16&&reverse.forwardMemory<17);assert.ok(reverse.reverseMemory>0);
  assert.ok(reverse.history.length>0);assert.ok(reverse.history[0].position[2]>0,'earlier self remains across the portal');
  assert.ok(Math.abs(reverse.personalTime-17)<1e-6);
  await page.screenshot({path:'/tmp/opposite-free-reverse.png'});
  const beforeWalking=await snap();await move('KeyW',1);const walked=await snap();
  assert.ok(walked.camera[2]<beforeWalking.camera[2],'forward input still walks forward while world rewinds');
  assert.ok(walked.worldTime<beforeWalking.worldTime);assert.ok(walked.personalTime>beforeWalking.personalTime);
  assert.equal(walked.forwardMemory,beforeWalking.forwardMemory);
  await move('KeyS',3);const forward=await snap();assert.equal(forward.observer,'a');assert.equal(forward.crossings,2);assert.equal(forward.segments,3);
  assert.ok(forward.reverseMemory>walked.reverseMemory);assert.ok(forward.forwardMemory>walked.forwardMemory);
  await page.locator('#play').click();const saved=await snap();await move('KeyW',1);assert.deepEqual((await snap()).camera,saved.camera);
  await page.locator('#mode-story').click();assert.equal(await page.locator('.neural-panel').isVisible(),true);
  await page.locator('#mode-runner').click();assert.equal((await snap()).history.length,0);
  await page.locator('#mode-basic').click();const restored=await snap();assert.equal(restored.personalTime,saved.personalTime);assert.deepEqual(restored.camera,saved.camera);assert.equal(restored.segments,3);
  await page.locator('#play').click();await advance(36);assert.ok((await snap()).worldTime>48);assert.equal((await snap()).playing,true);
  await page.locator('#restart').click();assert.equal((await snap()).segments,1);assert.equal((await snap()).personalTime,0);assert.equal((await snap()).history.length,0);
  await page.locator('#play').click();await move('KeyW',3);await advance(5);assert.ok((await snap()).worldTime<0);assert.equal((await snap()).playing,true);assert.equal((await snap()).history.length,0);
  await page.screenshot({path:'/tmp/opposite-free-before-zero.png'});
  const mobile=await browser.newPage({viewport:{width:390,height:844},isMobile:true,hasTouch:true,reducedMotion:'reduce'});
  mobile.on('pageerror',error=>errors.push(error.message));await mobile.goto('file://'+path.resolve(__dirname,'../index.html'),{timeout:60000});
  await mobile.waitForFunction(()=>window.__forest?.ready&&!document.querySelector('#enter').disabled,null,{timeout:60000});
  await mobile.locator('#enter').tap();await mobile.locator('#watch').tap();assert.equal(await mobile.evaluate(()=>window.__forest.snapshot().watchRaised),true);
  assert.equal(await mobile.evaluate(()=>document.documentElement.scrollWidth),390);assert.equal(await mobile.locator('#joystick').isVisible(),true);
  await mobile.screenshot({path:'/tmp/opposite-free-mobile.png'});
  assert.deepEqual(errors,[]);assert.deepEqual(requests,[]);
  console.log('PASS: first-person controls, wrist clock, accurate portal crossings, recorded selves, persistent memories, pause, mode isolation, unbounded time, reset and mobile');
 }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exit(1);});
