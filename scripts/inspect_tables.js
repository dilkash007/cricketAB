
import pkg from 'pg';
const { Client } = pkg;
import dotenv from 'dotenv';

dotenv.config();

const client = new Client({
    host: process.env.CRICKET_DB_HOST,
    user: process.env.CRICKET_DB_USER,
    password: process.env.CRICKET_DB_PASSWORD,
    database: process.env.CRICKET_DB_NAME,
    port: parseInt(process.env.CRICKET_DB_PORT),
});

async function inspectTables() {
    try {
        await client.connect();

        console.log('\n--- BITS TABLE STRUCTURE ---');
        const bets = await client.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_schema = 'site3_users' AND table_name = 'bets'");
        console.table(bets.rows);

        console.log('\n--- MATCHES TABLE STRUCTURE ---');
        const matches = await client.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_schema = 'site1_superadmin' AND table_name = 'matches'");
        console.table(matches.rows);

    } catch (err) {
        console.error(err);
    } finally {
        await client.end();
    }
}

inspectTables();
