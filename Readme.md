# Node-snappy [![Build Status](https://secure.travis-ci.org/kesla/node-snappy.png)](http://travis-ci.org/kesla/node-snappy)

[![NPM](https://nodei.co/npm/snappy.png?downloads)](https://nodei.co/npm/snappy/)

## About

Node module/wrapper for Google's fast compressor/decompressor: <http://code.google.com/p/snappy/>

Snappy is a compression/decompression library. It does not aim for maximum compression, or compatibility with any other compression library; instead, it aims for very high speeds and reasonable compression. For instance, compared to the fastest mode of zlib, Snappy is an order of magnitude faster for most inputs, but the resulting compressed files are anywhere from 20% to 100% bigger. On a single core of a Core i7 processor in 64-bit mode, Snappy compresses at about 250 MB/sec or more and decompresses at about 500 MB/sec or more.

Snappy is widely used inside Google, in everything from BigTable and MapReduce to our internal RPC systems. (Snappy has previously been referred to as “Zippy” in some presentations and the likes.)

## Installation

```
  npm install snappy
```

## Examples
### String
```js
var snappy = require('snappy');
// Use synchronous version
var compressed = snappy.compressSync('string to compress');
var result = snappy.decompressSync(compressed, snappy.parsers.string);
// result will be string instead of Buffer
console.log(result);
```

### JSON
```js
var snappy = require('snappy');
// Snappy automatically convert json to a string
snappy.compress({"foo": "bar"}, function(err, compressed){
  snappy.decompress(compressed, snappy.parsers.json, function(err, result){
    // result will be json instead of Buffer
    console.log(result["foo"]);
  });
});
```

## API
### snappy.compress(input, cb)

Compress `input`, which can be a Buffer, String or arbitrary JavaScript object and call `cb` with `err` and `compressed`.

### snappy.compressSync(input)

Compress `input`, which can be a Buffer, String or arbitrary JavaScript object and return `compressed`. Throws if an error occurs.

### snappy.decompress(compressed, parse, cb)

Decompress `compressed` using `parse` as parser (defaults to `raw`) and call `cb` with `err` and `decompressed`.

### snappy.decompressSync(str, parse)

Decompress `compressed` using `parse` as parser (defaults to `raw`) and return `decompressed`. Throws if an error occurs.

## Parsers

* json
* string
* raw

## License
Copyright (c) 2013 David Björklund

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
