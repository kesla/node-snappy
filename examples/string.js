var snappy = require('..'); // require('snappy')

snappy.compress('beep boop', function (err, compressed) {
  if (err) {
    throw err;
  }
  console.log('compressed is a Buffer', compressed);
  // return it as a string
  snappy.uncompress(compressed, {
    asBuffer: false
  }, function (err, original) {
    if (err) {
      throw err;
    }
    console.log('the original String', original);
  });
});
