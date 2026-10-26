import http from 'node:http';
import {readFile,stat} from 'node:fs/promises';
import path from 'node:path';
const root=path.resolve(process.argv.includes('--dist')?'dist':'.');
const index=process.argv.indexOf('--port');const port=index>=0?Number(process.argv[index+1]):5183;
const types={'.html':'text/html; charset=utf-8','.mjs':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.webp':'image/webp','.png':'image/png','.svg':'image/svg+xml','.ico':'image/x-icon'};
const server=http.createServer(async(req,res)=>{
  try{
    const url=new URL(req.url,'http://localhost'), decoded=decodeURIComponent(url.pathname);
    if(!['GET','HEAD'].includes(req.method)){res.writeHead(405);return res.end();}
    const file=path.resolve(root,'.'+(decoded==='/'?'/index.html':decoded));
    if(!file.startsWith(root+path.sep)||!['index.html','src','assets'].includes(path.relative(root,file).split(path.sep)[0])){res.writeHead(404);return res.end('Not found');}
    if(!(await stat(file)).isFile()){res.writeHead(404);return res.end('Not found');}
    res.writeHead(200,{'Content-Type':types[path.extname(file)]||'application/octet-stream','X-Content-Type-Options':'nosniff','Referrer-Policy':'no-referrer','Content-Security-Policy':"default-src 'self'; img-src 'self' data:; style-src 'self'; script-src 'self'; connect-src 'self'; object-src 'none'; frame-ancestors 'none'; base-uri 'self'; form-action 'none'",'Cache-Control':'no-store'});
    res.end(req.method==='HEAD'?undefined:await readFile(file));
  }catch{res.writeHead(404);res.end('Not found');}
});
server.listen(port,'127.0.0.1',()=>console.log(`건강니 치과 · http://127.0.0.1:${port}`));
