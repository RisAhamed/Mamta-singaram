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
  ssl: {
    ca: caCert,
    rejectUnauthorized: true
  }
});

async function test() {
  try {
    await client.connect();
    console.log('Connected to CockroachDB successfully!');
    
    const res = await client.query('SELECT current_database(), current_user');
    console.log('Database:', res.rows[0].current_database);
    console.log('User:', res.rows[0].current_user);
    
    const tablesRes = await client.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name");
    console.log('\nTables:');
    tablesRes.rows.forEach(row => console.log('  -', row.table_name));
    
    await client.end();
    console.log('\nConnection closed.');
  } catch (err) {
    console.error('Connection failed:', err.message);
    if (err.detail) console.error('Detail:', err.detail);
    if (err.code) console.error('Error code:', err.code);
    process.exit(1);
  }
}

test();
