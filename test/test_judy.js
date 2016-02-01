var assert = require('assert');

var Judy = require('..');

// test get/put
(function() {
	var j = new Judy();

	j.put('moo', 'moo');
	j.put('cow', 42);
	j.put('moocow', 42);
	j.put('cow', 'cow');

	assert.equal(j.get('moocow'), 42);
	assert.equal(j.get('moo'),    'moo');
	assert.equal(j.get('cow'),    'cow');
	assert.strictEqual(j.get('blank'), undefined);
})();

// test find
(function() {
	var j = new Judy();
	for (var i = 0; i < 5; i++) {
		j.put(i+'', i);
	}
	j.put('40', 40);
	// no-arg matches all
	assert.deepEqual(j.find(), [{'0':'0'},{'1':'1'},{'2':'2'},{'3':'3'},{'4':'4'}, {'40':'40'}]);
	// empty prefix also matches all
	assert.deepEqual(j.find(''), [{'0':'0'},{'1':'1'},{'2':'2'},{'3':'3'},{'4':'4'}, {'40':'40'}]);
	// single match
	assert.deepEqual(j.find('0'), [{'0':'0'}]);
	// multiple matches
	assert.deepEqual(j.find('4'), [{'4':'4'}, {'40':'40'}]);
	// range
	assert.deepEqual(j.find('1','3'), [{'1':'1'},{'2':'2'}]);
})();

// test delete
(function() {
	var j = new Judy();
	for (var i = 0; i < 5; i++) {
		j.put(i+'', i);
	}
	// delete invalid key
	assert.equal(j.delete('5'), 0);
	assert.deepEqual(j.find(), [{'0':'0'},{'1':'1'},{'2':'2'},{'3':'3'},{'4':'4'}]);

	// delete middle
	assert.equal(j.delete('1'), 1);
	assert.deepEqual(j.find(), [{'0':'0'},{'2':'2'},{'3':'3'},{'4':'4'}]);

	// delete front
	assert.equal(j.delete('0'), 1);
	assert.deepEqual(j.find(), [{'2':'2'},{'3':'3'},{'4':'4'}]);

	// delete end
	assert.equal(j.delete('4'), 1);
	assert.deepEqual(j.find(), [{'2':'2'},{'3':'3'}]);
})();

// test delete_all
(function() {
	var j = new Judy();
	for (var i = 0; i < 5; i++) {
		j.put(i+'', i);
	}
	j.put('40', 40);
	// delete invaild index
	assert.deepEqual(j.delete_all('5'), []);
	assert.deepEqual(j.find(), [{'0':'0'},{'1':'1'},{'2':'2'},{'3':'3'},{'4':'4'}, {'40':'40'}]);

	// delete range
	assert.deepEqual(j.delete_all('1','3'), ['1','2']);
	assert.deepEqual(j.find(), [{'0':'0'},{'3':'3'},{'4':'4'}, {'40':'40'}]);

	// delete multiple matches
	assert.deepEqual(j.delete_all('4'), ['4','40']);
	assert.deepEqual(j.find(), [{'0':'0'},{'3':'3'}]);

	// no-arg deletes everything
	assert.deepEqual(j.delete_all(), ['0','3']);
	assert.deepEqual(j.find(), []);
})();

// test forEach
(function() {
	var j = new Judy();
	for (var i = 0; i < 5; i++) {
		j.put(i+'', i);
	}
	j.put('40', 40);

	var elems = [];
	// callback to collect iterated item into elems
	var cb = (function(k,v) {
		var e = {};
		e[k] = v;
		this.push(e);
	}).bind(elems);

	// no-arg iterates all
	elems.length = 0;
	j.forEach(cb);
	assert.deepEqual(elems, [{'0':'0'},{'1':'1'},{'2':'2'},{'3':'3'},{'4':'4'}, {'40':'40'}]);

	// empty prefix also iterates all
	elems.length = 0;
	j.forEach('', cb);
	assert.deepEqual(elems, [{'0':'0'},{'1':'1'},{'2':'2'},{'3':'3'},{'4':'4'}, {'40':'40'}]);

	// single match
	elems.length = 0;
	j.forEach('1', cb);
	assert.deepEqual(elems, [{'1':'1'}]);

	// multiple matches
	elems.length = 0;
	j.forEach('4', cb);
	assert.deepEqual(elems, [{'4':'4'}, {'40':'40'}]);

	// range
	elems.length = 0;
	j.forEach('1', '4', cb);
	assert.deepEqual(elems, [{'1':'1'},{'2':'2'},{'3':'3'}]);
})();


