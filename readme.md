# snappy [![Linux Status](https://img.shields.io/travis/kesla/node-snappy.svg?label=linux)](https://travis-ci.org/kesla/node-snappy)
[![FOSSA Status](https://app.fossa.io/api/projects/git%2Bgithub.com%2Fkesla%2Fnode-snappy.svg?type=shield)](https://app.fossa.io/projects/git%2Bgithub.com%2Fkesla%2Fnode-snappy?ref=badge_shield)

Nodejs bindings to the [snappy](https://github.com/google/snappy) compression library

[![NPM](https://nodei.co/npm/snappy.png?downloads&stars)](https://nodei.co/npm/snappy/)

[![NPM](https://nodei.co/npm-dl/snappy.png)](https://nodei.co/npm/snappy/)


## Installation

```bash
npm install snappy
```

## Example

### Input

```javascript
var snappy = require('snappy')

snappy.compress('beep boop', function (err, compressed) {
  console.log('compressed is a Buffer', compressed)
  // return it as a string
  snappy.uncompress(compressed, { asBuffer: false }, function (err, original) {
    console.log('the original String', original)
  })
})
```

### Output

```bash
compressed is a Buffer <SlowBuffer 09 20 62 65 65 70 20 62 6f 6f 70>
the original String beep boop
```

## API

### snappy.compress(input, callback)

Compress `input`, which can be a `Buffer` or a `String`.

The `callback` function will be called with a single `error` if the operation failed for any reason. If successful the first argument will be `null` and the second argument will be the `value` as a ``Buffer`.

### snappy.compressSync(input)

The synchronous version of `snappy.compress`, returns the compressed value.

### snappy.uncompress(compressed, [options,] callback)

Uncompress `compressed` and call `callback` with `err` and `decompressed`.

#### `options`

* `'asBuffer'` *(boolean, default: `true`)*: Used to determine whether to return the `value` of the entry as a `String` or a Node.js `Buffer` object. Note that converting from a `Buffer` to a `String` incurs a cost so if you need a `String` (and the `value` can legitimately become a UFT8 string) then you should fetch it as one with `asBuffer: true` and you'll avoid this conversion cost.

The `callback` function will be called with a single `error` if the operation failed for any reason. If successful the first argument will be `null` and the second argument will be the `value` as a `String` or `Buffer` depending on the `asBuffer` option.

### snappy.uncompressSync(compressed, [options])

The synchronous version of `snappy.uncompress`, returns the uncompressed value.

### snappy.isValidCompressed(input, callback)

Check is input is a valid compressed `Buffer`.

The `callback` function will be called with a single `error` if the operation failed for any reason and the second argument will be `true` if input is a valid snappy compressed Buffer, `false` otherwise.

### snappy.isValidCompressedSync(input)

The synchronous version of `snappy.isValidCompressed`, returns a boolean indicating if input was correctly compressed or not.

### stream

For a streaming interface to snappy, please take a look at [snappy-stream](https://www.npmjs.org/package/snappy-stream)

## [Benchmark](benchmark)

This is the result I'm seeing on my laptop (Macbook Air from 2012) running `node benchmark`

```bash
  snappy.compress() x 479 ops/sec ±0.99% (80 runs sampled)
  zlib.gzip() x 289 ops/sec ±1.66% (86 runs sampled)
  snappy.uncompress() x 652 ops/sec ±0.86% (43 runs sampled)
  zlib.gunzip() x 559 ops/sec ±1.65% (64 runs sampled)
```

## License

Copyright (c) 2011 - 2015 David Björklund & contributors

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.


[![FOSSA Status](https://app.fossa.io/api/projects/git%2Bgithub.com%2Fkesla%2Fnode-snappy.svg?type=large)](https://app.fossa.io/projects/git%2Bgithub.com%2Fkesla%2Fnode-snappy?ref=badge_large)