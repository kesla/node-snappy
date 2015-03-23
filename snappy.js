
var binding = require('bindings')('binding');

/**
 * Compress asyncronous.
 * If input isn't a string or buffer, automatically convert to buffer by using
 * JSON.stringify.
 */
exports.compress = function(input, callback) {
  if (!(typeof (input) === 'string' || Buffer.isBuffer(input)))
    return callback(new Error('input must be a String or a Buffer'))

  binding.compress(input, callback);
};



/**
 * Asyncronous decide if a buffer is compressed in a correct way.
 */
exports.isValidCompressed = binding.isValidCompressed;

/**
 * Asyncronous uncompress previously compressed data.
 * A parser can be attached. If no parser is attached, return buffer.
 */
exports.uncompress = function(compressed, opts, callback) {
  if (!Buffer.isBuffer(compressed))
    return callback(new Error('input must be a Buffer'))

  if (!callback) {
    callback = opts
    opts = {}
  }

  if (typeof(opts.asBuffer) !== 'boolean')
    opts.asBuffer = true

  binding.uncompress(compressed, opts, callback)
}
