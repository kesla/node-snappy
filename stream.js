var snappy = require('snappy')
  , through2 = require('through2')

module.exports = {
    createUncompressStream: function (opts) {
      opts = opts || {}

      var asBuffer = opts.asBuffer
      if (typeof(asBuffer) !== 'boolean')
        asBuffer = true

      return through2({ objectMode: !asBuffer }, function (chunk, enc, callback) {
        var self = this

        // TODO: Check that the identifier is correct
        // for now, just moving ahead
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