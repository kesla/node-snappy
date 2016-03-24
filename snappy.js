var binding = require('bindings')('binding');
var assert = require('assert');

/**
 * Compress asyncronous.
 * If input isn't a string or buffer, automatically convert to buffer by using
 * JSON.stringify.
 */
exports.compress = function (input, callback) {
  if (!(typeof (input) === 'string' || Buffer.isBuffer(input))) {
    return callback(new Error('input must be a String or a Buffer'));
  }

  binding.compress(input, callback);
};

exports.compressSync = function (input) {
  assert(typeof (input) === 'string' || Buffer.isBuffer(input), 'input must be a String or a Buffer');

  return binding.compressSync(input);
};

/**
 * Asyncronous decide if a buffer is compressed in a correct way.
 */
exports.isValidCompressed = binding.isValidCompressed;

exports.isValidCompressedSync = binding.isValidCompressedSync;

/**
 * Asyncronous uncompress previously compressed data.
 * A parser can be attached. If no parser is attached, return buffer.
 */
exports.uncompress = function (compressed, opts, callback) {
  if (!callback) {
    callback = opts;
  }

  if (!Buffer.isBuffer(compressed)) {
    return callback(new Error('input must be a Buffer'));
  }

  binding.uncompress(compressed, uncompressOpts(opts), callback);
};

exports.uncompressSync = function (compressed, opts) {
  assert(Buffer.isBuffer(compressed), 'input must be a Buffer');

  return binding.uncompressSync(compressed, uncompressOpts(opts));
};

function uncompressOpts (opts) {
  return (opts && typeof opts.asBuffer === 'boolean') ? opts : {asBuffer: true};
}
