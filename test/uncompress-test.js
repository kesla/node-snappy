var spawn = require('child_process').spawn

  , createUncompressStream = require('../').createUncompressStream
  , test = require('tap').test
  , largerInput = require('fs').readFileSync(__filename)
  , largerInputString = largerInput.toString()

test('uncompress small string', function (t) {
  var child = spawn('python', [ '-m', 'snappy', '-c' ])
    , uncompressStream = createUncompressStream({ asBuffer: false })
    , data = ''

  uncompressStream.on('data', function (chunk) {
    data = data + chunk
    t.equal(typeof(chunk), 'string')
  })

  uncompressStream.on('end', function () {
    t.equal(data, 'beep boop')
    t.end()
  })

  child.stdout.pipe(uncompressStream)

  child.stdin.write('beep boop')
  child.stdin.end()
})

test('uncompress small Buffer', function (t) {
  var child = spawn('python', [ '-m', 'snappy', '-c' ])
    , uncompressStream = createUncompressStream()
    , data = []

  uncompressStream.on('data', function (chunk) {
    data.push(chunk)
    t.ok(Buffer.isBuffer(chunk))
  })

  uncompressStream.on('end', function () {
    t.deepEqual(Buffer.concat(data), new Buffer('beep boop'))
    t.end()
  })

  child.stdout.pipe(uncompressStream)

  child.stdin.write(new Buffer('beep boop'))
  child.stdin.end()
})

test('uncompress large string', function (t) {
  var child = spawn('python', [ '-m', 'snappy', '-c' ])
    , uncompressStream = createUncompressStream({ asBuffer: false })
    , data = ''

  uncompressStream.on('data', function (chunk) {
    data = data + chunk
    t.equal(typeof(chunk), 'string')
  })

  uncompressStream.on('end', function () {
    t.equal(data, largerInputString)
    t.end()
  })

  child.stdout.pipe(uncompressStream)

  child.stdin.write(largerInput)
  child.stdin.end()
})

test('uncompress large string', function (t) {
  var child = spawn('python', [ '-m', 'snappy', '-c' ])
    , uncompressStream = createUncompressStream()
    , data = []

    uncompressStream.on('data', function (chunk) {
      data.push(chunk)
      t.ok(Buffer.isBuffer(chunk))
    })

    uncompressStream.on('end', function () {
      t.deepEqual(Buffer.concat(data), largerInput)
      t.end()
    })


  child.stdout.pipe(uncompressStream)

  child.stdin.write(largerInput)
  child.stdin.end()
})

test('uncompress with bad identifier', function (t) {
  var uncompressStream = createUncompressStream()

  uncompressStream.on('error', function (err) {
    t.equal(err.message, 'malformed input: bad identifier')
    t.end()
  })

  uncompressStream.write(
    new Buffer([ 0xff, 0x06, 0x00, 0x00, 0x73, 0x4e, 0x61, 0x50, 0x70, 0x60 ])
  )
  uncompressStream.end()
})

test('uncompress with bad first frame', function (t) {
  var uncompressStream = createUncompressStream()

  uncompressStream.on('error', function (err) {
    t.equal(err.message, 'malformed input: must begin with an identifier')
    t.end()
  })

  uncompressStream.write(
    new Buffer([ 0x0, 0x06, 0x00, 0x00, 0x73, 0x4e, 0x61, 0x50, 0x70, 0x60 ])
  )
  uncompressStream.end()
})

test('uncompress large String in small pieces', function (t) {
  var child = spawn('python', [ '-m', 'snappy', '-c' ])
    , uncompressStream = createUncompressStream()
    , data = []

    uncompressStream.on('data', function (chunk) {
      data.push(chunk)
      t.ok(Buffer.isBuffer(chunk))
    })

    uncompressStream.on('end', function () {
      t.deepEqual(Buffer.concat(data), largerInput)
      t.end()
    })

  child.stdout.on('data', function (chunk) {
    var i = 0;

    while (i < chunk.length) {
      uncompressStream.write(new Buffer([ chunk[i] ]))
      i++
    }
  })

  child.stdout.once('end', function () {
    uncompressStream.end()
  })

  child.stdin.write(largerInput)
  child.stdin.end()
})