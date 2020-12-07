# AWAE-preparation
# Vuln
aa
# test
## Information leak
### new Buffer(100); (Node.js)
- 概要   
Node.jsで以下のように`new Buffer(req.body.text)`でバッファを作成した場合、`req.body.text`の型がString型でない場合、Bufferはnewで使用される前に初期化されないので、サーバーのメモリを返す脆弱性。   
- 例   
```js
> console.log(new Buffer('aaaa'));
<Buffer 61 61 61 61>
undefined
> console.log(new Buffer(100));
<Buffer 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 ... 50 more bytes>
undefined
>
```
つまり、ログイン処理で以下のようになっており、POST形式にはJSONが使われている場合、リクエストを細工することでメモリをリークできる。   
```js
        var password = new Buffer(req.body.password);
        if(password.toString('base64') == config.secret_password) {
            req.session.admin = 'yes';
            res.json({'status': 'ok' });
        } else {
            res.json({'status': 'error', 'error': 'password wrong: '+password.toString() });
            
// POSTするデータ
// {"password":"test"} // 文字列"test"を送信。通常
// {"password":100}    // 数値100を送信。Buffer(100)が.toString()によってリークされる
```
- 発見方法   
`new Buffer();`が書かれている箇所を探す。   
- 対策   
`new Bufffer()`は危険なのでBufferの代わりに、Buffer.fromとBuffer.allocとBuffer.allocUnsafeが追加された。   
Buffer.allocUnsafeは初期化されないが、それ以外は初期化されるっぽい。   
- 参考資料   
https://techblog.yahoo.co.jp/advent-calendar-2016/node_new_buffer/   
概要   
https://www.smrrd.de/nodejs-hacking-challenge-writeup.html   
Writeup   
# メモ
とにかくコードを読みなれている必要があるらしい。それが一番大事っぽい。それが今全然できないしHTBやっててもそれは伸びない気がする。   
まずはudemyとかpentesterAcademyのPHP,NodeJS,.net,JavaのWebアプリ開発コースを受講する必要がありそう。   
あとは脆弱性ごとにそれに該当するコード群と発見方法、着眼点とかを自分なりにまとめる必要がありそう。CVEとかも参考にした方がよさそう。   
受講は2月の春休み開始直後から1カ月でとりたい！それまでにいろいろ計画的に勉強するべし！

# 参考資料
https://alex-labs.com/my-awae-review-becoming-an-oswe/   
ホワイトボックスの方法論的なことが書いてある。超参考になりそう。   
   
https://stacktrac3.co/oswe-review-awae-course/   
こっちにも方法論的なことが書いてある。   
