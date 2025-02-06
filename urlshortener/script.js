import { createServer } from 'http';
import { readFile } from 'fs/promises';
import path from 'path';
import { writeFile } from 'fs/promises';

const PORT = 3002;
const DATA_FILE = path.join('data', "links.json");

const servefile = async (res, filepath, contenttype) => {
    try {
        const data = await readFile(filepath);
        res.writeHead(200, { "Content-Type": contenttype }); // Success
        res.end(data);
    } catch (error) {
        console.error(error);  // Log the error for debugging
        res.writeHead(404, { "Content-Type": "text/html" });
        res.end("404 page not found");
    }
};

const loadlinks = async () => {
    try {
        const data = await readFile(DATA_FILE, 'utf-8');
        if (!data) {
            return {};  // Return empty object if the file is empty
        }

        return JSON.parse(data);
    } catch (error) {
        if (error.code === "ENOENT") {  // ERROR NO ENTRY MEANS FILE NOT PRESENT
            await writeFile(DATA_FILE, JSON.stringify({}));
            return {};
        }
        throw error;
    }
};

const savelinks = async (links) => {
    return await writeFile(DATA_FILE, JSON.stringify(links));
};

const server = createServer(async (req, res) => {
    if (req.method === 'GET') {
        if (req.url === "/") {
            return servefile(res, path.join("public", "index.html"), "text/html");
        }
        else if (req.url === "/style.css") {
            return servefile(res, path.join("public", "style.css"), "text/css");
        }
        else if(req.url=="/links"){
            const links=await loadlinks();
            res.writeHead(200, { "Content-Type": "application/json" });
            return res.end(JSON.stringify(links));
        }
        else {
            // res.writeHead(404, { "Content-Type": "text/html" });
            // res.end("404 page not found");
            const links=await loadlinks();
            const shortcode=req.url.slice(1);
            if(links[shortcode]){
                /* The line `res.writeHead(302,{"Location": links[shortcode],  "Content-Type":
                "text/html" });` is setting the response header for a 302 status code, which
                indicates a temporary redirection. */
                res.writeHead(302,{"Location": links[shortcode],  "Content-Type": "text/html" });  //302 for temporary redirrctions
                return res.end();
            }
            res.writeHead(404, { "Content-Type": "text/html" });
            res.end("404 page not found");
        }
    } else if (req.method === 'POST' && req.url === "/shorten") {  // Corrected placement for POST handler
        const links = await loadlinks();
        let body = "";
        req.on("data", (chunk) => (body += chunk));
        req.on('end', async () => {
            
            
            const { url, cname } = JSON.parse(body);

            if (!url ) {
                res.writeHead(400, { "Content-Type": "text/plain" });
                return res.end('url or shortcode is missing');
            }

            const finalshortcode = cname;
            if (links[finalshortcode]) {
                res.writeHead(400, { "Content-Type": "text/plain" });
                return res.end("Short code already exists, Please choose another");
            }

            links[finalshortcode] = url;
            await savelinks(links);

            res.writeHead(200, { "Content-Type": "text/plain" });
            res.end();
        });

    } else {
        res.writeHead(405, { "Content-Type": "text/html" });  // Method Not Allowed
        res.end("405 Method Not Allowed");
    }
});

server.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});
