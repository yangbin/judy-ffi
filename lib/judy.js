var ref = require('ref');
var ffi = require('ffi');

module.exports = Judy;

var libjudy = ffi.Library('libjudy', {
	JudySLGet:   [ 'void **', [ 'void *',  'uint8 *', 'void *'] ],
	JudySLFirst: [ 'void **', [ 'void *',  'uint8 *', 'void *'] ],
	JudySLNext:  [ 'void **', [ 'void *',  'uint8 *', 'void *'] ],
	JudySLIns:   [ 'void **', [ 'void **', 'uint8 *', 'void *'] ],
	JudySLDel:   [ 'int',     [ 'void **', 'uint8 *', 'void *'] ]
});

var libc = ffi.Library('libc', {
	free:   [ 'void',   [ 'void *' ] ],
	malloc: [ 'void *', [ 'uint'   ] ]
});

function Judy() {
	this.judy = ref.alloc('void *', ref.NULL);
	this.ikey = new Buffer(2048); // shared iteration key
}

/**
 * Add a new element, or update existing element if the key already exists.
 *
 * @param {string} key
 * @param {*} value
 */
Judy.prototype.put = function(key, value) {
	var pValue = libjudy.JudySLIns(this.judy, CString(key), ref.NULL);

	if (pValue.isNull())
		throw 'Memory allocation failure';

	if (!pValue.deref().isNull())
		// Free previously allocated string
		libc.free(pValue.deref());

	// Store value in JSON format
	value = JSON.stringify(value);

	// Size must include termination null
	var size = Buffer.byteLength(value) + 1;

	// Allocate space outside of v8 heap
	var tmp = ref._reinterpret(libc.malloc(size), size, 0);

	// Store value as CString...
	ref.writeCString(tmp, 0, value);

	// ... indirectly
	ref.writePointer(pValue, 0, tmp);
}

/**
 * Get element by exact key matching
 * 
 * @param {string} key
 * @returns {?Object} value of matched element
 */
Judy.prototype.get = function(key) {
	var pValue = libjudy.JudySLGet(this.judy.deref(), CString(key), ref.NULL);

	if (pValue.isNull())
		return;

	// Dereference value and read as CString
	var value = pValue.deref().readCString();

	// Parse value
	value = JSON.parse(value);

	return value;
}

/**
 * Element handler of Judy array iteration.
 *
 * @callback JudyIterationCallback
 * @param {string} key - element key
 * @param {Number} value - element value
 * @returns {*} Any truthy value to indicate the termination of the iteration
 */

/**
 * Array iteration.
 *
 * @param {string} [prefix] - matching indices with this prefix, use '' to match everything
 * @param {string} [max] -  maximum (exclusive) key of iteration, defined in terms 
 * of string comparison. If provided, prefix is only used to find the first matching element.
 * If undefined, only elements matching prefix are iterated.
 * @param {JudyIterationCallback} cb - callback to handle the current element
 */
Judy.prototype.forEach = function() {
	if (arguments.length == 0 || typeof arguments[arguments.length-1] !== 'function') {
		throw new Error('Invalid arguments');
	}

	var prefix, max, cb;
	if (arguments.length == 1) {
		cb = arguments[0];
	} else if (arguments.length == 2) {
		prefix = arguments[0];
		cb = arguments[1];
	} else if (arguments.length == 3) {
		prefix = arguments[0];
		max = arguments[1];
		cb = arguments[2];
	} else {
		throw new Error('Unexpected number of arguments');
	}

	prefix = prefix || ''; // match all by default
	var key = this.ikey;
	ref.writeCString(key, 0, prefix);


	// it's important to use this.judy.deref() instead of a local cache in 
	// the following loop. the callback might perform put/delete to 
	// modify this.judy.

	var pv = libjudy.JudySLFirst(this.judy.deref(), key, ref.NULL);
	while (!pv.isNull()) {
		var k = ref.readCString(key,0);

		// if upper-bound unspecified, perform prefix matching on the key;
		// otherwise ensure key is less than upper-bound
		if (max === undefined) {
			if (k.slice(0, prefix.length) !== prefix)
				return;
		} else if (k >= max) {
			return;
		}

		if (cb(k, pv.deref().readCString()))
			return;

		pv = libjudy.JudySLNext(this.judy.deref(), key, ref.NULL);
	}
}

/**
 * Delete an element.
 *
 * @param {string} key
 * @returns {Number} 1 if success, 0 otherwise
 */
Judy.prototype.delete = function(key) {
	var ckey = CString(key);
	var pValue = libjudy.JudySLGet(this.judy.deref(), ckey, ref.NULL);

	if (pValue.isNull())
		return 0;

	// Free previously allocated string
	libc.free(pValue.deref());

	return libjudy.JudySLDel(this.judy, ckey, ref.NULL);
}

/*
 * Delete elements by key prefix matching
 *
 * @example
 * // delete everything
 * deleteAll()
 * @example
 * // delete all keys starting with 1
 * deleteAll('1')
 * @example
 * // delete all keys starting with 1, 2, 3
 * deleteAll('1', '4')
 *
 * @param {string} [prefix] - matching indices with this prefix, use '' to match everything
 * @param {string} [max] -  optional maximum (exclusive) key of iteration
 * @returns {Array} sorted array of the keys of deleted elements
 */
Judy.prototype.deleteAll = function(prefix, max) {
	var keys = [];
	var del = Judy.prototype.delete.bind(this);
	Judy.prototype.forEach.call(this, prefix, max, function(k, v) {
		keys.push(k);
		del(k);
	});
	return keys;
}

/**
 * Find elements by key prefix matching.
 *
 * @example
 * // find everything
 * find()
 * @example
 * // find all elements with keys starting with 1
 * find('1')
 * @example
 * // find all elements with keys starting with 1, 2, 3
 * find('1', '4')
 *
 * @param {string} [prefix] - matching indices with this prefix, use '' to match everything
 * @param {string} [max] -  optional maximum (exclusive) key of iteration
 * @returns {Array} array of all matched elements sorted on key
 */
Judy.prototype.find = function(prefix, max) {
	var result = [];
	Judy.prototype.forEach.call(this, prefix, max, function(k, v) {
		var e = {};
		e[k] = v;
		result.push(e);
	});
	return result;
}

/**
 * Get size of array
 *
 * @returns {Number} size
 */
Judy.prototype.size = function() {
	var len = 0;
	Judy.prototype.forEach.call(this, '', function(k, v) {
		len++;
	});
	return len;
}

function CString(str) { return ref.allocCString(str) };
