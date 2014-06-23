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

test('compress() buffer', function (t) {
  snappy.compress(inputBuffer, function (err, buffer) {
    t.error(err)
    t.ok(Buffer.isBuffer(buffer), 'should return a Buffer')
    t.deepEqual(buffer, compressed, 'should compress to same as string')
    t.end()
  })
})

test('isValidCompressed() on valid data', function (t) {
  snappy.isValidCompressed(compressed, function (err, isValidCompressed) {
    t.error(err)
    t.equal(isValidCompressed, true)
    t.end()
  })
})

test('isValidCompressed() on invalid data', function (t) {
  snappy.isValidCompressed(new Buffer('beep boop'), function (err, isValidCompressed) {
    t.error(err)
    t.equal(isValidCompressed, false)
    t.end()
  })
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