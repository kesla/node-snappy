var snappyStream = require('./index.js')
  , compressStream = snappyStream.createCompressStream()
  , uncompressStream = snappyStream.createUncompressStream({
      asBuffer: false // optional option, asBuffer = false means that the stream emits strings, default: true
    })

compressStream.on('data', function (chunk) {
  console.log('Som data from the compressed stream', chunk)
  uncompressStream.write(chunk)
})

uncompressStream.on('data', function (chunk) {
  console.log('The data that was originally written')
  console.log(chunk)
})

compressStream.write('hello')
compressStream.write('world')
compressStream.end()