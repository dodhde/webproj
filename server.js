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


app.get('/posts', async (req, res) => {
  let connection;
  try {
      connection = await pool.getConnection();
      const rows = await connection.query('SELECT * FROM writesub ORDER BY regdate DESC');
      res.json(rows);
  } catch (err) {
      console.error(err);
      res.status(500).send('서버 오류');
  } finally {
      if (connection) connection.end();
  }
});

// 글 조회
app.get('/posts/view/:id', async (req, res) => {
  const postId = req.params.id;
  let connection;
  try {
      connection = await pool.getConnection();
      const row = await connection.query('SELECT * FROM writesub WHERE id = ?', [postId]);
      if (row.length > 0) {
          res.render('post', { post: row[0] });
      } else {
          res.status(404).send('글을 찾을 수 없습니다.');
      }
  } catch (err) {
      console.error(err);
      res.status(500).send('서버 오류');
  } finally {
      if (connection) connection.end();
  }
});

// 글 삭제
app.post('/posts/delete/:id', async (req, res) => {
  const postId = req.params.id;
  const inputPassword = req.body.password;
  let connection;
  try {
      connection = await pool.getConnection();
      const row = await connection.query('SELECT password FROM writesub WHERE id = ?', [postId]);
      if (row.length > 0 && row[0].password === inputPassword) {
          await connection.query('DELETE FROM writesub WHERE id = ?', [postId]);
          res.redirect('/');
      } else {
          res.status(401).send('비밀번호 틀림!');
      }
  } catch (err) {
      console.error(err);
      res.status(500).send('Internal Server Error');
  } finally {
      if (connection) connection.end();
  }
});




app.get('/write', function(req, res){
    res.render('write.ejs')    
})
app.get('/temp', function(req, res){
  res.render('temp.ejs')    
})

app.post('/writesub', async (req, res) => {
  const { name, password, ingredients, title, content, category } = req.body;

  const sql = `INSERT INTO writesub (name, password, ingredients, title, content, category, regdate) VALUES (?, ?, ?, ?, ?, ?, NOW())`;
  let conn;
  try {
    conn = await pool.getConnection();
    await conn.query(sql, [name, password, ingredients, title, content, category]);
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
