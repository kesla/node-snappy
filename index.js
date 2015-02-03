'use strict';
/*
 * Copyright (c) 2011 David Björklund
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
*/

var binding = require('bindings')('binding')

/**
 * Compress asyncronous.
 * If input isn't a string or buffer, automatically convert to buffer by using JSON.stringify.
 * 
 * @param {String|Buffer} input - data input
 * @param {Function} callback - callback
 */
function compress(input, callback) {

  if (typeof (input) !== 'string' && Buffer.isBuffer(input) === false) {
    return callback(new Error('Input must be a String or a Buffer'))
  }

  return binding.compress(input, callback)
}
module.exports.compress = compress
module.exports.pureCompress = binding.compress // avoid data check

/**
 * Asyncronous decide if a buffer is compressed in a correct way.
 * 
 * @param {Buffer} compressed - compressed data
 * @param {Function} callback - callback
 */
function isValidCompressed(compressed, callback) {

  if (Buffer.isBuffer(compressed) === false) {
    return callback(new Error('Input must be a Buffer'))
  }

  return binding.isValidCompressed(compressed, callback)
}
module.exports.isValidCompressed = isValidCompressed
module.exports.pureIsValidCompressed = binding.isValidCompressed // avoid data check

/**
 * Asyncronous uncompress previously compressed data.
 * A parser can be attached. If no parser is attached, return buffer.
 * 
 * @param {Buffer} compressed - compressed data
 * @param {Object} [opts] - output options
 * @param {Function} callback - callback
 */
function uncompress(compressed, opts, callback) {

  if (callback === undefined) {
    callback = opts
    opts = {
      asBuffer: true
    }
  } else if (typeof (opts.asBuffer) !== 'boolean') {
    opts.asBuffer = true
  }

  if (Buffer.isBuffer(compressed) === false) {
    return callback(new Error('Input must be a Buffer'))
  }

  return binding.uncompress(compressed, opts, callback)
}
module.exports.uncompress = uncompress
module.exports.pureUncompress = binding.uncompress // avoid data check
