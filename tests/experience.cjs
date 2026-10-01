// Run with NODE_PATH pointing to an installed Playwright and CHROMIUM_PATH if needed.
const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const path=require('node:path');
(async()=>{
 const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||undefined,headless:true,args:['--no-sandbox','--use-angle=swiftshader','--enable-webgl','--ignore-gpu-blocklist','--enable-unsafe-swiftshader']});
 try {
 const page=await browser.newPage({viewport:{width:1100,height:760},deviceScaleFactor:Number(process.env.TEST_DPR||1)});
 const errors=[],requests=[];page.on('pageerror',e=>{errors.push(e.message);console.error('PAGE ERROR',e.message)});page.on('console',m=>{if(m.type()==='error')errors.push(m.text())});page.on('request',r=>{if(/^https?:/.test(r.url()))requests.push(r.url())});
 await page.goto('file://'+path.resolve(__dirname,'../index.html'));console.log('loaded');
 await page.waitForFunction(()=>window.__forest?.ready&&!document.querySelector('#enter').disabled,null,{timeout:20000}).catch(async e=>{console.error(await page.evaluate(()=>({ready:window.__forest?.ready,enter:document.querySelector('#enter').disabled,error:document.querySelector('#error').className})));throw e;});
 const snap=()=>page.evaluate(()=>window.__forest.snapshot());
 assert.equal((await snap()).observer,'a');assert.equal((await snap()).t,0);
 assert.equal((await page.locator('.neural-panel').innerText()).trim(),'');
 const panelCanvas=await page.locator('#neurons').boundingBox();assert.ok(panelCanvas.height>230);
 assert.equal(await page.locator('.neural-panel button svg').count(),2);
 // Advance the existing RAF loop faster without exposing production mutation controls.
 await page.evaluate(()=>{THREE.Clock.prototype.getDelta=()=>.4;});
 await page.locator('#enter').click();
 await page.waitForFunction(()=>window.__forest.snapshot().t>.33,null,{timeout:60000});
 await page.locator('#play').click();
 const fallen=await snap();assert.equal(fallen.runnerPhase,'배를 위로 향해 누움');assert.equal(fallen.observer,'a');assert.ok(fallen.forwardMemory>15);
 console.log('fallen',JSON.stringify(fallen));await page.screenshot({path:'/tmp/opposite-fallen.png'});assert.ok(fallen.runnerScreen.visible);
 await page.mouse.click(fallen.runnerScreen.x,fallen.runnerScreen.y);
 assert.equal((await snap()).inspected,'runner');assert.equal((await snap()).cinema,true);
 await page.screenshot({path:'/tmp/opposite-fallen.png'});
 const paused=await snap();await page.keyboard.press('KeyR');await page.keyboard.press('Space');await page.mouse.wheel(0,500);await page.waitForTimeout(150);
 assert.equal((await snap()).t,paused.t);assert.equal((await snap()).observer,'a');
 await page.locator('#play').click();
 await page.waitForFunction(()=>window.__forest.snapshot().crossings===1,null,{timeout:60000});
 await page.locator('#play').click();const crossed=await snap();assert.equal(crossed.observer,'b');assert.ok(crossed.forwardMemory>=fallen.forwardMemory);
 await page.locator('#play').click();await page.waitForFunction(p=>window.__forest.snapshot().reverseMemory>p+3,crossed.reverseMemory,{timeout:60000});await page.locator('#play').click();
 const reverse=await snap();assert.ok(reverse.t<crossed.t);assert.ok(reverse.runnerMemory<crossed.runnerMemory);assert.ok(reverse.personalTime>crossed.personalTime);assert.equal(reverse.forwardMemory,crossed.forwardMemory);assert.equal(reverse.crossings,1);
 await page.locator('#inspect-self').click();assert.equal((await snap()).inspected,'self');
 await page.screenshot({path:'/tmp/opposite-reverse.png'});
 await page.locator('#play').click();await page.waitForFunction(()=>window.__forest.snapshot().t<.23,null,{timeout:60000});await page.locator('#play').click();assert.equal((await snap()).runnerPhase,'달리기');assert.ok((await snap()).forwardMemory>=fallen.forwardMemory);
 await page.locator('#play').click();await page.waitForFunction(()=>window.__forest.snapshot().t===0,null,{timeout:60000});const boundary=await snap();assert.equal(boundary.playing,false);assert.ok(boundary.reverseMemory>0);await page.locator('#play').click();await page.waitForTimeout(200);assert.equal((await snap()).t,0);assert.equal((await snap()).forwardMemory,boundary.forwardMemory);
 await page.locator('#restart').click();await page.locator('#play').click();const restart=await snap();assert.equal(restart.observer,'a');assert.equal(restart.crossings,0);assert.equal(restart.reverseMemory,0);assert.ok(restart.forwardMemory<2);
 const mobile=await browser.newPage({viewport:{width:390,height:844},isMobile:true,hasTouch:true,reducedMotion:'reduce'});mobile.on('pageerror',e=>errors.push(e.message));
 await mobile.goto('file://'+path.resolve(__dirname,'../index.html'));await mobile.waitForFunction(()=>window.__forest?.ready&&!document.querySelector('#enter').disabled,null,{timeout:60000});await mobile.locator('#enter').click();assert.equal(await mobile.evaluate(()=>window.__forest.snapshot().playing),false);assert.equal(await mobile.evaluate(()=>document.documentElement.scrollWidth),390);await mobile.locator('#joystick').waitFor({state:'visible'});await mobile.locator('#inspect-runner').click();assert.equal(await mobile.evaluate(()=>window.__forest.snapshot().inspected),'runner');await mobile.screenshot({path:'/tmp/opposite-neural-mobile.png'});
 assert.deepEqual(errors,[]);assert.deepEqual(requests,[]);
 console.log(JSON.stringify({passed:true,checks:['forward start','running and belly-up fall','3D click selection without interrupting cinema','pause and removed reverse shortcuts','physical portal crossing','forward memories retained, reverse memories accumulate','A memory and motion rewind','no repeated portal trigger','whole-journey reset','mobile and reduced motion','no runtime errors or network requests'],crossed,reverse},null,2));
 } finally {await browser.close();}
})().catch(e=>{console.error(e);process.exit(1)});
