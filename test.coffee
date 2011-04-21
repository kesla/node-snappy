###
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
###

vows = require 'vows'
assert = require 'assert'
snappy = require './snappy'

assert.isBuffer = (buf) ->
  assert.instanceOf buf, Buffer

assert.isError = (err) ->
  assert.instanceOf err, Error
string = "foo foo foo  Fasfa daos asd foo foo foo asdasf bar bar aarr"
buffer = new Buffer(string)
json = {"foo" : "bar", "fou" : 0, "shou" : "ho ho", "what?" : ["hey", "you"]}


["", "Sync"].forEach (sync)->
  title = if sync is "" then "asyncronous" else "synchronous"
  vows.describe("snappy (#{title} versions)").addBatch(
    "compress":
      "Buffer":
        topic: () -> snappy["compress#{sync}"](buffer, @callback)
        'should not have errors': (err, compressed) ->
          assert.isNull err

        'should result in a buffer': (err, compressed) ->
          assert.isBuffer compressed

        'and isValidCompressed':
          topic: (compressed) -> snappy["isValidCompressed#{sync}"](compressed, @callback)
          'should not have errors': (err, result) ->
            assert.isNull err
          
          'should result in true': (err, result) ->
            assert.isTrue result

        'and decompress (string-parser)':
          topic: (compressed) -> snappy["decompress#{sync}"](compressed, @callback, snappy.parsers.string)
          'should not have errors': (err, result) ->
            assert.isNull err
          
          'should result in a string': (err, result) ->
            assert.isString result

          'should equal the original when parsed': (err, result) ->
            assert.strictEqual result, buffer.toString("utf8")

        'and decompress (no parser)':
          topic: (compressed) -> snappy["decompress#{sync}"](compressed, @callback)
          'should not have errors': (err, result) ->
            assert.isNull err
          
          'should result in a buffer': (err, result) ->
            assert.isBuffer result

          'should equal the original': (err, result) ->
            assert.strictEqual result.toString("utf8"), buffer.toString("utf8")

      "json":
        topic: () -> snappy["compress#{sync}"](json, @callback)
        'should not have errors': (err, compressed) ->
          assert.isNull err

        'should result in a buffer': (err, compressed) ->
          assert.isBuffer compressed

        'and isValidCompressed':
          topic: (compressed) -> snappy["isValidCompressed#{sync}"](compressed, @callback)
          'should not have errors': (err, result) ->
            assert.isNull err
          
          'should result in true': (err, result) ->
            assert.isTrue result

        'and decompress (json-parser)':
          topic: (compressed) -> snappy["decompress#{sync}"](compressed, @callback, snappy.parsers.json)
          'should not have errors': (err, result) ->
            assert.isNull err
          
          'should result in json': (err, result) ->
            # TODO: Fix proper test
            assert.instanceOf result, Object

          'should equal the original': (err, result) ->
            assert.deepEqual result, json

        'and decompress (string-parser)':
          topic: (compressed) -> snappy["decompress#{sync}"](compressed, @callback, snappy.parsers.string)
          'should not have errors': (err, result) ->
            assert.isNull err
          
          'should result in a string': (err, result) ->
            assert.isString result

          'should equal the original when parsed': (err, result) ->
            assert.deepEqual JSON.parse(result), json

        'and decompress (no parser)':
          topic: (compressed) -> snappy["decompress#{sync}"](compressed, @callback)
          'should not have errors': (err, result) ->
            assert.isNull err
          
          'should result in a buffer': (err, result) ->
            assert.isBuffer result

          'should equal the original when parsed': (err, result) ->
            assert.deepEqual JSON.parse(result), json

      "string":
        topic: () -> snappy["compress#{sync}"](string, @callback)
        'should not have errors': (err, compressed) ->
          assert.isNull err

        'should result in a buffer': (err, compressed) ->
          assert.isBuffer compressed

        'and isValidCompressed':
          topic: (compressed) -> snappy["isValidCompressed#{sync}"](compressed, @callback)
          'should not have errors': (err, result) ->
            assert.isNull err
          
          'should result in true': (err, result) ->
            assert.isTrue result

        'and decompress (string-parser)':
          topic: (compressed) -> snappy["decompress#{sync}"](compressed, @callback, snappy.parsers.string)
          'should not have errors': (err, result) ->
            assert.isNull err
          
          'should result in a string': (err, result) ->
            assert.isString result

          'should equal the original': (err, result) ->
            assert.strictEqual result, string

        'and decompress (no parser)':
          topic: (compressed) -> snappy["decompress#{sync}"](compressed, @callback)
          'should not have errors': (err, result) ->
            assert.isNull err
          
          'should result in a Buffer': (err, result) ->
            assert.isBuffer result

          'should equal the original when parsed': (err, result) ->
            string2 = result.toString("utf8")
            assert.strictEqual string2, string

    "uncompress":
      "buffer (invalid)":
        topic: () -> snappy["decompress#{sync}"](buffer, @callback, snappy.parsers.string)
        'should have error': (err, result) ->
          assert.isError err
        
        'should have "Invalid input"-error': (err, result) ->
          assert.strictEqual err.message ,"Invalid input"

    "isValidCompressed":
      "buffer (invalid)":
        topic: () -> snappy["isValidCompressed#{sync}"](buffer, @callback)
        'should not have errors': (err, result) ->
          assert.isNull err

        'should result in false': (err, result) ->
          assert.isFalse result
      
  ).export(module)
