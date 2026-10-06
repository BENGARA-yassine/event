import pg from 'pg';

const { Pool } = pg;
const db = new Pool({ connectionString: process.env.DATABASE_URL });
db.on('error', (error) => console.error('Unexpected PostgreSQL error:', error));

export default db;
