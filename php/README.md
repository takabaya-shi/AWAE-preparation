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
    - [スコープ定義(::)と$this](#%E3%82%B9%E3%82%B3%E3%83%BC%E3%83%97%E5%AE%9A%E7%BE%A9%E3%81%A8this)
- [fuelCMS](#fuelcms)
  - [install手順](#install%E6%89%8B%E9%A0%86)
  - [基本構成](#%E5%9F%BA%E6%9C%AC%E6%A7%8B%E6%88%90)
  - [login](#login)
  - [password reset](#password-reset)
  - [session](#session)
  - [file upload](#file-upload)
  - [MVC](#mvc)
  - [routing](#routing)
  - [sanitizing](#sanitizing)
  - [API](#api)
  - [CVEs](#cves)
    - [CVE-2020-17463](#cve-2020-17463)
    - [CVE-2019-15228](#cve-2019-15228)
    - [CVE-2018-20137](#cve-2018-20137)
    - [CVE-2018-16763](#cve-2018-16763)

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
### スコープ定義(::)と$this
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
## password reset
`pwd_reset`が`fuel/modules/fuel/controllers/Login.php`にある。  
`Reset.php`のそれっぽい。  
## session
`fuel/modules/fuel/helpers/session_helper.php`に`function session_set_userdata`とかがあるっぽい。  
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
