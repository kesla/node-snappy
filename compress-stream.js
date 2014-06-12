var Transform = require('stream').Transform
  , util = require('util')

  , snappy = require('snappy')

  , checksum = require('./checksum')

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

  , CompressStream = function () {
      if (!(this instanceof CompressStream))
        return new CompressStream()

      Transform.call(this)
      this.push(IDENTIFIER_FRAME)
    }

util.inherits(CompressStream, Transform)


CompressStream.prototype._transform = function (chunk, enc, callback) {
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
}

module.exports = CompressStream