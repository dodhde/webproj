const express = require('express');
const ejs = require('ejs');
const app = express();
const port = 8002;
const bodyParser = require('body-parser');
const mariadb = require('mariadb');

require('dotenv').config();

const pool = mariadb.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

app.set('view engine', 'ejs')
app.set('views', './views')
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());



app.get('/', async (req, res) => {
  let conn;
  try {
    conn = await pool.getConnection();
    const rows = await conn.query('SELECT * FROM writesub');
    res.render('index', { posts: rows });
  } catch (err) {
    console.error('Error: ' + err.stack);
    res.status(500).send('Error');
  } finally {
    if (conn) conn.release();
  }
});

app.get('/write', function(req, res){
    res.render('write.ejs')    
})

app.post('/writesub', async (req, res) => {
  const { name, password, ingredients, title, content } = req.body;

  const sql = `INSERT INTO writesub (name, password, ingredients, title, content, regdate) VALUES (?, ?, ?, ?, ?, NOW())`;
  let conn;
  try {
    conn = await pool.getConnection();
    await conn.query(sql, [name, password, ingredients, title, content]);
    console.log('글 등록', new Date().toLocaleString());
    res.send("<script>alert('글이 등록되었습니다'); location.href='/'</script>");
  } catch (err) {
    console.error('Error: ' + err.stack);
    res.status(500).send('Error');
  } finally {
    if (conn) conn.release();
  }
});

app.listen(port, '0.0.0.0', () => {
    console.log(`Server running at http://0.0.0.0:${port}/`);
});
