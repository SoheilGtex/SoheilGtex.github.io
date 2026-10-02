// Optional QA only. The website itself has no Node/package dependency.
const {chromium}=require('playwright');
const fs=require('node:fs'),path=require('node:path'),http=require('node:http'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..'),out=process.env.QA_OUTPUT_DIR?path.resolve(process.env.QA_OUTPUT_DIR):null;
if(out)fs.mkdirSync(out,{recursive:true});
const types={'.html':'text/html','.css':'text/css','.js':'text/javascript','.mjs':'text/javascript','.json':'application/json','.svg':'image/svg+xml','.woff2':'font/woff2','.pdf':'application/pdf'};
const server=http.createServer((req,res)=>{
 let url=new URL(req.url,'http://localhost').pathname;if(url.startsWith('/repo/'))url=url.slice(5);
 let file=path.join(root,decodeURIComponent(url));
 if(!file.startsWith(root)){res.writeHead(403).end();return;}
 if(fs.existsSync(file)&&fs.statSync(file).isDirectory())file=path.join(file,'index.html');
 if(!fs.existsSync(file)){res.writeHead(404).end();return;}
 res.setHeader('Content-Type',types[path.extname(file)]||'text/plain');res.end(fs.readFileSync(file));
});
const checks=[],violations=[],errors=[],pass=name=>{checks.push(name);console.log('PASS',name)};
let browser;
(async()=>{
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));const base='http://127.0.0.1:'+server.address().port;
 browser=await chromium.launch({headless:true,...(process.env.QA_BROWSER_PATH?{executablePath:process.env.QA_BROWSER_PATH}:{}),args:['--no-sandbox']});
 const context=await browser.newContext({permissions:['clipboard-read','clipboard-write'],viewport:{width:1366,height:768}}),page=await context.newPage();
 page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.status()>=400)errors.push(r.url()+' '+r.status())});
 await page.goto(base+'/');await page.waitForSelector('#email-address[role="button"]');
 const email='soheilsalmanisafarpour@gmail.com';assert.equal(await page.locator('#email-address').textContent(),email);
 await page.locator('#email-address').click();await page.waitForFunction(()=>document.getElementById('email-feedback').textContent==='Copied');
 assert.equal(await page.evaluate(()=>navigator.clipboard.readText()),email);assert.equal(page.url(),base+'/');
 await page.waitForFunction(()=>document.getElementById('email-feedback').textContent==='');
 await page.locator('#email-address').focus();await page.keyboard.press('Space');await page.waitForFunction(()=>document.getElementById('email-feedback').textContent==='Copied');
 assert.equal(await page.locator('.email-compose').getAttribute('href'),'mailto:'+email);
 pass('Real clipboard copy, transient Copied confirmation, keyboard Space and separate mailto action');
 const unavailable=await browser.newContext();await unavailable.addInitScript(()=>Object.defineProperty(navigator,'clipboard',{configurable:true,value:undefined}));
 const unavailablePage=await unavailable.newPage();await unavailablePage.goto(base+'/');
 assert.equal(await unavailablePage.locator('#email-address').getAttribute('role'),null);
 assert.equal(await unavailablePage.locator('#email-address').getAttribute('href'),'mailto:'+email);
 assert.equal(await unavailablePage.locator('#email-address').evaluate(n=>getComputedStyle(n).userSelect),'text');
 pass('Unavailable Clipboard API retains the full selectable address and mailto fallback');
 const denied=await browser.newContext();await denied.addInitScript(()=>Object.defineProperty(navigator,'clipboard',{configurable:true,value:{writeText:()=>Promise.reject(new Error('Denied for QA'))}}));
 const deniedPage=await denied.newPage();await deniedPage.goto(base+'/');await deniedPage.locator('#email-address').click();
 await deniedPage.waitForFunction(()=>document.getElementById('email-feedback').textContent==='Select to copy');
 assert.equal(await deniedPage.evaluate(()=>getSelection().toString()),email);assert.equal(await deniedPage.locator('#email-address').getAttribute('role'),null);
 assert.equal(await deniedPage.locator('.email-compose').getAttribute('href'),'mailto:'+email);
 pass('Rejected clipboard write selects the address, reports a fallback and preserves mailto');
 for(const mount of ['/','/repo/'])for(const route of ['','academics/','industry/']){
   await page.goto(base+mount+route);if(route==='academics/')await page.waitForSelector('html[data-academic-ready="true"]');if(route==='industry/')await page.waitForSelector('html[data-projects-ready="true"]');
   const broken=await page.evaluate(async()=>{
     const urls=[...document.querySelectorAll('a[href],link[href],script[src]')].map(n=>n.href||n.src).filter(u=>u&&u.startsWith(location.origin));
     return (await Promise.all(urls.map(async u=>({url:u,status:(await fetch(u)).status})))).filter(r=>r.status!==200);
   });assert.deepEqual(broken,[]);
 }
 pass('All routes, relative assets, JSON and document links work at root and repository subpath');
 await page.goto(base+'/academics/');await page.waitForSelector('html[data-academic-ready="true"]');
 assert.match(await page.locator('#overall-gpa').textContent(),/^18\.07/);assert.match(await page.locator('#relevant-gpa').textContent(),/^17\.62/);assert.equal(await page.locator('#completed-credits').textContent(),'56');
 assert.equal(await page.locator('#evaluated-gpa').isVisible(),false);assert.equal(await page.locator('.course-node').count(),47);assert.equal(await page.locator('.course-edge').count(),0);
 assert.equal(await page.locator('.course-node[data-status="in_progress"]').count(),5);assert.equal(await page.locator('.course-node[data-category="interest_only"]').count(),8);
 const groups=page.locator('#coursework-record .coursework-section');assert.equal(await groups.count(),4);
 assert.equal(await page.locator('#coursework-record [data-group="in_progress"] tbody tr').count(),5);assert.match(await page.locator('#coursework-record [data-group="in_progress"] summary').textContent(),/19 credits/);
 assert.equal(await page.locator('#coursework-record [data-group="planned"] tbody tr').count(),16);assert.equal(await page.locator('#coursework-record [data-group="interest_only"] tbody tr').count(),8);
 const text=await page.locator('#coursework-record').textContent();assert.ok(!/Semester|General Persian|Student Life Skills|Islamic Ethics|Human in Islam|General Mathematics/.test(text));assert.match(text,/General English/);for(const title of ['Calculus I','Calculus II','Calculus III'])assert.ok(text.includes(title));
 assert.match(await page.locator('#ta-course-list').textContent(),/MATLAB II/);assert.match(await page.locator('#ta-meta').textContent(),/Kharazmi University/);
 await page.locator('#tab-map').focus();await page.keyboard.press('ArrowRight');assert.equal(await page.locator('#tab-list').getAttribute('aria-selected'),'true');
 await page.locator('.coursework-course-button').first().click();assert.match(await page.locator('.coursework-inline-detail').textContent(),/Calculus I/);await page.keyboard.press('Escape');assert.equal(await page.locator('.coursework-inline-detail').count(),0);
 pass('Distinct GPA scopes, null evaluated GPA, four status groups, visibility, normalized titles, TA history and keyboard details');
 const fixture=JSON.parse(fs.readFileSync(path.join(root,'data/academics.json')));
 fixture.courses.push({id:'qa-added-course',title:'QA Added Course',credits:3,grade:20,status:'completed',category:'core',profile_visible:true,semester:99,prerequisites:[]});
 fixture.courses.push({id:'qa-hidden-course',title:'QA Hidden Course',credits:2,grade:null,status:'planned',category:'general',profile_visible:false,prerequisites:[]});
 const addition=await context.newPage();await addition.route('**/data/academics.json',r=>r.fulfill({json:fixture}));await addition.goto(base+'/academics/');await addition.waitForSelector('html[data-academic-ready="true"]');
 assert.equal(await addition.locator('.course-node').count(),48);assert.equal(await addition.locator('#completed-credits').textContent(),'59');assert.match(await addition.locator('#overall-gpa').textContent(),/^18\.15/);assert.match(await addition.locator('#relevant-gpa').textContent(),/^17\.74/);
 await addition.locator('.course-node[data-id="qa-added-course"]').click();assert.match(await addition.locator('#course-detail').textContent(),/Core mathematics/);assert.ok(!(await addition.locator('#course-detail').textContent()).includes('Semester'));
 assert.equal(await addition.locator('.course-node[data-id="qa-hidden-course"]').count(),0);
 pass('Data-only future course addition updates title, credits, grade, category and both GPAs; semester metadata never groups public views');
 fixture.courses.at(-2).profile_visible=false;await addition.reload();await addition.waitForSelector('html[data-academic-ready="true"]');assert.equal(await addition.locator('.course-node').count(),47);assert.match(await addition.locator('#relevant-gpa').textContent(),/^17\.62/);
 pass('Data-only profile visibility change removes the course and its relevant-average contribution');
 fixture.gpa_4={value:3.7,method:'Synthetic receiving-institution method for QA only',note:'Not a real evaluation'};await addition.reload();await addition.waitForSelector('html[data-academic-ready="true"]');assert.match(await addition.locator('#evaluated-gpa').textContent(),/3\.70 \/ 4\.00.*Synthetic receiving-institution/);
 pass('Synthetic named external GPA renders from JSON without HTML editing');
 const projects=JSON.parse(fs.readFileSync(path.join(root,'data/projects.json')));projects.projects.push({id:'qa-project',title:'QA New Project',description:'<script>window.xss=1</script>',url:'https://example.com/qa'});
 const addedProject=await context.newPage();await addedProject.route('**/data/projects.json',r=>r.fulfill({json:projects}));await addedProject.goto(base+'/industry/');await addedProject.waitForSelector('html[data-projects-ready="true"]');assert.equal(await addedProject.locator('.project-row').count(),5);assert.match(await addedProject.locator('.project-row').last().textContent(),/QA New Project/);assert.equal(await addedProject.evaluate(()=>window.xss),undefined);
 pass('Future project addition is automatic and descriptions are safely inserted as text');
 const nojs=await browser.newContext({javaScriptEnabled:false,viewport:{width:390,height:844}}),staticPage=await nojs.newPage();
 await staticPage.goto(base+'/');assert.equal(await staticPage.locator('#email-address').getAttribute('href'),'mailto:'+email);assert.equal(await staticPage.locator('.email-compose').count(),1);
 await staticPage.goto(base+'/academics/');assert.equal(await staticPage.locator('#static-record tbody tr').count(),47);assert.equal(await staticPage.locator('#static-record .coursework-section').count(),4);assert.match(await staticPage.locator('#static-record').textContent(),/BEYOND CURRICULUM/);assert.ok(!(await staticPage.locator('#static-record').textContent()).includes('Semester'));
 await staticPage.locator('#static-record [data-group="in_progress"] summary').click();assert.ok(await staticPage.locator('#static-record [data-group="in_progress"] table').isVisible());
 await staticPage.goto(base+'/industry/');assert.equal(await staticPage.locator('.project-row').count(),4);
 pass('Without JavaScript, mailto, selectable email, four status groups, native disclosure and all projects remain usable');
 const failure=await context.newPage();await failure.route('**/data/academics.json',r=>r.abort());await failure.goto(base+'/academics/');await failure.waitForSelector('#data-message:not([hidden])');assert.ok(await failure.locator('#static-record').isVisible());assert.equal(await failure.locator('#static-record tbody tr').count(),47);
 pass('Academic fetch failure leaves the complete status-based saved record');
 for(const theme of ['dark','light'])for(const width of [1366,768,390,320])for(const route of ['','academics/','industry/']){
   await page.evaluate(t=>localStorage.setItem('soheil-theme',t),theme);await page.setViewportSize({width,height:844});await page.goto(base+'/'+route);await page.evaluate(()=>document.fonts.ready);await page.evaluate(()=>Promise.all(document.getAnimations().map(a=>a.finished)));
   if(route==='academics/')await page.waitForSelector('html[data-academic-ready="true"]');if(route==='industry/')await page.waitForSelector('html[data-projects-ready="true"]');
   assert.equal(await page.locator('html').getAttribute('data-theme'),theme);assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),`${theme} ${route} width ${width} overflow`);
   if(out&&[1366,390].includes(width))await page.screenshot({path:path.join(out,`${theme}-${route?route.slice(0,-1):'home'}-${width}.png`),fullPage:true});
   if(route==='academics/'&&width<=660)assert.equal(await page.locator('#tab-list').getAttribute('aria-selected'),'true');
   if(process.env.QA_AXE_PATH&&[1366,390].includes(width)){
     await page.addScriptTag({path:process.env.QA_AXE_PATH});
     for(const mode of route==='academics/'?['map','list']:['page']){
       if(mode!=='page')await page.locator('#tab-'+mode).click();
       const result=await page.evaluate(()=>axe.run(document,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21a','wcag21aa']}}));
       violations.push({theme,width,route,mode,violations:result.violations.map(v=>({id:v.id,nodes:v.nodes.map(n=>n.target)}))});
     }
   }
 }
 pass('Both themes and all routes remain overflow-free through 320px; mobile defaults to status List');
 if(violations.length){assert.ok(violations.every(r=>r.violations.length===0),JSON.stringify(violations));pass('Axe reports zero WCAG 2.1 A/AA violations in both themes, routes and academic views at desktop/mobile widths');}
 const reduced=await browser.newContext({reducedMotion:'reduce'}),reducedPage=await reduced.newPage();await reducedPage.goto(base+'/');assert.equal(await reducedPage.locator('.vertex[tabindex]').count(),0);assert.equal(await reducedPage.locator('h1').evaluate(n=>getComputedStyle(n).animationName),'none');
 pass('Approved reduced-motion behavior is preserved');
 assert.deepEqual(errors,[]);pass('No runtime errors or broken local responses');
 if(out)fs.writeFileSync(path.join(out,'browser-validation.json'),JSON.stringify({checks,violations,errors},null,2));
 await browser.close();server.close();
})().catch(async error=>{console.error(error.stack);if(out)fs.writeFileSync(path.join(out,'browser-validation-failure.json'),JSON.stringify({checks,violations,errors:[...errors,error.stack]},null,2));if(browser)await browser.close();server.close();process.exitCode=1;});
