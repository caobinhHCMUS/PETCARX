import sql from 'mssql';

const connStr = 'Server=127.0.0.1,1433;Database=master;User Id=sa;Password=123456789;Encrypt=false;TrustServerCertificate=true;';

async function test() {
    try {
        console.log('Testing connection with string...');
        let pool = await sql.connect(connStr);
        console.log('Success!');
        const result = await pool.request().query('SELECT DB_NAME() as db');
        console.log('Database:', result.recordset[0].db);
        await pool.close();
    } catch (err) {
        console.error('Error:', err);
    }
}

test();
