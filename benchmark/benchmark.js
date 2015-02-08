var util = require('util')
  , zlib = require('zlib')

  , benchmark = require('async-benchmark')
  , bytes = require('bytes')
  , chalk = require('chalk')

  , snappy = require('..')
  , input = require('fs').readFileSync(
      require('path').join(__dirname, '../deps/snappy/snappy-1.1.2/snappy.cc')
    )
  , round = function (number) {
      return Math.round(number * 100) / 100
    }
  , customGzip = function (data, callback) {
      var buffers = []
        , size = 0
        , gzip = new zlib.Gzip({
              level: zlib.Z_BEST_SPEED
            , memLevel: zlib.Z_MAX_MEMLEVEL
          })

      gzip.on('data', function (buffer) {
        buffers.push(buffer)
        size += buffer.length
      }).on('end', function () {
        callback(null, Buffer.concat(buffers, size))
      })

      gzip.write(data)
      gzip.end()
    }
  , customGunzip = function (data, callback) {

      var buffers = []
          , size = 0
          , gunzip = new zlib.Gunzip()

      gunzip.on('data', function (buffer) {
        buffers.push(buffer)
        size += buffer.length
      }).on('end', function () {
        callback(null, Buffer.concat(buffers, size))
      })

      gunzip.write(data)
      gunzip.end()
    }
  , customDeflate = function (data, callback) {
      var buffers = []
        , size = 0
        , deflate = new zlib.Deflate({
              level: zlib.Z_BEST_SPEED
            , memLevel: zlib.Z_MAX_MEMLEVEL
          })

      deflate.on('data', function (buffer) {
        buffers.push(buffer)
        size += buffer.length
      }).on('end', function () {
        callback(null, Buffer.concat(buffers, size))
      })

      deflate.write(data)
      deflate.end()
    }
  , customInflate = function (data, callback) {

      var buffers = []
          , size = 0
          , inflate = new zlib.Inflate()

      inflate.on('data', function (buffer) {
        buffers.push(buffer)
        size += buffer.length
      }).on('end', function () {
        callback(null, Buffer.concat(buffers, size))
      })

      inflate.write(data)
      inflate.end()
    }

console.log(chalk.underline(util.format('input size %s', bytes(input.length))))
console.log()
require('run-series')([
    function (done) {
      benchmark(
          'snappy.compress()'
        , snappy.compress.bind(snappy, input)
        , function (err, event) {
            console.log(chalk.blue(event.target.toString()))
            snappy.compress(input, function (err, compressed) {
              var str = util.format(
                  'compressed size %s (%s%)'
                , bytes(compressed.length)
                , round(compressed.length / input.length * 100)
              )
              console.log(chalk.blue(str))
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
            console.log(chalk.yellow(event.target.toString()))
            zlib.gzip(input, function (err, compressed) {
              var str = util.format(
                  'compressed size %s (%s%)'
                , bytes(compressed.length)
                , round(compressed.length / input.length * 100)
              )
              console.log(chalk.yellow(str))
              done()
            })
          }
      )
    }
  , function (done) {
      benchmark(
        'zlib.deflate()'
        , zlib.deflate.bind(zlib, input)
        , function (err, event) {
          console.log(chalk.white(event.target.toString()))
          zlib.deflate(input, function (err, compressed) {
            var str = util.format(
              'compressed size %s (%s%)'
              , bytes(compressed.length)
              , round(compressed.length / input.length * 100)
            )
            console.log(chalk.white(str))
            done()
          })
        }
      )
    }
  , function (done) {
      benchmark(
          'zlib.Gzip with custom options'
        , customGzip.bind(zlib, input)
        , function (err, event) {
            console.log(chalk.magenta(event.target.toString()))
            customGzip(input, function (err, compressed) {
              var str = util.format(
                  'compressed size %s (%s%)'
                , bytes(compressed.length)
                , round(compressed.length / input.length * 100)
              )
              console.log(chalk.magenta(str))
              done()
            })
          }
      )
    }
  , function (done) {
      benchmark(
          'zlib.Deflate with custom options'
        , customDeflate.bind(zlib, input)
        , function (err, event) {
            console.log(chalk.green(event.target.toString()))
            customDeflate(input, function (err, compressed) {
              var str = util.format(
                  'compressed size %s (%s%)'
                , bytes(compressed.length)
                , round(compressed.length / input.length * 100)
              )
              console.log(chalk.green(str))
              console.log()
              done()
            })
          }
      )
    }
  , function (done) {
      snappy.compress(input, function (err, compressed) {
        benchmark(
            'snappy.uncompress()'
          , snappy.uncompress.bind(snappy, compressed, {asBuffer: true})
          , function (err, event) {
              console.log(chalk.blue(event.target.toString()))
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
              console.log(chalk.yellow(event.target.toString()))
              done()
            }
        )
      })
    }
  , function (done) {
      zlib.deflate(input, function (err, compressed) {
        benchmark(
          'zlib.inflate()'
          , zlib.inflate.bind(zlib, compressed)
          , function (err, event) {
              console.log(chalk.white(event.target.toString()))
              done()
          }
        )
      })
    }
  , function (done) {
      customGzip(input, function (err, compressed) {
        benchmark(
          'zlib.Gunzip with custom options'
          , customGunzip.bind(zlib, compressed)
          , function (err, event) {
              console.log(chalk.magenta(event.target.toString()))
              done()
          }
        )
      })
    }
  , function (done) {
      customDeflate(input, function (err, compressed) {
        benchmark(
          'zlib.Inflate with custom options'
          , customInflate.bind(zlib, compressed)
          , function (err, event) {
              console.log(chalk.green(event.target.toString()))
              done()
          }
        )
      })
    }
])
