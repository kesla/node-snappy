# snappy-stream

Compress data over a Stream using the snappy framing format

[![NPM](https://nodei.co/npm/snappy-stream.png?downloads&stars)](https://nodei.co/npm/snappy-stream/)

[![NPM](https://nodei.co/npm-dl/snappy-stream.png)](https://nodei.co/npm/snappy-stream/)

## Installation

```
npm install snappy-stream
```

## Example

### Input

```javascript
var snappyStream = require('./stream')
  , compressStream = snappyStream.createCompressStream()
  , uncompressStream = snappyStream.createUncompressStream({
      asBuffer: false // optional option, asBuffer = false means that the stream emits strings, default: true
    })

compressStream.on('data', function (chunk) {
  console.log('Som data from the compressed stream', chunk)
  uncompressStream.write(chunk)
})

uncompressStream.on('data', function (chunk) {
  console.log('The data that was originally written')
  console.log(chunk)
})

compressStream.write('hello')
compressStream.write('world')
compressStream.end()
```

### Output

```
Som data from the compressed stream <Buffer ff 06 00 00 73 4e 61 50 70 59>
Som data from the compressed stream <Buffer 01 09 00 00 bb 1f 82 a2>
Som data from the compressed stream <Buffer 68 65 6c 6c 6f>
The data that was originally written
hello
Som data from the compressed stream <Buffer 01 09 00 00 2d 4e 1f a5>
Som data from the compressed stream <Buffer 77 6f 72 6c 64>
The data that was originally written
world
```

## Running tests

The tests are using the [https://pypi.python.org/pypi/python-snappy](python-snappy) library, so you need to install that first for it to work.

## Licence

Copyright (c) 2014 David Björklund

This software is released under the MIT license:

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
