const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

const certPath = path.join(process.env.APPDATA, 'postgresql', 'root.crt');
const caCert = fs.readFileSync(certPath);

const client = new Client({
  host: 'mamta-singaram-33381.j77.aws-ap-south-1.cockroachlabs.cloud',
  port: 26257,
  database: 'defaultdb',
  user: 'riswan',
  password: process.env.COCKROACH_DB_PASSWORD || 'sPsrGxcwQYsFvWTJmrsj1Q',
  ssl: { ca: caCert, rejectUnauthorized: true }
});

async function explore() {
  try {
    await client.connect();
    console.log('=== Connected to CockroachDB ===\n');
    
    const tables = ['patients', 'doctors', 'sessions', 'session_doctors', 'dental_chart_entries', 'session_files', 'consultation_forms'];
    
    for (const table of tables) {
      // Check if table exists
      const existsRes = await client.query(
        "SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = $1)", [table]
      );
      
      if (existsRes.rows[0].exists === false) {
        console.log(`\nTable '${table}': DOES NOT EXIST`);
        continue;
      }
      
      console.log(`\n=== Table: ${table} ===`);
      
      // Get columns
      const colsRes = await client.query(`
        SELECT column_name, data_type, is_nullable, column_default
        FROM information_schema.columns
        WHERE table_name = $1
        ORDER BY ordinal_position
      `, [table]);
      
      console.log('\nColumns:');
      colsRes.rows.forEach(col => {
        console.log(`  ${col.column_name} | ${col.data_type} | nullable=${col.is_nullable} | default=${col.column_default || 'none'}`);
      });
      
      // Get constraints
      const consRes = await client.query(`
        SELECT tc.constraint_type, kcu.column_name
        FROM information_schema.table_constraints tc
        JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name
        WHERE tc.table_name = $1
      `, [table]);
      
      if (consRes.rows.length > 0) {
        console.log('\nConstraints:');
        const grouped = {};
        consRes.rows.forEach(row => {
          if (!grouped[row.column_name]) grouped[row.column_name] = [];
          grouped[row.column_name].push(row.constraint_type);
        });
        Object.entries(grouped).forEach(([col, types]) => {
          console.log(`  ${col}: ${types.join(', ')}`);
        });
      }
      
      // Get row count
      const countRes = await client.query(`SELECT count(*) as cnt FROM ${table}`);
      console.log(`\nRow count: ${countRes.rows[0].cnt}`);
      
      // Get sample row
      const sampleRes = await client.query(`SELECT * FROM ${table} LIMIT 1`);
      if (sampleRes.rows.length > 0) {
        console.log('\nSample row:');
        console.log(JSON.stringify(sampleRes.rows[0], null, 2).split('\n').map(l => '  ' + l).join('\n'));
      }
    }
    
    await client.end();
    console.log('\n\nDone.');
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
}

explore();
