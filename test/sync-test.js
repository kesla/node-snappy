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

var snappy = require('../lib/snappy');
var vows = require('vows');
var assert = require('assert');

// Convenient helper method
assert.isError = function(err) {
  return assert.instanceOf(Error);
};

// Test data
var string = "foo foo foo  Fasfa daos asd foo foo foo asdasf bar bar aarr";
var buffer = new Buffer([255, 200, 100, 3, 0, 256, 80]);
var json = {
  "foo": "bar",
  "fou": 0,
  "shou": "ho ho",
  "what?": ["hey", "you"]
};
var compress = snappy.compressSync;
var decompress = snappy.decompressSync;
var isValidCompressed = snappy.isValidCompressedSync;

// Describe the test suite
return vows.describe("snappy (syncronous)").addBatch({
  "compress": {
    "Buffer": {
      topic: function() {
        return compress(buffer);
      },
      'should result in a buffer': function(compressed) {
        return Buffer.isBuffer(compressed);
      },
      'and isValidCompressed': {
        topic: function(compressed) {
          return isValidCompressed(compressed);
        },
        'should result in true': function(result) {
          return assert.isTrue(result);
        }
      },
      'and decompress (string-parser)': {
        topic: function(compressed) {
          return decompress(compressed, snappy.parsers.string);
        },
        'should result in a string': function(result) {
          return assert.isString(result);
        },
        'should equal the original when parsed': function(result) {
          return assert.strictEqual(result, buffer.toString("utf8"));
        }
      },
      'and decompress (no parser)': {
        topic: function(compressed) {
          return decompress(compressed);
        },
        'should result in a buffer': function(result) {
          return Buffer.isBuffer(result);
        },
        'should equal the original': function(result) {
          return assert.strictEqual(result.toString("utf8"), buffer.toString("utf8"));
        }
      }
    },
    "json": {
      topic: function() {
        return compress(json);
      },
      'should result in a buffer': function(compressed) {
        return Buffer.isBuffer(compressed);
      },
      'and isValidCompressed': {
        topic: function(compressed) {
          return isValidCompressed(compressed);
        },
        'should result in true': function(result) {
          return assert.isTrue(result);
        }
      },
      'and decompress (json-parser)': {
        topic: function(compressed) {
          return decompress(compressed, snappy.parsers.json);
        },
        'should result in json': function(result) {
          return assert.instanceOf(result, Object);
        },
        'should equal the original': function(result) {
          return assert.deepEqual(result, json);
        }
      },
      'and decompress (string-parser)': {
        topic: function(compressed) {
          return decompress(compressed, snappy.parsers.string);
        },
        'should result in a string': function(result) {
          return assert.isString(result);
        },
        'should equal the original when parsed': function(result) {
          return assert.deepEqual(JSON.parse(result), json);
        }
      },
      'and decompress (no parser)': {
        topic: function(compressed) {
          return decompress(compressed);
        },
        'should result in a buffer': function(result) {
          return Buffer.isBuffer(result);
        },
        'should equal the original when parsed': function(result) {
          return assert.deepEqual(JSON.parse(result), json);
        }
      }
    },
    "string": {
      topic: function() {
        return compress(string);
      },
      'should result in a buffer': function(compressed) {
        return Buffer.isBuffer(compressed);
      },
      'and isValidCompressed': {
        topic: function(compressed) {
          return isValidCompressed(compressed);
        },
        'should result in true': function(result) {
          return assert.isTrue(result);
        }
      },
      'and decompress (string-parser)': {
        topic: function(compressed) {
          return decompress(compressed, snappy.parsers.string);
        },
        'should result in a string': function(result) {
          return assert.isString(result);
        },
        'should equal the original': function(result) {
          return assert.strictEqual(result, string);
        }
      },
      'and decompress (no parser)': {
        topic: function(compressed) {
          return decompress(compressed);
        },
        'should result in a Buffer': function(result) {
          return Buffer.isBuffer(result);
        },
        'should equal the original when parsed': function(result) {
          var string2;
          string2 = result.toString("utf8");
          return assert.strictEqual(string2, string);
        }
      }
    }
  },
  "decompress buffer (invalid) should throw": function() {
    try {
      decompress(buffer, snappy.parsers.string);
      assert.isTrue(false);
    } catch (e) {}
  },
  "isValidCompressed": {
    "buffer (invalid)": {
      topic: function() {
        return isValidCompressed(buffer);
      },
      'should result in false': function(result) {
        return assert.isFalse(result);
      }
    }
  }
}).export(module);
