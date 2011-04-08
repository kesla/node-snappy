vows = require 'vows'
assert = require 'assert'
snappy = require './snappy'

assert.isBuffer = (buf)->
  assert.instanceOf buf, Buffer

string = "foo foo foo  Fasfa daos asd foo foo foo asdasf bar bar aarr"
buffer = new Buffer(string)
json = {"foo" : "bar", "fou" : 0, "shou" : "ho ho", "what?" : ["hey", "you"]}

vows.describe('snappy').addBatch(
  "A buffer":
    "compressed":
      topic: () -> snappy.compress(buffer, @callback)
      'should not have errors': (err, compressed) ->
        assert.isNull err

      'should result in a buffer': (err, compressed) ->
        assert.isBuffer compressed

      'and tested if valid':
        topic: (compressed) -> snappy.isValidCompressed(compressed, @callback)
        'should not have errors': (err, result) ->
          assert.isNull err
        
        'should result in true': (err, result) ->
          assert.isTrue result

      'and decompressed with string-parser':
        topic: (compressed) -> snappy.decompress(compressed, @callback, snappy.parsers.string)
        'should not have errors': (err, result) ->
          assert.isNull err
        
        'should result in a string': (err, result) ->
          assert.isString result

        'should equal the original when parsed': (err, result) ->
          assert.strictEqual result, buffer.toString("utf8")

      'and decompressed without any parser':
        topic: (compressed) -> snappy.decompress(compressed, @callback)
        'should not have errors': (err, result) ->
          assert.isNull err
        
        'should result in a buffer': (err, result) ->
          assert.isBuffer result

        'should equal the original': (err, result) ->
          assert.strictEqual result.toString("utf8"), buffer.toString("utf8")

  "A json-object":
    "compressed":
      topic: () -> snappy.compress(json, @callback)
      'should not have errors': (err, compressed) ->
        assert.isNull err

      'should result in a buffer': (err, compressed) ->
        assert.isBuffer compressed

      'and tested if valid':
        topic: (compressed) -> snappy.isValidCompressed(compressed, @callback)
        'should not have errors': (err, result) ->
          assert.isNull err
        
        'should result in true': (err, result) ->
          assert.isTrue result

      'and decompressed with json-parser':
        topic: (compressed) -> snappy.decompress(compressed, @callback, snappy.parsers.json)
        'should not have errors': (err, result) ->
          assert.isNull err
        
        'should result in json': (err, result) ->
          # TODO: Fix proper test
          assert.instanceOf result, Object

        'should equal the original': (err, result) ->
          assert.deepEqual result, json

      'and decompressed with string-parser':
        topic: (compressed) -> snappy.decompress(compressed, @callback, snappy.parsers.string)
        'should not have errors': (err, result) ->
          assert.isNull err
        
        'should result in a string': (err, result) ->
          assert.isString result

        'should equal the original when parsed': (err, result) ->
          assert.deepEqual JSON.parse(result), json

      'and decompressed without any parser':
        topic: (compressed) -> snappy.decompress(compressed, @callback)
        'should not have errors': (err, result) ->
          assert.isNull err
        
        'should result in a buffer': (err, result) ->
          assert.isBuffer result

        'should equal the original when parsed': (err, result) ->
          assert.deepEqual JSON.parse(result), json

  "A string":
    "compressed":
      topic: () -> snappy.compress(string, @callback)
      'should not have errors': (err, compressed) ->
        assert.isNull err

      'should result in a buffer': (err, compressed) ->
        assert.isBuffer compressed

      'and tested if valid':
        topic: (compressed) -> snappy.isValidCompressed(compressed, @callback)
        'should not have errors': (err, result) ->
          assert.isNull err
        
        'should result in true': (err, result) ->
          assert.isTrue result

      'and decompressed with string-parser':
        topic: (compressed) -> snappy.decompress(compressed, @callback, snappy.parsers.string)
        'should not have errors': (err, result) ->
          assert.isNull err
        
        'should result in a string': (err, result) ->
          assert.isString result

        'should equal the original': (err, result) ->
          assert.strictEqual result, string

      'and decompressed without any parser':
        topic: (compressed) -> snappy.decompress(compressed, @callback)
        'should not have errors': (err, result) ->
          assert.isNull err
        
        'should result in a buffer': (err, result) ->
          assert.isBuffer result

        'should equal the original when parsed': (err, result) ->
          string2 = result.toString("utf8")
          assert.strictEqual string2, string

).export(module)
