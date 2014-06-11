var bufferEqual = require('buffer-equal')
  , snappy = require('snappy')
  , through2 = require('through2')

  , IDENTIFIER = new Buffer([
      0xff, 0x06, 0x00, 0x00, 0x73, 0x4e, 0x61, 0x50, 0x70, 0x59
    ])

module.exports = {
    createUncompressStream: function (opts) {
      opts = opts || {}

      var asBuffer = opts.asBuffer
      if (typeof(asBuffer) !== 'boolean')
        asBuffer = true

      return through2({ objectMode: !asBuffer }, function (chunk, enc, callback) {
        var self = this

        if (!bufferEqual(chunk.slice(0, 10), IDENTIFIER))
          return callback(new Error('Bad identifier'))

        // move ahead after the identifier
        chunk = chunk.slice(10)

        if (chunk[0] === 0) {
          // compressed data
          // TODO: Check that the checksum matches
          chunk = chunk.slice(8)

          snappy.uncompress(chunk, opts, function (err, raw) {
            console.log(typeof(raw))
            self.push(raw)
            callback(null)
          })

        } else if (chunk[0] === 1) {
          // uncompressed data
          // TODO: Check that the checksum matches
          chunk = chunk.slice(8)

          if (!asBuffer)
            chunk = chunk.toString()

          self.push(chunk)
          callback(null)
        }
      })
    }
}