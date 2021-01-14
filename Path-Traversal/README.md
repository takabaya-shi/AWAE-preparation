<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->
**Table of Contents**

- [writeup](#writeup)
  - [bypass filter "." with "%E3%80%82" (hackerone)](#bypass-filter--with--hackerone)
  - [](#)
  - [](#-1)
  - [](#-2)
  - [](#-3)
  - [](#-4)
  - [](#-5)
- [メモ](#%E3%83%A1%E3%83%A2)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

# writeup
## bypass filter "." with "%E3%80%82" (hackerone)
https://hackerone.com/reports/291750  
- **entrypoint**  
`.`は`%E3%80%82`として`。`のURLエンコードでバイパスできるかもらしい。  
`hxxxs://steamcommunity.com/linkfilter/?url=pornhub.com`はLinkがBlockされるけど、`hxxxs://steamcommunity.com/linkfilter/?url=pornhub%E3%80%82com`で
バイパスできる！  
- **payload**  
`hxxxs://steamcommunity.com/linkfilter/?url=pornhub%E3%80%82com`  
## 
- **entrypoint**  
- **payload**  
## 
- **entrypoint**  
- **payload**  
## 
- **entrypoint**  
- **payload**  
## 
- **entrypoint**  
- **payload**  
## 
- **entrypoint**  
- **payload**  
## 
- **entrypoint**  
- **payload**  

# メモ
https://www.hamayanhamayan.com/entry/2020/08/30/110845  
