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

console.log(chalk.underline(util.format('input size %s', bytes(input.length))))
console.log()
require('run-series')([
    function (done) {
      benchmark(
          'snappy.compress()'
        , snappy.compress.bind(snappy, input)
        , function (err, event) {
            console.log(chalk.white(event.target.toString()))
            snappy.compress(input, function (err, compressed) {
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
          'snappy.pureCompress()'
        , snappy.compress.bind(snappy, input)
        , function (err, event) {
            console.log(chalk.blue(event.target.toString()))
            snappy.pureCompress(input, function (err, compressed) {
              var str = util.format(
                  'compressed size %s (%s%)'
                , bytes(compressed.length)
                , round(compressed.length / input.length * 100)
              )
              console.log(chalk.blue(str))
              console.log()
              done()
            })
          }
      )
    }
  , function (done) {
      snappy.compress(input, function (err, compressed) {
        benchmark(
            'snappy.uncompress() asBuffer'
          , snappy.uncompress.bind(snappy, compressed, {asBuffer: true})
          , function (err, event) {
              console.log(chalk.white(event.target.toString()))
              done()
            }
        )
      })
    }
  , function (done) {
      snappy.pureCompress(input, function (err, compressed) {
        benchmark(
            'snappy.pureUncompress() asBuffer'
          , snappy.pureUncompress.bind(snappy, compressed, {asBuffer: true})
          , function (err, event) {
              console.log(chalk.blue(event.target.toString()))
              console.log()
              done()
            }
        )
      })
    }
  , function (done) {
      snappy.compress(input, function (err, compressed) {
        benchmark(
            'snappy.uncompress() asString'
          , snappy.uncompress.bind(snappy, compressed, {asBuffer: false})
          , function (err, event) {
              console.log(chalk.bgWhite(event.target.toString()))
              done()
            }
        )
      })
    }
  , function (done) {
      snappy.pureCompress(input, function (err, compressed) {
        benchmark(
            'snappy.pureUncompress() asString'
          , snappy.pureUncompress.bind(snappy, compressed, {asBuffer: false})
          , function (err, event) {
              console.log(chalk.bgBlue(event.target.toString()))
              done()
            }
        )
      })
    }
])
