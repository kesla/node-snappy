var zlib = require('zlib')

  , benchmark = require('async-benchmark')

  , snappy = require('./lib/snappy')
  , input = require('fs').readFileSync(
      __dirname + '/deps/snappy/snappy-1.1.2/snappy.cc'
    )

benchmark(
    'snappy.compress()'
  , function (done) {
      snappy.compress(input, done)
    }
  , function (err, event) {
      console.log(event.target.toString())
      benchmark(
          'zlib.gzip()'
        , function (done) {
            zlib.gzip(input, done)
          }
        , function (err, event) {
            console.log(event.target.toString())
            snappy.compress(input, function (err, compressed) {
              benchmark(
                  'snappy.uncompress()'
                , function (done) {
                    snappy.uncompress(compressed, done)
                  }
                , function (err, event) {
                    console.log(event.target.toString())
                    zlib.gzip(input, function (err, compressed) {
                      benchmark(
                          'zlib.gunzip()'
                        , function (done) {
                            zlib.gunzip(compressed, done)
                          }
                        , function (err, event) {
                            console.log(event.target.toString())
                          }
                      )
                    })
                  }
              )
            })
          }
      )
    }
)