
var Transform = require('stream').Transform
  , util = require('util')

  , bufferEqual = require('buffer-equal')
  , BufferList = require('bl')
  , snappy = require('snappy')

  , IDENTIFIER = new Buffer([
      0x73, 0x4e, 0x61, 0x50, 0x70, 0x59
    ])
  , frameSize = function (buffer, offset) {
      return buffer.get(offset) + (buffer.get(offset + 1) << 8) + (buffer.get(offset + 2) << 16)
    }
  , getType = function (value) {
      if (value === 0xff)
        return 'identifier'
      if (value === 0x00)
        return 'compressed'
      if (value === 0x01)
        return 'uncompressed'
      // TODO: Handle the other cases described in the spec
    }

  , UncompressStream = function (opts) {
      var asBuffer = (opts && typeof(opts.asBuffer) === 'boolean') ? opts.asBuffer : true

      Transform.call(this, { objectMode: !asBuffer })
      this.asBuffer = asBuffer
      this.foundIdentifier = false
      this.buffer = new BufferList()
    }

util.inherits(UncompressStream, Transform)

UncompressStream.prototype._parse = function (callback) {
  if (this.buffer.length < 4)
    return callback()

  var self = this
    , size = frameSize(this.buffer, 1)
    , type = getType(this.buffer.get(0))
    , data = this.buffer.slice(4, 4 + size)

  if (this.buffer.length - 4 < size)
    return callback()

  this.buffer.consume(4 + size)

  if (!this.foundIdentifier && type !== 'identifier')
    return callback(new Error('malformed input: must begin with an identifier'))

  if (type === 'identifier') {
    if(!bufferEqual(data, IDENTIFIER))
      return callback(new Error('malformed input: bad identifier'))

    this.foundIdentifier = true
    return this._parse(callback)
  }

  if (type === 'compressed') {
    // TODO: check that the checksum matches
    snappy.uncompress(data.slice(4), { asBuffer: this.asBuffer }, function (err, raw) {
      self.push(raw)
      self._parse(callback)
    })
    return
  }

  if (type === 'uncompressed') {
    // TODO: check that the checksum matches
    data = data.slice(4)

    if (!this.asBuffer)
      data = data.toString()

    this.push(data)
    this._parse(callback)
  }
}

UncompressStream.prototype._transform = function (chunk, enc, callback) {
  this.buffer.append(chunk)
  this._parse(callback)
}

module.exports = UncompressStream