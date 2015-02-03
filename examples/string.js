var snappy = require('..') // require('snappy')

snappy.compress('beep boop', function(err, compressed) {

  console.log('compressed is a Buffer', compressed)
  // return it as a string
  snappy.uncompress(compressed, {
    asBuffer: false
  }, function(err, original) {

    console.log('the original String', original)
  })
})
