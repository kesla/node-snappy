var CompressStream = require('./compress-stream')

module.exports = {
    createUncompressStream: require('./uncompress-stream')
  , createCompressStream: function () {
      return new CompressStream()
    }
}