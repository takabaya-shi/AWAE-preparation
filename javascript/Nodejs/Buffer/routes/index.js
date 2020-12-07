var express = require('express');
var config = require('../config');
var router = express.Router();

router.get('/', function(req, res, next) {
    // index.jadeにtitle,adminという変数を使えるように渡す
    res.render('index', { title: 'index', admin: req.session.admin });
});

router.get('/admin', function(req, res, next) {
    res.render('admin', { title: 'Admin area', admin: req.session.admin, flag: config.secret_password });
});

router.get('/logout', function(req, res, next) {
    req.session = null;
    res.json({'status': 'ok'});
});

router.post('/login', function(req, res, next) {
    // 何らかのpasswordが送信されたかどうか
    if(req.body.password !== undefined) {
        // ここが脆弱！！！
        // passwordというローカル変数にreq.body.passwordを保存する。このとき型チェックしていない
        var password = new Buffer(req.body.password);
        // passwordの文字列をbase64エンコードしたものと比較
        if(password.toString('base64') == config.secret_password) {
            req.session.admin = 'yes';
            res.json({'status': 'ok' });
        } else {
            // toStringメソッドでpassword変数の中身を返す
            res.json({'status': 'error', 'error': 'password wrong: '+password.toString() });
        }
    } else {
        res.json({'status': 'error', 'error': 'password missing' });
    }
});

module.exports = router;
