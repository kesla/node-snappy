var spawn = require('child_process').spawn

  , test = require('tap').test

test('uncompress', function (t) {
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