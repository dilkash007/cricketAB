
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

async function seedRealReports() {
    try {
        await client.connect();
        console.log('--- SEEDING REAL REPORT DATA ---');

        // 1. Get users and matches
        const users = await client.query('SELECT id, user_id FROM site3_users.users');
        const matches = await client.query('SELECT match_id FROM site1_superadmin.matches');

        if (users.rowCount === 0 || matches.rowCount === 0) {
            console.log('Missing users or matches. Please create them first!');
            return;
        }

        // 2. Clear old bets to start fresh for "real" report
        await client.query('DELETE FROM site3_users.bets');

        // 3. Generate 50 random bets
        console.log(`Generating bets for ${users.rowCount} users across ${matches.rowCount} matches...`);

        for (let i = 0; i < 50; i++) {
            const user = users.rows[Math.floor(Math.random() * users.rowCount)];
            const match = matches.rows[Math.floor(Math.random() * matches.rowCount)];
            const stake = Math.floor(Math.random() * 5000) + 100;
            const odds = (Math.random() * 2 + 1.1).toFixed(2);
            const status = Math.random() > 0.3 ? 'settled' : 'pending';
            const result = status === 'settled' ? (Math.random() > 0.6 ? 'won' : 'lost') : null;
            const potential_win = result === 'won' ? (stake * parseFloat(odds)).toFixed(2) : 0;

            // Random date in the last 7 days
            const date = new Date();
            date.setDate(date.getDate() - Math.floor(Math.random() * 7));

            await client.query(
                `INSERT INTO site3_users.bets 
            (bet_id, user_id, match_id, stake, odds, potential_win, status, result, created_at, settled_at)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
                [`BET-${Date.now()}-${i}`, user.id, match.match_id, stake, odds, potential_win, status, result, date, status === 'settled' ? date : null]
            );
        }

        console.log('✅ 50 Real-time bets seeded successfully!');

    } catch (err) {
        console.error('Seed Error:', err);
    } finally {
        await client.end();
    }
}

seedRealReports();
