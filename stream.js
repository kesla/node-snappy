var CompressStream = require('./compress-stream')
  , UncompressStream = require('./uncompress-stream')

module.exports = {
    createUncompressStream: function (opts) {
      return new UncompressStream(opts)
    }
  , createCompressStream: function () {
      return new CompressStream()
    }
}