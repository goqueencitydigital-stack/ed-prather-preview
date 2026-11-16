
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
    let live=html.replace('content="noindex,nofollow"','content="index,follow"');
    if(['/privacy-policy/','/terms/'].includes(route)){
      live=live.replace(
        'This review version does not send website inquiries or applications. If you attempt to submit a form, the website reports that delivery is unavailable and that your request has not been sent. You can contact the team by phone or email instead.',
        'When online delivery is enabled, completed forms pass through the website’s Vercel-hosted backend to Zapier for processing into the team’s Follow Up Boss account. If delivery is unavailable or uncertain, the website displays an error rather than a successful submission.'
      );
    }
    fs.writeFileSync(file,live);
    count++;
  }
  fs.writeFileSync(path.join(out,'robots.txt'),'User-agent: *\nAllow: /\nSitemap: https://www.edprather.com/sitemap.xml\n');
  console.log('Production indexing enabled for '+count+' sitemap pages.');
}
