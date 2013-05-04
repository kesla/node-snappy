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
var binding = require('bindings')('binding');

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
  if(!Buffer.isBuffer(input)){
    if (!(typeof input === 'string')) {
      input = JSON.stringify(input);
    }
    input = new Buffer(input);
  }
  binding.compress(input, callback);
};

/**
 * Compress syncronous.
 * If input isn't a string or buffer, automatically convert to buffer by using
 * JSON.stringify.
 */
exports.compressSync = function(input) {
  if(!Buffer.isBuffer(input)){
    if (!(typeof input === 'string')) {
      input = JSON.stringify(input);
    }
    input = new Buffer(input);
  }
  var result;
  var err;
  binding.compressSync(input, function(e, r) {
    result = r;
    err = e;
  });
  if(err) {
    throw err;
  }
  return result;
};

/**
 * Asyncronous decide if a buffer is compressed in a correct way.
 */
exports.isValidCompressed = binding.isValidCompressed;

/**
 * Syncronous decide if a buffer is compressed in a correct way.
 */
exports.isValidCompressedSync = function(input, callback) {
  var err, result;
  binding.isValidCompressedSync(input, function(e, r) {
    err = e;
    result = r;
  });
  if(err) {
    throw err;
  }
  return result;
};

/**
 * Asyncronous uncompress previously compressed data.
 * A parser can be attached. If no parser is attached, return buffer.
 */
exports.uncompress = function(compressed, parse, callback) {
  if (parse == null) {
    parse = parsers.raw;
  }
  binding.uncompress(compressed, function(err, data) {
    if (data != null) {
      data = parse(data);
    }
    callback(err, data);
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
exports.uncompressSync = function(compressed, parse) {
  if (!parse) {
    parse = parsers.raw;
  }
  var err, data;

  binding.uncompressSync(compressed, function(e, d) {
    if (d) {
      d = parse(d);
    }
    err = e;
    data = d;
  });
  if(err) {
    throw err;
  }
  return data;
};

/**
 * Alias to decompressSync.
 */
exports.decompressSync = exports.uncompressSync;
