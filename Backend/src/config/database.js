import sql from 'mssql';
import dotenv from 'dotenv';

dotenv.config();

const server = process.env.DB_SERVER || '127.0.0.1';
const database = process.env.DB_DATABASE || 'PetCareX1';
const user = process.env.DB_USER || 'sa';
const password = process.env.DB_PASSWORD || '123456';
const port = process.env.DB_PORT || '1433';

const connectionString = `Server=${server},${port};Database=${database};User Id=${user};Password=${password};Encrypt=false;TrustServerCertificate=true;`;

let pool;

export async function connectDB() {
    try {
        if (pool && pool.connected) {
            return pool;
        }

        console.log(`Attempting to connect to ${database} on ${server}...`);
        // Explicitly create a new pool to avoid shared state issues
        pool = new sql.ConnectionPool(connectionString);
        await pool.connect();

        console.log('✅ Connected to SQL Server database:', database);
        return pool;
    } catch (err) {
        console.error('❌ Database connection failed:');
        console.error('Message:', err.message);
        throw err;
    }
}

export function getPool() {
    if (!pool || !pool.connected) {
        throw new Error('Database not connected. Call connectDB() first.');
    }
    return pool;
}

export { sql };
