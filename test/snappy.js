'use strict';

var snappy = require('..')
var assert = require('assert')

describe('snappy', function() {

  var inputString = 'beep boop, hello world. OMG OMG OMG'
  var inputBuffer = new Buffer(inputString)
  var inputArray = new Array(1, 2, 3)
  var compressed

  describe('compress()', function() {

    it('should return compressed Buffer from String data', function(done) {

      snappy.compress(inputString, function(err, buffer) {

        assert.equal(err, null)
        assert.ok(Buffer.isBuffer(buffer))
        compressed = buffer
        done()
      })
    })
    it('should return compressed Buffer from Buffer data', function(done) {

      snappy.compress(inputBuffer, function(err, buffer) {

        assert.equal(err, null)
        assert.ok(Buffer.isBuffer(buffer))
        assert.deepEqual(buffer, compressed,
          'should compress to same as String')
        done()
      })
    })

    describe('error', function() {

      it('should return Error on invalid Array data', function(done) {

        snappy.compress(inputArray, function(err, buffer) {

          assert.equal(err.message, 'Input must be a String or a Buffer')
          done()
        })
      })
    })

    describe('binding', function() {

      it('should return compressed Buffer', function(done) {

        snappy.binding.compress(inputBuffer, function(err, buffer) {

          assert.equal(err, null)
          assert.deepEqual(buffer, compressed)
          done()
        })
      })
      it('should return compressed Buffer', function(done) {

        snappy.binding.compress(inputString, function(err, buffer) {

          assert.equal(err, null)
          assert.deepEqual(buffer, compressed)
          done()
        })
      })
    })
  })

  describe('isValidCompressed()', function() {

    it('should return true on valid data', function(done) {

      snappy.isValidCompressed(compressed, function(err, isValidCompressed) {

        assert.equal(err, null)
        assert.ok(isValidCompressed)
        done()
      })
    })

    describe('error', function() {

      it('should return false on invalid Buffer data', function(done) {

        snappy.isValidCompressed(inputBuffer, function(err, isValidCompressed) {

          assert.equal(err, null)
          assert.equal(isValidCompressed, false)
          done()
        })
      })
      it('should return Error on invalid String data', function(done) {

        snappy.isValidCompressed(inputString, function(err, isValidCompressed) {

          assert.equal(err.message, 'Input must be a Buffer')
          done()
        })
      })
      it('should return Error on invalid Array data', function(done) {

        snappy.isValidCompressed(inputArray, function(err, isValidCompressed) {

          assert.equal(err.message, 'Input must be a Buffer')
          done()
        })
      })
    })

    describe('binding', function() {

      it('should return true', function(done) {

        snappy.binding.isValidCompressed(compressed, function(err,
                                                          isValidCompressed) {

          assert.equal(err, null)
          assert.ok(isValidCompressed)
          done()
        })
      })
    });
  })

  describe('uncompress()', function() {

    it('should return defaults to Buffer', function(done) {

      snappy.uncompress(compressed, function(err, buffer) {

        assert.equal(err, null)
        assert.deepEqual(buffer, inputBuffer)
        done()
      })
    })
    it('should return uncompressed Buffer', function(done) {

      snappy.uncompress(compressed, {
        asBuffer: true
      }, function(err, buffer) {

        assert.equal(err, null)
        assert.deepEqual(buffer, inputBuffer)
        assert.ok(Buffer.isBuffer(buffer))
        done()
      })
    })
    it('should return uncompressed String', function(done) {

      snappy.uncompress(compressed, {
        asBuffer: false
      }, function(err, buffer) {

        assert.equal(err, null)
        assert.deepEqual(buffer, inputString)
        assert.equal(typeof buffer, 'string')
        done()
      })
    })

    describe('error', function() {

      it('should return Error on bad Buffer input', function(done) {

        snappy.uncompress(inputBuffer, function(err, buffer) {

          assert.equal(err.message, 'Invalid input')
          done()
        })
      })
      it('should return Error on invalid String input', function(done) {

        snappy.uncompress(inputString, function(err, buffer) {

          assert.equal(err.message, 'Input must be a Buffer')
          done()
        })
      })
      it('should return Error on invalid Array input', function(done) {

        snappy.uncompress(inputArray, function(err, buffer) {

          assert.equal(err.message, 'Input must be a Buffer')
          done()
        })
      })
    })

    describe('binding', function() {

      it('should return Buffer', function(done) {

        snappy.binding.uncompress(compressed, {
          asBuffer: true
        }, function(err, buffer) {

          assert.equal(err, null)
          assert.deepEqual(buffer, inputBuffer)
          done()
        })
      })
      it('should return String', function(done) {

        snappy.binding.uncompress(compressed, {
          asBuffer: false
        }, function(err, buffer) {

          assert.equal(err, null)
          assert.deepEqual(buffer, inputString)
          done()
        })
      })
    })
  })
})
