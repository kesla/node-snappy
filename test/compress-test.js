var spawn = require('child_process').spawn

  , createCompressStream = require('../').createCompressStream
  , test = require('tap').test
  , largerInput = require('fs').readFileSync(__filename)
  , largerInputString = largerInput.toString()

test('compress small string', function (t) {
  var child = spawn('python', [ '-m', 'snappy', '-d' ])
    , compressStream = createCompressStream()
    , data = ''

  child.stdout.on('data', function (chunk) {
    data = data + chunk.toString()
  })

  child.stdout.on('end', function () {
    t.equal(data, 'beep boop')
    t.end()
  })

  child.stderr.pipe(process.stderr)

  compressStream.pipe(child.stdin)

  compressStream.write('beep boop')
  compressStream.end()
})

test('compress large string', function (t) {
  var child = spawn('python', [ '-m', 'snappy', '-d' ])
    , compressStream = createCompressStream()
    , data = ''

  child.stdout.on('data', function (chunk) {
    data = data + chunk.toString()
  })

  child.stdout.on('end', function () {
    t.equal(data, largerInputString)
    t.end()
  })

  child.stderr.pipe(process.stderr)

  compressStream.pipe(child.stdin)

  compressStream.write(largerInputString)
  compressStream.end()
})
