// Writes your settings into every Config node, so you do not edit nine nodes by hand.
// 1) copy config.example.json to config.json and fill it in   2) node configure.js config.json
// Output goes to ./configured/ . Import those files into n8n.
const fs=require('fs'),path=require('path');
const cfgFile=process.argv[2]||'config.json';const cfg=JSON.parse(fs.readFileSync(cfgFile,'utf8'));
const out=path.join(__dirname,'configured');fs.mkdirSync(out,{recursive:true});
let n=0;for(const f of fs.readdirSync(__dirname).filter(x=>/^\d\d-.*\.json$/.test(x))){
 const w=JSON.parse(fs.readFileSync(path.join(__dirname,f),'utf8'));
 for(const node of w.nodes){if(node.type==='n8n-nodes-base.set'&&/^Config/.test(node.name)){for(const a of node.parameters.assignments.assignments){if(cfg[a.name]!==undefined){a.value=String(cfg[a.name]);n++}}}
  if(node.type==='n8n-nodes-base.webhook'&&cfg.allowed_origin)node.parameters.options.allowedOrigins=cfg.allowed_origin}
 fs.writeFileSync(path.join(out,f),JSON.stringify(w,null,2))}
console.log('Updated',n,'config values. Files written to',out);