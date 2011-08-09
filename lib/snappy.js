/*
  Copyright (c) 2011 David Björklund

  Permission is hereby granted, free of charge, to any person obtaining a copy
  of this software and associated documentation files (the "Software"), to deal
  in the Software without restriction, including without limitation the rights
  to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
  copies of the Software, and to permit persons to whom the Software is
  furnished to do so, subject to the following conditions:

  The above copyright notice and this permission notice shall be included in
  all copies or substantial portions of the Software.

  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
  OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
  THE SOFTWARE.
*/

/*
 * The c++-module.
 */
var binding = require('../build/default/binding');

/*
 * Parsers, used to parse a buffer when decompressing.
 */
var parsers = exports.parsers = {
  json: function(buffer) {
    return JSON.parse(buffer);
  },
  string: function(buffer) {
    return buffer.toString("utf8");
  },
  raw: function(buffer) {
    return buffer;
  }
};

/**
 * Compress asyncronous.
 * If input isn't a string or buffer, automatically convert to buffer by using
 * JSON.stringify.
 */
exports.compress = function(input, callback) {
  if (!(typeof input === 'string' || Buffer.isBuffer(input))) {
    input = JSON.stringify(input);
  }
  return binding.compress(input, callback);
};

/**
 * Compress syncronous.
 * If input isn't a string or buffer, automatically convert to buffer by using
 * JSON.stringify.
 */
exports.compressSync = function(input, callback) {
  if (!(typeof input === 'string' || Buffer.isBuffer(input))) {
    input = JSON.stringify(input);
  }
  return binding.compressSync(input, callback);
};

/**
 * Asyncronous decide if a buffer is compressed in a correct way.
 */
exports.isValidCompressed = function(input, callback) {
  return binding.isValidCompressed(input, callback);
};

/**
 * Syncronous decide if a buffer is compressed in a correct way.
 */
exports.isValidCompressedSync = function(input, callback) {
  return binding.isValidCompressedSync(input, callback);
};

/**
 * Asyncronous uncompress previously compressed data.
 * A parser can be attached. If no parser is attached, return buffer.
 */
exports.uncompress = function(compressed, callback, parse) {
  if (parse == null) {
    parse = parsers.raw;
  }
  return binding.uncompress(compressed, function(err, data) {
    if (data != null) {
      data = parse(data);
    }
    return callback(err, data);
  });
};

/**
 * Alias to uncompress.
 */
exports.decompress = exports.uncompress;

/**
 * Syncronous uncompress previously compressed data.
 * A parser can be attached. If no parser is attached, return buffer.
 */
exports.uncompressSync = function(compressed, callback, parse) {
  if (parse == null) {
    parse = parsers.raw;
  }
  return binding.uncompressSync(compressed, function(err, data) {
    if (data != null) {
      data = parse(data);
    }
    return callback(err, data);
  });
};

/**
 * Alias to decompressSync.
 */
exports.decompressSync = exports.uncompressSync;
