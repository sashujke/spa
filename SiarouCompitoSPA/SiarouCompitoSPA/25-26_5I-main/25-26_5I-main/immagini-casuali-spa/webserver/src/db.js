const mysql = require('mysql2/promise');

async function creaConnessione() {
    return await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        user: '5IPC12',
        password: '5IPC12',
        database: 'spa_images',
    });
}

async function getImmagini() {
    const conn = await creaConnessione();
    const [ results ] = await conn.query("SELECT * FROM images ORDER BY sort_order ASC, id ASC;");
    conn.close();
    return results;
}

async function salvaImmagine(immagine) {
    let conn = null;
    let affectedRows = 0;

    try {
        conn = await creaConnessione();
        const [ results ] = await conn.query(
            "INSERT INTO images (image_url, description, rating) VALUES (?, ?, ?);",
            [ immagine.image_url, immagine.description, immagine.rating ]
        );
        affectedRows = results.affectedRows;
    } catch (e) {
        return false;
    } finally {
        if (conn !== null) conn.close();
    }

    return affectedRows > 0;
}

async function trovaImmagine(id) {
    let conn = null;

    try {
        conn = await creaConnessione();
        const [ results ] = await conn.query(
            "SELECT * FROM images WHERE id = ?;", [ id ]
        );
        if (results.length > 0) return results[0];
        else return null;
    } catch (e) {
        return null;
    } finally {
        if (conn !== null) conn.close();
    }
}

async function modificaImmagine(id, immagine) {
    let conn = null;
    let affectedRows = 0;

    try {
        conn = await creaConnessione();
        const [ result ] = await conn.query(
            "UPDATE images SET image_url = ?, description = ?, rating = ? WHERE id = ?;",
            [ immagine.image_url, immagine.description, immagine.rating, id ]
        );
        affectedRows = result.affectedRows;
    } catch (e) {
        return false;
    } finally {
        if (conn !== null) conn.close();
    }

    return affectedRows > 0;
}

async function eliminaImmagine(id) {
    let conn = null;
    let affectedRows = 0;

    try {
        conn = await creaConnessione();
        const [ result ] = await conn.execute(
            "DELETE FROM images WHERE id = ?;", [ id ]
        );
        affectedRows = result.affectedRows;
    } catch (e) {
        return false;
    } finally {
        if (conn !== null) conn.close();
    }

    return affectedRows > 0;
}

async function salvaOrdinaPersonalizzato(ordini) {
    // ordini è un array di oggetti: [{ id: 1, sort_order: 0 }, { id: 2, sort_order: 1 }, ...]
    let conn = null;

    try {
        conn = await creaConnessione();
        
        for (const item of ordini) {
            await conn.query(
                "UPDATE images SET sort_order = ? WHERE id = ?;",
                [ item.sort_order, item.id ]
            );
        }
        
        return true;
    } catch (e) {
        console.error('Errore durante il salvataggio dell\'ordine personalizzato:', e);
        return false;
    } finally {
        if (conn !== null) conn.close();
    }
}

// per ora non serve a nulla ma la teniamo per compatibilita' con in-memory-db.js
function inizializza(callback) {
    callback();
}

module.exports = {
    inizializza,
    getImmagini,
    salvaImmagine,
    trovaImmagine,
    modificaImmagine,
    eliminaImmagine,
    salvaOrdinaPersonalizzato
}
