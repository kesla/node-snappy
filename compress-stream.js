var snappy = require('snappy')
  , through2 = require('through2')
  , crc32c = require('fast-crc32c').calculate

  , IDENTIFIER_FRAME = new Buffer([
      0xff, 0x06, 0x00, 0x00, 0x73, 0x4e, 0x61, 0x50, 0x70, 0x59
    ])
  , COMPRESSED = new Buffer([ 0x00 ])
  , UNCOMPRESSED = new Buffer([ 0x01 ])

  , frameSize = function (value) {
      return new Buffer([
        value, value >> 8, value >> 16
      ])
    }
  , checksum = function (value) {
      var x = crc32c(value)
        , buffer = new Buffer(4)

      // don't assert the size, since we're only interested in the parts that
      // are within the UInt32LE-size
      buffer.writeUInt32LE((((x >> 15) | (x << 17)) + 0xa282ead8), 0, true)

      return buffer
    }

  , createCompressStream = function () {
      var stream = through2(function (chunk, enc, callback) {
            var self = this

            snappy.compress(chunk, function (err, compressed) {
              if (err)
                return callback(err)

              if (compressed.length < chunk.length) {
                self.push(COMPRESSED)
                self.push(frameSize(compressed.length + 4))
                self.push(checksum(chunk))
                self.push(compressed)
              } else {
                self.push(UNCOMPRESSED)
                self.push(frameSize(chunk.length + 4))
                self.push(checksum(chunk))
                self.push(chunk)
              }
              callback()
            })



            /*
            this.push(new Buffer([
              0x01, 0x0d, 0x00, 0x00, 0x5c, 0xda, 0xf9, 0x77, 0x62, 0x65, 0x65, 0x70, 0x20, 0x62, 0x6f, 0x6f, 0x70
            ]))
            */
          })

      // add identifier
      stream.push(IDENTIFIER_FRAME)

      return stream
    }

module.exports = createCompressStream