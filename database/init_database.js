const { Pool } = require('pg');
const fs = require('fs');

const pool = new Pool({
  user: 'superdb',
  host: 'localhost',
  database: 'studio-lite',
  password: 'jfsdssfdfmsdp9fsumdpfu3094umt394u3',
  port: 5432,
})

const sql = fs.readFileSync('init_database.sql').toString();
pool.query(sql, function(err, result){
  console.log(err, result);
  pool.end()
});
