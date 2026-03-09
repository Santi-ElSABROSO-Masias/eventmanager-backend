const { Client } = require('pg');

async function testConnection(url, name) {
    const client = new Client({ connectionString: url });
    try {
        await client.connect();
        console.log(`[SUCCESS] Connected to ${name}`);
        await client.end();
    } catch (err) {
        console.error(`[FAILED] ${name}:`, err.message);
    }
}

async function main() {
    const url1 = "postgresql://postgres:hscz%2BQHvZaAE32X@db.vfppnhhmimzvxmowysda.supabase.co:5432/postgres";
    const url2 = "postgresql://postgres.vfppnhhmimzvxmowysda:hscz%2BQHvZaAE32X@aws-0-us-west-2.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1";

    await testConnection(url1, "Direct IPv6 Setup (Encoded PW)");
    await testConnection(url2, "Pooler IPv4 Setup");
}

main();
