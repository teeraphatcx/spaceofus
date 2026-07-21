const http = require("http");
const fs = require("fs");
const path = require("path");
const root = path.resolve(".");
const mime = {".html":"text/html",".css":"text/css",".js":"application/javascript",".png":"image/png",".jpg":"image/jpeg",".jpeg":"image/jpeg",".svg":"image/svg+xml"};
const server = http.createServer((req,res)=>{
  const reqPath = req.url === "/" ? "/index.html" : req.url;
  const filePath = path.join(root, decodeURIComponent(reqPath));
  fs.stat(filePath,(err,stats)=>{
    if(err || stats.isDirectory()){res.writeHead(404); res.end("Not found"); return;}
    const ext = path.extname(filePath).toLowerCase();
    res.writeHead(200, {'Content-Type': mime[ext] || 'application/octet-stream'});
    fs.createReadStream(filePath).pipe(res);
  });
});
server.listen(8000, ()=>console.log("listening"));
