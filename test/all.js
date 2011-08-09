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

// Convenient helper methods
assert.isBuffer = function(buf) {
  return assert.instanceOf(buf, Buffer);
};
assert.isError = function(err) {
  return assert.instanceOf(err, Error);
};

// Test data
var string = "foo foo foo  Fasfa daos asd foo foo foo asdasf bar bar aarr";
var buffer = new Buffer(string);
var json = {
  "foo": "bar",
  "fou": 0,
  "shou": "ho ho",
  "what?": ["hey", "you"]
};

// Use same test to test both sync and async versions of the snappy-methods.
["", "Sync"].forEach(function(sync) {
  //
  // Define method aliases to synchronous or asyncronous versions of the
  // methods. For example, compress will point to snappy.compress or
  // snappy.compressSync
  //
  var compress = snappy["compress" + sync];
  var decompress = snappy["decompress" + sync];
  var isValidCompressed = snappy["isValidCompressed" + sync];

  // Give the test runs a good title
  var title = sync === "" ? "asyncronous" : "synchrosnous";

  // Describe the test suite
  return vows.describe("snappy (" + title + " versions)").addBatch({
    "compress": {
      "Buffer": {
        topic: function() {
          return compress(buffer, this.callback);
        },
        'should not have errors': function(err, compressed) {
          return assert.isNull(err);
        },
        'should result in a buffer': function(err, compressed) {
          return assert.isBuffer(compressed);
        },
        'and isValidCompressed': {
          topic: function(compressed) {
            return isValidCompressed(compressed, this.callback);
          },
          'should not have errors': function(err, result) {
            return assert.isNull(err);
          },
          'should result in true': function(err, result) {
            return assert.isTrue(result);
          }
        },
        'and decompress (string-parser)': {
          topic: function(compressed) {
            return decompress(compressed, this.callback, snappy.parsers.string);
          },
          'should not have errors': function(err, result) {
            return assert.isNull(err);
          },
          'should result in a string': function(err, result) {
            return assert.isString(result);
          },
          'should equal the original when parsed': function(err, result) {
            console.log("'", result, " ", buffer.toString("utf8"), "'");
            return assert.strictEqual(result, buffer.toString("utf8"));
          }
        },
        'and decompress (no parser)': {
          topic: function(compressed) {
            return decompress(compressed, this.callback);
          },
          'should not have errors': function(err, result) {
            return assert.isNull(err);
          },
          'should result in a buffer': function(err, result) {
            return assert.isBuffer(result);
          },
          'should equal the original': function(err, result) {
            return assert.strictEqual(result.toString("utf8"), buffer.toString("utf8"));
          }
        }
      },
      "json": {
        topic: function() {
          return compress(json, this.callback);
        },
        'should not have errors': function(err, compressed) {
          return assert.isNull(err);
        },
        'should result in a buffer': function(err, compressed) {
          return assert.isBuffer(compressed);
        },
        'and isValidCompressed': {
          topic: function(compressed) {
            return isValidCompressed(compressed, this.callback);
          },
          'should not have errors': function(err, result) {
            return assert.isNull(err);
          },
          'should result in true': function(err, result) {
            return assert.isTrue(result);
          }
        },
        'and decompress (json-parser)': {
          topic: function(compressed) {
            return decompress(compressed, this.callback, snappy.parsers.json);
          },
          'should not have errors': function(err, result) {
            return assert.isNull(err);
          },
          'should result in json': function(err, result) {
            return assert.instanceOf(result, Object);
          },
          'should equal the original': function(err, result) {
            return assert.deepEqual(result, json);
          }
        },
        'and decompress (string-parser)': {
          topic: function(compressed) {
            return decompress(compressed, this.callback, snappy.parsers.string);
          },
          'should not have errors': function(err, result) {
            return assert.isNull(err);
          },
          'should result in a string': function(err, result) {
            return assert.isString(result);
          },
          'should equal the original when parsed': function(err, result) {
            return assert.deepEqual(JSON.parse(result), json);
          }
        },
        'and decompress (no parser)': {
          topic: function(compressed) {
            return decompress(compressed, this.callback);
          },
          'should not have errors': function(err, result) {
            return assert.isNull(err);
          },
          'should result in a buffer': function(err, result) {
            return assert.isBuffer(result);
          },
          'should equal the original when parsed': function(err, result) {
            return assert.deepEqual(JSON.parse(result), json);
          }
        }
      },
      "string": {
        topic: function() {
          return compress(string, this.callback);
        },
        'should not have errors': function(err, compressed) {
          return assert.isNull(err);
        },
        'should result in a buffer': function(err, compressed) {
          return assert.isBuffer(compressed);
        },
        'and isValidCompressed': {
          topic: function(compressed) {
            return isValidCompressed(compressed, this.callback);
          },
          'should not have errors': function(err, result) {
            return assert.isNull(err);
          },
          'should result in true': function(err, result) {
            return assert.isTrue(result);
          }
        },
        'and decompress (string-parser)': {
          topic: function(compressed) {
            return decompress(compressed, this.callback, snappy.parsers.string);
          },
          'should not have errors': function(err, result) {
            return assert.isNull(err);
          },
          'should result in a string': function(err, result) {
            return assert.isString(result);
          },
          'should equal the original': function(err, result) {
            return assert.strictEqual(result, string);
          }
        },
        'and decompress (no parser)': {
          topic: function(compressed) {
            return decompress(compressed, this.callback);
          },
          'should not have errors': function(err, result) {
            return assert.isNull(err);
          },
          'should result in a Buffer': function(err, result) {
            return assert.isBuffer(result);
          },
          'should equal the original when parsed': function(err, result) {
            var string2;
            string2 = result.toString("utf8");
            return assert.strictEqual(string2, string);
          }
        }
      }
    },
    "decompress": {
      "buffer (invalid)": {
        topic: function() {
          return decompress(buffer, this.callback, snappy.parsers.string);
        },
        'should have error': function(err, result) {
          return assert.isError(err);
        },
        'should have "Invalid input"-error': function(err, result) {
          return assert.strictEqual(err.message, "Invalid input");
        }
      }
    },
    "isValidCompressed": {
      "buffer (invalid)": {
        topic: function() {
          return isValidCompressed(buffer, this.callback);
        },
        'should not have errors': function(err, result) {
          return assert.isNull(err);
        },
        'should result in false': function(err, result) {
          return assert.isFalse(result);
        }
      }
    }
  }).export(module);
});
