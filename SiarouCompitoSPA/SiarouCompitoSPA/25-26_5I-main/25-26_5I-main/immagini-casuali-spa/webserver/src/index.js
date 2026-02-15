const http = require('http');
const db = require('./db');

const PORT = 1337;


const server = http.createServer(async (req, res) => {
    // tutte le risposte sono in JSON
    // CORS headers per permettere richieste dal frontend
    res.setHeader('Content-Type', 'application/json');
    // permette origine dinamica in sviluppo; per produzione specificare origin fissa
    const origin = req.headers.origin || '*';
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Access-Control-Allow-Credentials', 'true');

    // gestisce preflight CORS
    if (req.method === 'OPTIONS') {
        res.statusCode = 204;
        res.end();
        return;
    }

    // estrae il contenuto della richiesta (anche detto 'body' o 'payload')
    // presuppone che il contenuto sia in formato JSON
    const getBody = () => {
        return new Promise((resolve, reject) => {
            let chunks = [];
            req.on('data', chunk => chunks.push(chunk));
            req.on('end', () => {
                let body = chunks.join();
                resolve(JSON.parse(body));
            });
        })
    }

    // controlla se metodo HTTP e URL della richiesta coincidono con quelli specificati
    // inoltre estrae eventuali parametri dall'URL e li mette nella variabile params
    let params;
    const reqMatch = (method, path) => {
        params = {};

        if (req.method !== method) return false;

        const urlSplit = req.url.split('/');
        const pathSplit = path.split('/');
        if (urlSplit.length !== pathSplit.length) return false;

        let result = true;
        for (let i = 0; i < urlSplit.length; i++) {
            if (pathSplit[i].startsWith(':')) {
                const paramName = pathSplit[i].substr(1);
                params[paramName] = urlSplit[i];
            }
            else if (pathSplit[i] !== urlSplit[i]) {
                result = false;
                break;
            }
        }
        return result;
    }

    if (reqMatch('GET', '/images')) {
        const immagini = await db.getImmagini();
        res.end(JSON.stringify(immagini));
    }
    else if (reqMatch('POST', '/images')) {
        const immagine = await getBody();
        const ok = await db.salvaImmagine(immagine);
        res.statusCode = ok ? 201 : 400;
        res.end();
    }
    else if (reqMatch('GET', '/images/:id')) {
        const id = parseInt(params.id);
        const trovata = await db.trovaImmagine(id);
        if (trovata) res.end(JSON.stringify(trovata));
        else {
            res.statusCode = 404;
            res.end();
        }
    }
    else if (reqMatch('PUT', '/images/:id')) {
        const id = parseInt(params.id);
        const immagine = await getBody();
        const ok = await db.modificaImmagine(id, immagine);
        res.statusCode = ok ? 204 : 404;
        res.end();
    }
    else if (reqMatch('DELETE', '/images/:id')) {
        const id = parseInt(params.id);
        const ok = await db.eliminaImmagine(id);
        res.statusCode = ok ? 204 : 404;
        res.end();
    }
    else if (reqMatch('POST', '/images/update-order')) {
        const ordini = await getBody();
        const ok = await db.salvaOrdinaPersonalizzato(ordini);
        res.statusCode = ok ? 200 : 400;
        res.end(JSON.stringify({ success: ok }));
    }
    else {
        res.statusCode = 404;
        res.end();
    }
});

db.inizializza(() => {
    server.listen(PORT, () => {
        console.log('Server in ascolto su http://localhost:' + PORT);
    });
});
