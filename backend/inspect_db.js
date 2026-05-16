const { Client } = require('pg');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();

const connectionString = process.env.DATABASE_URL;

async function inspect() {
    if (!connectionString) {
        console.error('DATABASE_URL is not defined in .env');
        return;
    }

    const client = new Client({
        connectionString,
        ssl: {
            rejectUnauthorized: false
        }
    });

    try {
        await client.connect();
        console.log('Successfully connected to Supabase PostgreSQL');

        // 1. Get all public tables
        const tablesRes = await client.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_type = 'BASE TABLE'
            AND table_name NOT LIKE 'pg_%'
            AND table_name NOT LIKE 'sql_%';
        `);

        const tables = tablesRes.rows.map(row => row.table_name);
        console.log('\n--- Public Tables ---');
        console.log(tables.length > 0 ? tables.join(', ') : 'No tables found.');

        for (const table of tables) {
            console.log(`\n--- Table: ${table} ---`);
            
            // Get columns
            const columnsRes = await client.query(`
                SELECT column_name, data_type 
                FROM information_schema.columns 
                WHERE table_name = $1 
                AND table_schema = 'public';
            `, [table]);
            console.log('Columns:', columnsRes.rows.map(c => `${c.column_name} (${c.data_type})`).join(', '));

            // Get count
            const countRes = await client.query(`SELECT COUNT(*) FROM "${table}"`);
            console.log(`Row count: ${countRes.rows[0].count}`);

            // Get sample data (3 rows)
            const dataRes = await client.query(`SELECT * FROM "${table}" LIMIT 3`);
            if (dataRes.rows.length > 0) {
                console.table(dataRes.rows);
            } else {
                console.log('No data found in this table.');
            }
        }

    } catch (err) {
        console.error('Error connecting or querying:', err);
    } finally {
        await client.end();
    }
}

inspect();
