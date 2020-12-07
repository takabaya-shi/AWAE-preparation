var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('cookie-session');
// config.jsファイルに書かれているconfigオブジェクトを作成
var config = require('./config');

// ./routes/index.jsにルーティングが書かれている
var routes = require('./routes/index');

var app = express();

app.set('views', path.join(__dirname, 'views'));
// JADEというテンプレートエンジンを使用
app.set('view engine', 'jade');

app.use(logger('dev'));
// パラメータの受け渡しをJSON形式にする
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/bower_components',  express.static( path.join(__dirname, '/bower_components')));

// session変数を使用する。req.session的な使いかた
app.use(session({
  // Cookie: session=eyJhZG1pbiI6Im5vIn0=; みたいな形でヘッダにセットされる
  name: 'session',
  // cofig.session_keysを使ってセッションの値をHMACで署名する。なのでただCookieを変えるだけではだめ
  keys: config.session_keys,
  // 多分HMAC署名を使うかどうか
  cookie: { secure: true }
  })
);

// set default session cookie to "admin=no"
app.use(function(req, res, next) {
  // リクエストのCookieヘッダがセットされてなければ
  if(req.session.admin === undefined) {
    // {"admin":"no"} をbase64エンコードしｈたeyJhZG1pbiI6Im5vIn0=がCookieに付与
    req.session.admin = 'no';
  }
  next();
});

app.use('/', routes);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;
