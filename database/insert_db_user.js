const { Pool } = require('pg');

const pool = new Pool({
  user: 'superdb',
  host: 'localhost',
  database: 'studio-lite',
  password: 'jfsdssfdfmsdp9fsumdpfu3094umt394u3',
  port: 5432,
})

const sql = `
  CREATE EXTENSION IF NOT EXISTS pgcrypto;
  INSERT INTO public.user (name, password, is_admin)
      VALUES ('tobias', encode(digest('wedding', 'sha1'), 'hex'), 'True');`;

pool.query(sql, function(err, result){
  console.log(err, result);
  pool.end()
});
