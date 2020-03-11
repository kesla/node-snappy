// @ts-check
var binding = require('bindings')('binding');
var assert = require('assert');

/**
 * @typedef {{ asBuffer: boolean; }|any} UncompressOptsType
 */

/**
 * Compress asyncronous.
 * If input isn't a string or buffer, automatically convert to buffer by using
 * JSON.stringify.
 * @param {string|Buffer} input
 * @param {(err: Error|null, buffer?: Buffer) => void} callback
 */
exports.compress = function (input, callback) {
  if (!(typeof (input) === 'string' || Buffer.isBuffer(input))) {
    return callback(new Error('input must be a String or a Buffer'));
  }

  binding.compress(input, callback);
};

/**
 * @param {string|Buffer} input
 * @returns {Buffer}
 */
exports.compressSync = function (input) {
  assert(typeof (input) === 'string' || Buffer.isBuffer(input), 'input must be a String or a Buffer');

  return binding.compressSync(input);
};

/**
 * Asyncronous decide if a buffer is compressed in a correct way.
 * 
 * @param {Buffer} input
 * @param {(err: Error|null, isValid?: boolean) => void}
 */
exports.isValidCompressed = binding.isValidCompressed;

/**
 * @param {Buffer} input
 * @return {boolean}
 */
exports.isValidCompressedSync = binding.isValidCompressedSync;

/**
 * Asyncronous uncompress previously compressed data.
 * 
 * @param {Buffer} compressed
 * @param {UncompressOptsType} opts
 * @param {(err: Error, uncompressed?:(string|Buffer)) => void} callback
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

/**
 * @param {Buffer} compressed
 * @param {UncompressOptsType} opts
 * @return {string|Buffer}
 */exports.uncompressSync =  function (compressed, opts) {
  assert(Buffer.isBuffer(compressed), 'input must be a Buffer');

  return binding.uncompressSync(compressed, uncompressOpts(opts));
};

/**
 * @param {UncompressOptsType} opts
 */
function uncompressOpts (opts) {
  return (opts && typeof opts.asBuffer === 'boolean') ? opts : {asBuffer: true};
}
