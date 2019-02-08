"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const pg_1 = require("pg");
const ConnectionConfig = {
    user: process.env.PG_USER,
    host: process.env.PG_HOST || '127.0.0.1',
    database: process.env.PG_DBNAME,
    password: process.env.PG_PASSWORD,
    port: process.env.PG_PORT ? parseInt(process.env.PG_PORT, 10) : 5432
};
const db = new pg_1.Client(ConnectionConfig);
db.connect(async (error) => {
    if (error) {
        await db.end();
        console.error('[DATABASE] ERROR DURING CONNECTION: ', error);
        process.exit(1);
    }
    else
        console.log('[DATABASE] CONNECTED!');
});
db.on('error', error => {
    console.error('[DATABASE] ERROR: ', error);
});
db.on('end', () => {
    console.warn('[DATABASE] DISCONNECTED!');
});
db.on('notice', notice => {
    console.warn('[DATABASE] NOTICE: ', notice);
});
exports.default = db;
//# sourceMappingURL=database.js.map