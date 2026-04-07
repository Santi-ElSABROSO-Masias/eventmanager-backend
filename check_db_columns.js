const { Client } = require('pg');
require('dotenv').config();

async function checkColumns() {
    const client = new Client({ connectionString: process.env.DIRECT_URL || process.env.DATABASE_URL });
    try {
        await client.connect();
        const res = await client.query(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'system_notifications'
            ORDER BY column_name;
        `);
        console.log(JSON.stringify(res.rows, null, 2));
        await client.end();
    } catch (err) {
        console.error('Error checking columns:', err.message);
        process.exit(1);
    }
}

checkColumns();
