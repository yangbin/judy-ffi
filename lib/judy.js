var ref = require('ref');
var ffi = require('ffi');

module.exports = Judy;

var libjudy = ffi.Library('libjudy', {
	JudySLGet: [ 'void **', [ 'void *',  'uint8 *', 'void *'] ],
	JudySLIns: [ 'void **', [ 'void **', 'uint8 *', 'void *'] ]
});

var libc = ffi.Library('libc', {
	free:   [ 'void',   [ 'void *' ] ],
	malloc: [ 'void *', [ 'uint'   ] ]
});

function Judy() {
	this.judy = ref.alloc('void *', ref.NULL);
}

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

function CString(str) { return ref.allocCString(str) };
