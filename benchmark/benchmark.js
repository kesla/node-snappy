var zlib = require('zlib')

  , benchmark = require('async-benchmark')
  , bytes = require('bytes')

  , snappy = require('../snappy')
  , input = require('fs').readFileSync(
      require('path').join(__dirname, '../deps/snappy/snappy-1.1.2/snappy.cc')
    )
  , round = function (number) {
      return Math.round(number * 100) / 100
    }
  , customGzip = function (callback) {
      var buffers = []
        , size = 0
        , gzip = new zlib.Gzip({
              level: zlib.Z_BEST_SPEED
            , memLevel: zlib.Z_MAX_MEMLEVEL
          })

      gzip.on('data', function (buffer) {
        buffers.push(buffer)
        size += buffer.length
      })

      gzip.on('end', function () {
        callback(null, Buffer.concat(buffers, size))
        buffers.length = 0
      })

      gzip.write(input)

      gzip.end()
    }

console.log('input size', bytes(input.length))
require('run-series')([
    function (done) {
      benchmark(
          'snappy.compress()'
        , snappy.compress.bind(snappy, input)
        , function (err, event) {
            console.log(event.target.toString())
            snappy.compress(input, function (err, compressed) {
              console.log(
                  'compressed size'
                , bytes(compressed.length)
                , '(' + round(compressed.length / input.length * 100) + '%)'
              )
              done()
            })
          }
      )
    }
  , function (done) {
      benchmark(
          'zlib.gzip()'
        , zlib.gzip.bind(zlib, input)
        , function (err, event) {
            console.log(event.target.toString())
            zlib.gzip(input, function (err, compressed) {
              console.log(
                  'compressed size'
                , bytes(compressed.length)
                , '(' + round(compressed.length / input.length * 100) + '%)'
              )
              done()
            })
          }
      )
    }
  , function (done) {
      benchmark(
          'zlib.Gzip with custom options'
        , customGzip
        , function (err, event) {
            console.log(event.target.toString())
            customGzip(function (err, compressed) {
              console.log(
                  'compressed size'
                , bytes(compressed.length)
                , '(' + round(compressed.length / input.length * 100) + '%)'
              )
              done()
            })
          }
      )
    }
  , function (done) {
      snappy.compress(input, function (err, compressed) {
        benchmark(
            'snappy.uncompress()'
          , snappy.uncompress.bind(snappy, compressed)
          , function (err, event) {
              console.log(event.target.toString())
              done()
            }
        )
      })
    }
  , function (done) {
      zlib.gzip(input, function (err, compressed) {
        benchmark(
            'zlib.gunzip()'
          , zlib.gunzip.bind(zlib, compressed)
          , function (err, event) {
              console.log(event.target.toString())
              done()
            }
        )
      })
    }
])
