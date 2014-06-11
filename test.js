var spawn = require('child_process').spawn

  , test = require('tap').test

test('uncompress small string', function (t) {
  var child = spawn('python', [ '-m', 'snappy', '-c' ])
    , uncompressStream = require('./stream').createUncompressStream({ asBuffer: false })
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

  child.stdin.write('beep')
  child.stdin.write(' ')
  child.stdin.write('boop')
  child.stdin.end()
})

test('uncompress small Buffer', function (t) {
  var child = spawn('python', [ '-m', 'snappy', '-c' ])
    , uncompressStream = require('./stream').createUncompressStream({ asBuffer: true })
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