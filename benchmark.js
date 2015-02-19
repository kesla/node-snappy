var benchmark = require('async-benchmark')
  , input = Buffer.concat([
          require('fs').readFileSync(__dirname + '/lib/compress-stream.js')
        , require('fs').readFileSync(__dirname + '/lib/uncompress-stream.js')
        , require('fs').readFileSync(__dirname + '/index.js')
      ])
  , snappy = require('./')
  , zlib = require('zlib')
  , exec = require('child_process').exec

  , benchmarkSnappy = function (callback) {
      var stream = snappy.createCompressStream()

      // read the initial identifier frame
      stream.once('data', function () {
        benchmark(
            'snappyStream.createCompressStream()'
          , function (done) {
              // read data twice - first emitted chunk is the header
              // and the second one is the payload
              stream.once('data', done)
              stream.write(input)
            }
          , function (err, event) {
              console.log(event.target.toString())
            }
        )
      })
    }
  , benchmarkGzip = function (callback) {
      var stream = zlib.createGzip({
        flush: zlib.Z_FULL_FLUSH
      })

      benchmark(
          'zlib.createGzip()'
        , function (done) {
            stream.once('data', done)
            stream.write(input)
          }
        , function (err, event) {
            console.log(event.target.toString())
          }
      )
    }
  , benchmarkPassThrough = function (callback) {
      var stream = require('stream').PassThrough()
      benchmark(
          'passthrough stream (no compression)'
        , function (done) {
            stream.once('data', done)
            stream.write(input)
          }
        , function (err, event) {
            console.log(event.target.toString())
          }
      )
    }
  , runBenchmarks = function () {
      exec('node ' + __filename + ' passthrough', function (err, stdout) {
        process.stdout.write(stdout)
        exec('node ' + __filename + ' gzip', function (err, stdout) {
          process.stdout.write(stdout)
          exec('node ' + __filename + ' snappy', function (err, stdout) {
            process.stdout.write(stdout)
          })
        })
      })
    }

if (process.argv[2] === 'snappy')
  benchmarkSnappy()

else if (process.argv[2] === 'gzip')
  benchmarkGzip()

else if (process.argv[2] === 'passthrough')
  benchmarkPassThrough()

else
  runBenchmarks()