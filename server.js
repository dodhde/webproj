const express = require('express');
const ejs = require('ejs');
const app = express();
const port = 8002;
const bodyParser = require('body-parser');
const mariadb = require('mariadb/callback');

require('dotenv').config();

const connection = mariadb.createConnection({
  host     : process.env.DB_HOST,
  port     : process.env.DB_PORT,
  user     : process.env.DB_USERNAME,
  password : process.env.DB_PASSWORD,
  database : process.env.DB_NAME,
})



app.set('view engine', 'ejs')
app.set('views', './views')
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());



app.get('/', (req, res) => {
    const sql = 'SELECT * FROM writesub';
    connection.query(sql, (err, results) => {
        if (err) {
            console.error('Error: ' + err.stack);
            return res.status(500).send('Error');
        }
        res.render('index', { posts: results });
    });
});

app.get('/write', function(req, res){
    res.render('write.ejs')    
})
app.get('/login', function(req, res){
    res.render('login.ejs')    
})


app.post('/writesub', (req, res) => {
    const name = req.body.name;
    const password = req.body.password;
    const ingredients = req.body.ingredients;
    const title = req.body.title;
    const content = req.body.content; 

    var sql = `insert into writesub(name,password,ingredients,title,content,regdate) values('${name}', '${password}', '${ingredients}', '${title}', '${content}', now());`

    connection.query(sql, function(err, result){
        if(err) throw err;
        console.log('글 등록', new Date().toLocaleString());
        res.send("<script>alert('글이 등록되었습니다'); location.href='/'</script>");
        // res.render('index.ejs')
    })
})


app.listen(port, '0.0.0.0', () => {
    console.log(`Server running at http://0.0.0.0:${port}/`);
});