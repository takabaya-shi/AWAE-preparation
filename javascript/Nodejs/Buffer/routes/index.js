var express = require('express');
var config = require('../config');
var router = express.Router();

router.get('/', function(req, res, next) {
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
    if(req.body.password !== undefined) {
        var password = new Buffer(req.body.password);
        if(password.toString('base64') == config.secret_password) {
            req.session.admin = 'yes';
            res.json({'status': 'ok' });
        } else {
            res.json({'status': 'error', 'error': 'password wrong: '+password.toString() });
        }
    } else {
        res.json({'status': 'error', 'error': 'password missing' });
    }
});

module.exports = router;