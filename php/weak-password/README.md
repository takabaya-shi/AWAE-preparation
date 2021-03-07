<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->
**Table of Contents**

- [概要](#%E6%A6%82%E8%A6%81)
- [参考](#%E5%8F%82%E8%80%83)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

# 概要
以下のように`mt_srand`,`mt_rand`,`rand`,`srand`を使って作成したランダムな値は弱いのでtokenとかには入れない方がいい。  
値は同じPHPのバージョンなら同一になる。バージョンによって値は変わることがある。  
暗号的に大丈夫な`random_int()`,`random_bytes()`,`openssl_random_pseudo_bytes()`を使う必要がある。  
```txt
var_dump(mt_srand(1234));
var_dump(mt_rand());
var_dump(mt_rand());

var_dump(mt_srand(1234));
var_dump(mt_rand());
var_dump(mt_rand());

// output
NULL
int(411284887)
int(1068724585)
NULL
int(411284887)
int(1068724585)
```
また、PHP 7.1から`rand()`/`srand()`が`mt_rand()`/`mt_srand()`のエイリアスになっている。  
```txt
var_dump(mt_srand(1234));
var_dump(mt_rand());
var_dump(mt_rand());

var_dump(mt_srand(1234));
var_dump(mt_rand());
var_dump(mt_rand());

var_dump(srand(1234));
var_dump(rand());
var_dump(rand());

//output
NULL
int(411284887)
int(1068724585)
NULL
int(411284887)
int(1068724585)
NULL
int(411284887)
int(1068724585)
```
`rand`,`mt_rand`は`rand(0,10)`とすると`0~10`の値をランダムに返すようになる。  
以下はPHP7.1以降の実行結果  
```txt
var_dump(srand(1234));
var_dump(rand(0,10000000000));
var_dump(rand());

var_dump(mt_srand(1234));
var_dump(mt_rand(0,10000000000));
var_dump(mt_rand());


//output
NULL
int(4087236543)
int(1335968403)
NULL
int(4087236543)
int(1335968403)
```
# 参考
https://www.php.net/manual/ja/function.mt-rand.php  
https://blog.ohgaki.net/php-mt_rand-and-rand-issues  
https://blog.tokumaru.org/2019/07/donot-use-passowrdhash-for-csrf-token.html  
