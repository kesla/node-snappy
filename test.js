var test = require('tap').test

  , snappy = require('./snappy')

  , inputString = 'beep boop, hello world. OMG OMG OMG'
  , inputBuffer = new Buffer(inputString)
  , compressed

test('compress() string', function (t) {
  snappy.compress(inputString, function (err, buffer) {
    compressed = buffer
    t.error(err)
    t.ok(Buffer.isBuffer(buffer), 'should return a Buffer')
    t.end()
  })
})

test('compressSync() string', function (t) {
  var buffer = snappy.compressSync(inputString)
  t.ok(Buffer.isBuffer(buffer), 'should return a Buffer')
  t.deepEqual(buffer, compressed, 'should compress to same as async version')
  t.end()
})

test('compress() buffer', function (t) {
  snappy.compress(inputBuffer, function (err, buffer) {
    t.error(err)
    t.ok(Buffer.isBuffer(buffer), 'should return a Buffer')
    t.deepEqual(buffer, compressed, 'should compress to same as string')
    t.end()
  })
})

test('compressSync() buffer', function (t) {
  var buffer = snappy.compressSync(inputBuffer)
  t.ok(Buffer.isBuffer(buffer), 'should return a Buffer')
  t.deepEqual(buffer, compressed, 'should compress to same as async version')
  t.end()
})

test('isValidCompressed() on valid data', function (t) {
  snappy.isValidCompressed(compressed, function (err, results) {
    t.error(err)
    t.equal(results, true)
    t.end()
  })
})

test('isValidCompressed() on invalid data', function (t) {
  snappy.isValidCompressed(new Buffer('beep boop'), function (err, results) {
    t.error(err)
    t.equal(results, false)
    t.end()
  })
})

test('isValidCompressedSync() on valid data', function (t) {
  var results = snappy.isValidCompressedSync(compressed)
  t.equal(results, true)
  t.end()
})

test('isValidCompressedSync() on invalid data', function (t) {
  var results = snappy.isValidCompressedSync(new Buffer('beep boop'))
  t.equal(results, false)
  t.end()
})

test('uncompress() defaults to Buffer', function (t) {
  snappy.uncompress(compressed, function (err, buffer) {
    t.error(err)
    t.deepEqual(buffer, inputBuffer)
    t.end()
  })
})

test('uncompress() returning a Buffer', function (t) {
  snappy.uncompress(compressed, { asBuffer: true }, function (err, buffer) {
    t.error(err)
    t.deepEqual(buffer, inputBuffer)
    t.end()
  })
})

test('uncompress() returning a String', function (t) {
  snappy.uncompress(compressed, { asBuffer: false }, function (err, buffer) {
    t.error(err)
    t.deepEqual(buffer, inputString)
    t.end()
  })
})

test('uncompress() on bad input', function (t) {
  snappy.uncompress(new Buffer('beep boop OMG OMG OMG'), function (err) {
    t.equal(err.message, 'Invalid input')
    t.end()
  })
})

test('uncompressSync() defaults to Buffer', function (t) {
  var results = snappy.uncompressSync(compressed)
  t.deepEqual(results, inputBuffer)
  t.end()
})

test('uncompressSync() returning a Buffer', function (t) {
  var results = snappy.uncompressSync(compressed, { asBuffer: true })
  t.deepEqual(results, inputBuffer)
  t.end()
})

test('uncompressSync() returning a String', function (t) {
  var results = snappy.uncompressSync(compressed, { asBuffer: false })
  t.deepEqual(results, inputString)
  t.end()
})

test('uncompressSync() on bad input', function (t) {
  t.throws(function () {
    snappy.uncompressSync(new Buffer('beep boop OMG OMG OMG'))
  }, 'Invalid input')
  t.end()
})
