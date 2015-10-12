Judy Arrays for Node.js
=======================

[Judy Arrays](http://judy.sourceforge.net/downloads/10minutes.htm)
are fast, memory efficient, ordered associative arrays.

Example
-------

``` js
var Judy = require('judy-ffi');

var j = new Judy();

j.put('cow', 'moo');

console.log('A cow goes', j.get('cow')); // A cow goes moo
```

Requirements
------------

  * libjudy
	  * Debian-based: `apt-get install libjudy`
	  * OSX: `brew install judy`

API
---

  * <a href="#judy">`Judy()`</a>
  * <a href="#judyputkey-value">`Judy#put()`</a>
  * <a href="#judygetkey">`Judy#get()`</a>

---
### Judy()
`new Judy()` returns a new Judy Array instance.

---
### Judy#put(key, value)
`put()` to store new entries or overwrite existing entries in Judy array.

---
### Judy#get(key)
`get()` to retrieve entries from Judy array.
