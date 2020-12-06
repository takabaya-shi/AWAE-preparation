// expressモジュールを読み込む
const express = require('express');
const mysql = require('mysql');
// appを作るとこまでは定型文らしい
const app = express();

// cssとか画像ファイルを入れておくディレクトリpublicを指定する
app.use(express.static('public'));
app.use(express.urlencoded({extended: false}));

const connection = mysql.createConnection({
	  host: 'localhost',
	  user: 'progate',
	  password: 'password',
	  database: 'list_app'
});

// ルーティングを指定する。「"/"にGETが来たらtop.ejsを返す」
app.get('/', (req, res) => {
	  res.render('top.ejs');
});

app.get('/index', (req, res) => {
	  connection.query(
		      'SELECT * FROM items',
		      (error, results) => {
			            res.render('index.ejs', {items: results});
			          }
		    );
});

app.get('/new', (req, res) => {
	  res.render('new.ejs');
});

app.post('/create', (req, res) => {
	  connection.query(
		      'INSERT INTO items (name) VALUES (?)',
		      [req.body.itemName],
		      (error, results) => {
			            res.redirect('/index');
			          }
		    );
});

app.post('/delete/:id', (req, res) => {
	  connection.query(
		      'DELETE FROM items WHERE id = ?',
		      [req.params.id],
		      (error, results) => {
			            res.redirect('/index');
			          }
		    );
});

app.get('/edit/:id', (req, res) => {
	  connection.query(
		      'SELECT * FROM items WHERE id = ?',
		      [req.params.id],
		      (error, results) => {
			            res.render('edit.ejs', {item: results[0]});
			          }
		    );
});

app.post('/update/:id', (req, res) => {
	  connection.query(
		      'UPDATE items SET name = ? WHERE id = ?',
		      [req.body.itemName, req.params.id],
		      (error, results) => {
			            res.redirect('/index');
			          }
		    );
});

// 3000ポートでNodeJSを起動する
app.listen(3000);
