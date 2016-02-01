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

j.put('bird', 'coo');

j.size();			// 2

j.find();			// [ {'bird': 'coo'}, {'cow': 'moo'} ]
j.find('b');		// [ {'bird': 'coo'} ]
j.find('c');		// [ {'cow': 'moo'} ]
j.find('b', 'c');	// [ {'bird': 'coo'} ]

j.forEach(function(k,v) {
	console.log('A %s goes %s', k, v);
});
// A bird goes coo
// A cow goes moo

j.delete_all('c');	// [ 'cow' ]
j.find();			// [ {'bird': 'coo'} ]

j.delete_all();		// [ 'bird' ]
j.find();			// []
```

Requirements
------------

  * libjudy
	  * Debian-based: `apt-get install libjudy`
	  * OSX: `brew install judy`

API
---

  * <a href="#judy">`Judy()`</a>
  * <a href="#judysize">`Judy#size()`</a>
  * <a href="#judyputkey-value">`Judy#put()`</a>
  * <a href="#judygetkey">`Judy#get()`</a>
  * <a href="#judydeletekey">`Judy#delete()`</a>
  * <a href="#judydeleteallprefix-maxkey">`Judy#delete_all()`</a>
  * <a href="#judyfindprefix-maxkey">`Judy#find()`</a>
  * <a href="#judyforeachprefix-maxkey-cb">`Judy#forEach()`</a>

---
### Judy()
`new Judy()` returns a new Judy Array instance.

---
### Judy#size()
`size()` to get number of entries.

---
### Judy#put(key, value)
`put()` to store new entries or overwrite existing entries in Judy array.

---
### Judy#get(key)
`get()` to retrieve entries from Judy array.

---
### Judy#delete(key)
`delete()` to delete an entry from Judy array.

---
### Judy#delete_all(prefix, maxKey)
`delete_all()` to delete all keys starting with `prefix` and less than `maxKey`

---
### Judy#find(prefix, maxKey)
`find()` to search for all entries with keys starting with `prefix` and less than `maxKey`

---
### Judy#forEach(prefix, maxKey, cb)
`forEach()` to iterate through entries with keys starting with `prefix` and less than `maxKey`. The callback is invoked with the key and value of each matched entry.
