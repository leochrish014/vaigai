const {chromium}=require('/home/claude/.npm-global/lib/node_modules/playwright');
(async()=>{const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome',args:['--no-sandbox']});
const shots=[];
for(const [th,w,h] of [['light',1366,768],['dark',1366,768],['light',390,844],['dark',390,844]]){
 const ctx=await b.newContext({viewport:{width:w,height:h},colorScheme:th});const p=await ctx.newPage();await p.goto('file:///mnt/user-data/outputs/vaigai-site/index.html');await p.waitForTimeout(900);
 for(const id of ['story','range']){await p.evaluate(i=>{document.getElementById(i).scrollIntoView({block:'start'})},id);await p.evaluate(()=>{document.querySelectorAll('img').forEach(i=>i.loading='eager')});await p.waitForTimeout(1200);
  if(id==='range'){await p.evaluate(()=>{window.scrollBy(0,document.getElementById('range').getBoundingClientRect().top-70)});await p.click('#cnx');await p.waitForTimeout(900)}
  const f=`/home/claude/shots/v_${th}_${w}_${id}.png`;await p.screenshot({path:f});shots.push(f)}
 await ctx.close()}
await b.close();console.log(shots.length)})();
