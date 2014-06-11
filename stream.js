var bufferEqual = require('buffer-equal')
  , BufferList = require('bl')
  , snappy = require('snappy')
  , through2 = require('through2')

  , IDENTIFIER = new Buffer([
      0x73, 0x4e, 0x61, 0x50, 0x70, 0x59
    ])
  , frameSize = function (buffer) {
      return buffer.get(0) + (buffer.get(1) << 8) + (buffer.get(2) << 16)
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

module.exports = {
    createUncompressStream: function (opts) {
      opts = opts || {}

      var asBuffer = typeof(opts.asBuffer) === 'boolean' ? opts.asBuffer : true
        , buffer = new BufferList()
        , foundIdentifier = false
        , stream = through2({ objectMode: !asBuffer }, function (chunk, enc, callback) {
            buffer.append(chunk)

            parse(callback)
          })
        , parse = function (callback) {
            if (buffer.length < 4)
              return callback()

            var size = frameSize(buffer.slice(1))
              , type = getType(buffer.get(0))
              , data = buffer.slice(4, 4 + size)

            if (buffer.length - 4 < size)
              return callback()

            buffer.consume(4 + size)

            if (!foundIdentifier && type !== 'identifier')
              return callback(new Error('malformed input: must begin with an identifier'))

            if (type === 'identifier') {
              if(!bufferEqual(data, IDENTIFIER))
                return callback(new Error('malformed input: bad identifier'))

              foundIdentifier = true
              return parse(callback)
            }

            if (type === 'compressed') {
              // TODO: check that the checksum matches
              snappy.uncompress(data.slice(4), { asBuffer: asBuffer }, function (err, raw) {
                stream.push(raw)
                parse(callback)
              })
              return
            }
            if (type === 'uncompressed') {
              // TODO: check that the checksum matches
              data = data.slice(4)

              if (!asBuffer)
                data = data.toString()

              stream.push(data)
              parse(callback)
            }
          }

      return stream
    }
}