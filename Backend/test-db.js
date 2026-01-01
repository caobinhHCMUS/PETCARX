import sql from 'mssql';
import dotenv from 'dotenv';
dotenv.config();

const config = {
    user: 'sa',
    password: '123456789',
    server: '127.0.0.1',
    database: 'PETCARX',
    options: {
        encrypt: false,
        trustServerCertificate: true
    }
};

async function test() {
    try {
        console.log('Testing connection with config:', { ...config, password: '***' });
        let pool = await sql.connect(config);
        console.log('Success!');
        await pool.close();
    } catch (err) {
        console.error('Error:', err);
    }
}

test();
