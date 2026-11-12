
const fs=require('node:fs'),path=require('node:path');
const out='dist';
fs.mkdirSync(out,{recursive:true});
for(const item of fs.readdirSync('.')) {
  if(item.startsWith('.')||['dist','vercel.json','node_modules','package.json','package-lock.json'].includes(item))continue;
  fs.cpSync(item,path.join(out,item),{recursive:true});
}
const configPath=path.join(out,'site-config.js');
const production=process.env.VERCEL_ENV==='production';
if(fs.existsSync(configPath)){
  const config=fs.readFileSync(configPath,'utf8');
  if(production&&!config.includes('"apiBase":"https://ed-prather-form-api.vercel.app"'))
    throw new Error('Production requires the configured lead API.');
  fs.writeFileSync(configPath,config.replace(/"reviewOnly":(?:true|false)/,'"reviewOnly":'+!production));
}
if(production) {
  const sitemap=fs.readFileSync(path.join(out,'sitemap.xml'),'utf8');
  let count=0;
  for(const match of sitemap.matchAll(/<loc>(.*?)<\/loc>/g)) {
    const route=new URL(match[1]).pathname;
    const file=path.join(out,route,'index.html');
    if(!fs.existsSync(file))throw new Error('Missing sitemap page: '+route);
    const html=fs.readFileSync(file,'utf8');
    fs.writeFileSync(file,html.replace('content="noindex,nofollow"','content="index,follow"'));
    count++;
  }
  fs.writeFileSync(path.join(out,'robots.txt'),'User-agent: *\nAllow: /\nSitemap: https://www.edprather.com/sitemap.xml\n');
  console.log('Production indexing enabled for '+count+' sitemap pages.');
}
