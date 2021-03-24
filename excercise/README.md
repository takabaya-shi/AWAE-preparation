<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->
**Table of Contents**

- [trouble1](#trouble1)
  - [file upload](#file-upload)
  - [SSTI](#ssti)

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


