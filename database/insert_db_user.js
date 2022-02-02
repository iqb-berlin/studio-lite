const { Pool } = require('pg');
const bcrypt = require('bcrypt');

const pool = new Pool({
  user: 'superdb',
  host: 'localhost',
  database: 'studio-lite',
  password: 'jfsdssfdfmsdp9fsumdpfu3094umt394u3',
  port: 5432,
})

const name = 'rondo';
const password = 'veniziano';
const passwordEncrypted = bcrypt.hashSync(password, 11);
const valuesString = "'" + name + "', '" + passwordEncrypted + "', 'True'";
const sql = 'INSERT INTO public.user (name, password, is_admin) VALUES (' + valuesString + ');';

pool.query(sql, function(err, result){
  console.log(err, result);
  pool.end()
});
