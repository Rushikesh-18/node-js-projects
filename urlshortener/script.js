import { createServer } from 'http';
import { readFile } from 'fs/promises';
import path from 'path';

const PORT = 3002;


const servefile=async(res,filepath,contenttype)=>{
    try {
        const data = await readFile(filepath);
        res.writeHead(200, { "Content-Type": contenttype }); // Success
        res.end(data);
    } catch (error) {
        console.error(error);  // Log the error for debugging
        res.writeHead(404, { "Content-Type": contenttype });
        res.end("404 page not found");
    }
}
const server = createServer(async (req, res) => {
    if (req.method === 'GET') {
        if (req.url === "/") {
           
           return servefile(res,
            path.join("public", "index.html"),"text/html");
           
        }
        else if(req.url==="/style.css"){
            return servefile(res,path.join("public","style.css"),"text/css");
        }
        else {
            res.writeHead(404, { "Content-Type": "text/html" });
            res.end("404 page not found");
        }
    } else {
        res.writeHead(405, { "Content-Type": "text/html" }); // Method Not Allowed
        res.end("405 Method Not Allowed");
    }

    if(req.method==='POST' && req.url==="/shorten"){
        const body="";
        req.on("data",(chunk)=>{
            body+=chunk;
        })
        req.on('end',async()=>{
            const {url,shortcode} = JSON.parse(body);

            if(!url || !shortcode){
                res.writeHead(400,{"Content-Type":"text/plain"});
                return res.end('url or shortcode is missing');
            }

        })

    }
});

server.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});
