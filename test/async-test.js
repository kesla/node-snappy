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
  return assert.instanceOf(err, Error);
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
var compress = snappy.compress;
var decompress = snappy.decompress;
var isValidCompressed = snappy.isValidCompressed;

// Describe the test suite
vows.describe("snappy (asyncronous)").addBatch({
  "compress": {
    "Buffer": {
      topic: function() {
        compress(buffer, this.callback);
      },
      'should not have errors': function(err, compressed) {
        assert.isNull(err);
      },
      'should result in a buffer': function(err, compressed) {
        Buffer.isBuffer(compressed);
      },
      'and isValidCompressed': {
        topic: function(compressed) {
          isValidCompressed(compressed, this.callback);
        },
        'should not have errors': function(err, result) {
          assert.isNull(err);
        },
        'should result in true': function(err, result) {
          assert.isTrue(result);
        }
      },
      'and decompress (string-parser)': {
        topic: function(compressed) {
          decompress(compressed, snappy.parsers.string, this.callback);
        },
        'should not have errors': function(err, result) {
          assert.isNull(err);
        },
        'should result in a string': function(err, result) {
          assert.isString(result);
        },
        'should equal the original when parsed': function(err, result) {
          assert.strictEqual(result, buffer.toString("utf8"));
        }
      },
      'and decompress (no parser)': {
        topic: function(compressed) {
          decompress(compressed, snappy.parsers.raw, this.callback);
        },
        'should not have errors': function(err, result) {
          assert.isNull(err);
        },
        'should result in a buffer': function(err, result) {
          Buffer.isBuffer(result);
        },
        'should equal the original': function(err, result) {
          assert.strictEqual(result.toString("utf8"), buffer.toString("utf8"));
        }
      }
    },
    "json": {
      topic: function() {
        compress(json, this.callback);
      },
      'should not have errors': function(err, compressed) {
        assert.isNull(err);
      },
      'should result in a buffer': function(err, compressed) {
        Buffer.isBuffer(compressed);
      },
      'and isValidCompressed': {
        topic: function(compressed) {
          isValidCompressed(compressed, this.callback);
        },
        'should not have errors': function(err, result) {
          assert.isNull(err);
        },
        'should result in true': function(err, result) {
          assert.isTrue(result);
        }
      },
      'and decompress (json-parser)': {
        topic: function(compressed) {
          decompress(compressed, snappy.parsers.json, this.callback);
        },
        'should not have errors': function(err, result) {
          assert.isNull(err);
        },
        'should result in json': function(err, result) {
          assert.instanceOf(result, Object);
        },
        'should equal the original': function(err, result) {
          assert.deepEqual(result, json);
        }
      },
      'and decompress (string-parser)': {
        topic: function(compressed) {
          decompress(compressed, snappy.parsers.string, this.callback);
        },
        'should not have errors': function(err, result) {
          assert.isNull(err);
        },
        'should result in a string': function(err, result) {
          assert.isString(result);
        },
        'should equal the original when parsed': function(err, result) {
          assert.deepEqual(JSON.parse(result), json);
        }
      },
      'and decompress (no parser)': {
        topic: function(compressed) {
          decompress(compressed, snappy.parsers.raw, this.callback);
        },
        'should not have errors': function(err, result) {
          assert.isNull(err);
        },
        'should result in a buffer': function(err, result) {
          Buffer.isBuffer(result);
        },
        'should equal the original when parsed': function(err, result) {
          assert.deepEqual(JSON.parse(result), json);
        }
      }
    },
    "string": {
      topic: function() {
        compress(string, this.callback);
      },
      'should not have errors': function(err, compressed) {
        assert.isNull(err);
      },
      'should result in a buffer': function(err, compressed) {
        Buffer.isBuffer(compressed);
      },
      'and isValidCompressed': {
        topic: function(compressed) {
          isValidCompressed(compressed, this.callback);
        },
        'should not have errors': function(err, result) {
          assert.isNull(err);
        },
        'should result in true': function(err, result) {
          assert.isTrue(result);
        }
      },
      'and decompress (string-parser)': {
        topic: function(compressed) {
          decompress(compressed, snappy.parsers.string, this.callback);
        },
        'should not have errors': function(err, result) {
          assert.isNull(err);
        },
        'should result in a string': function(err, result) {
          assert.isString(result);
        },
        'should equal the original': function(err, result) {
          assert.strictEqual(result, string);
        }
      },
      'and decompress (no parser)': {
        topic: function(compressed) {
          decompress(compressed, snappy.parsers.raw, this.callback);
        },
        'should not have errors': function(err, result) {
          assert.isNull(err);
        },
        'should result in a Buffer': function(err, result) {
          Buffer.isBuffer(result);
        },
        'should equal the original when parsed': function(err, result) {
          var string2;
          string2 = result.toString("utf8");
          assert.strictEqual(string2, string);
        }
      }
    }
  },
  "decompress": {
    "buffer (invalid)": {
      topic: function() {
        decompress(buffer, snappy.parsers.string, this.callback);
      },
      'should have error': function(err, result) {
        assert.isError(err);
      },
      'should have "Invalid input"-error': function(err, result) {
        assert.strictEqual(err.message, "Invalid input");
      }
    }
  },
  "isValidCompressed": {
    "buffer (invalid)": {
      topic: function() {
        isValidCompressed(buffer, this.callback);
      },
      'should not have errors': function(err, result) {
        assert.isNull(err);
      },
      'should result in false': function(err, result) {
        assert.isFalse(result);
      }
    }
  }
}).export(module);
