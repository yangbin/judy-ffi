var assert = require('assert');

var Judy = require('..');

var j = new Judy();

j.put('moo', 'moo');
j.put('cow', 42);
j.put('moocow', 42);
j.put('cow', 'cow');

assert.equal(j.get('moocow'), 42);
assert.equal(j.get('moo'),    'moo');
assert.equal(j.get('cow'),    'cow');
