const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const path=require('node:path');
(async()=>{
 const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||undefined,headless:true,args:['--no-sandbox','--use-angle=swiftshader','--enable-webgl','--ignore-gpu-blocklist','--enable-unsafe-swiftshader']});
 try{
  const page=await browser.newPage({viewport:{width:1100,height:760},deviceScaleFactor:Number(process.env.TEST_DPR||1),reducedMotion:'reduce'}),errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  await page.goto('file://'+path.resolve(__dirname,'../index.html'));
  await page.waitForFunction(()=>window.__forest?.ready&&!document.querySelector('#enter').disabled);
  await page.evaluate(()=>{THREE.Clock.prototype.getDelta=()=>{const d=window.testDelta||0;window.testDelta=0;return d;};});
  await page.locator('#enter').click();
  const snap=()=>page.evaluate(()=>window.__forest.snapshot());
  async function advance(seconds){
   for(let i=0;i<seconds;i++)await page.evaluate(()=>new Promise(resolve=>{window.testDelta=1;requestAnimationFrame(()=>requestAnimationFrame(resolve));}));
  }
  await page.locator('#mode-story').click();await page.locator('#play').click();
  await advance(23);const before=await snap();assert.equal(before.forwardMemory,23);
  await advance(5);const flip=await snap();assert.equal(flip.observer,'b');assert.equal(flip.forwardMemory,24);assert.equal(flip.reverseMemory,4);assert.ok(flip.storyPose.flip>0&&flip.storyPose.flip<1);
  await page.screenshot({path:'/tmp/opposite-story-flip.png'});
  await advance(7);const sitting=await snap();assert.equal(sitting.storyPose.flip,1);assert.equal(sitting.storyPose.sit,1);assert.equal(sitting.personalTime,35);assert.equal(sitting.storyPose.turn,1);assert.ok(sitting.runnerScreen.visible);
  await page.screenshot({path:'/tmp/opposite-story-seated.png'});
  await page.locator('#mode-runner').click();assert.equal((await snap()).inspected,'reverse');await page.locator('#play').click();
  await advance(16);const a=await snap();assert.equal(a.runnerPhase,'배를 위로 향해 누움');assert.equal(a.selectedMemory.forward,24);assert.equal(a.selectedMemory.reverse,8);assert.ok(a.travellers.every(t=>t.visible));
  const neuralBox=await page.locator('.neural-panel').boundingBox();
  for(const t of a.travellers)assert.ok(t.x>neuralBox.x+neuralBox.width||t.y>neuralBox.y+neuralBox.height,'traveller is not covered by the neural panel');
  await page.screenshot({path:'/tmp/opposite-runner-view.png'});
  const forward=a.travellers.find(t=>t.kind==='forward');await page.mouse.click(forward.x,forward.y);assert.equal((await snap()).inspected,'forward');
  const reverse=a.travellers.find(t=>t.kind==='reverse');await page.mouse.click(reverse.x,reverse.y);assert.equal((await snap()).inspected,'reverse');
  await advance(5);assert.equal((await snap()).selectedMemory.reverse,3);assert.equal((await snap()).selectedMemory.forward,24);
  await advance(5);const after=await snap();assert.equal(after.selectedMemory.present,false);assert.equal(after.runnerMemory,26);assert.equal(after.playing,true);assert.ok(after.travellers.every(t=>!t.visible));
  assert.match(await page.locator('#neural-caption').innerText(),/여행자가 없습니다/);
  await advance(22);assert.equal((await snap()).t,1);assert.equal((await snap()).playing,false);
  await page.locator('#mode-story').click();assert.equal((await snap()).personalTime,35);await advance(13);assert.equal((await snap()).personalTime,48);assert.equal((await snap()).playing,false);assert.equal((await snap()).storyPose.sit,1);
  await page.locator('#mode-basic').click();assert.equal((await snap()).personalTime,0);
  await page.locator('#mode-runner').click();assert.equal((await snap()).runnerMemory,48);await page.locator('#restart').click();assert.equal((await snap()).runnerMemory,0);assert.equal((await snap()).inspected,'reverse');
  await page.setViewportSize({width:390,height:844});await page.screenshot({path:'/tmp/opposite-runner-mobile.png'});
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth),390);
  const modes=await page.locator('.modes').boundingBox(),panel=await page.locator('.neural-panel').boundingBox();assert.ok(modes.y+modes.height<=panel.y);
  assert.deepEqual(errors,[]);
  console.log('PASS: story portal, flip and sit, continuous memories, A traveller selection and post-portal continuation, saved modes, reset, mobile');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exit(1);});
