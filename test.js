'use strict';

import test from 'ava';
import snappy from './snappy';
import Promise from 'bluebird';

const inputString = 'beep boop, hello world. OMG OMG OMG';
const inputBuffer = Buffer.from(inputString);
const compress = Promise.promisify(snappy.compress);
const isValidCompressed = Promise.promisify(snappy.isValidCompressed);
const uncompress = Promise.promisify(snappy.uncompress);
const {compressSync, isValidCompressedSync, uncompressSync} = snappy;

test('compress() string', function * (t) {
  const buffer = yield compress(inputString);
  t.truthy(Buffer.isBuffer(buffer), 'should return a Buffer');
});

test('compress() buffer', function * (t) {
  const buffer = yield compress(inputBuffer);
  t.truthy(Buffer.isBuffer(buffer), 'should return a Buffer');
});

test('compress() bad input', function * (t) {
  yield t.throws(compress(123), 'input must be a String or a Buffer');
});

test('compressSync() string', function * (t) {
  const buffer = compressSync(inputString);
  t.truthy(Buffer.isBuffer(buffer), 'should return a Buffer');
});

test('compressSync() buffer', function * (t) {
  const buffer = compressSync(inputBuffer);
  t.truthy(Buffer.isBuffer(buffer), 'should return a Buffer');
});

test('isValidCompressed() on valid data', function * (t) {
  const compressed = yield compress(inputBuffer);
  const isCompressed = yield isValidCompressed(compressed);
  t.truthy(isCompressed);
});

test('isValidCompressed() on invalid data', function * (t) {
  const isCompressed = yield isValidCompressed(Buffer.from('beep boop'));
  t.falsy(isCompressed);
});

test('isValidCompressedSync() on valid data', function * (t) {
  const compressed = yield compress(inputBuffer);
  const isCompressed = isValidCompressedSync(compressed);
  t.truthy(isCompressed);
});

test('isValidCompressedSync() on invalid data', function * (t) {
  const isCompressed = isValidCompressedSync(Buffer.from('beep boop'));
  t.falsy(isCompressed);
});

test('uncompress() defaults to Buffer', function * (t) {
  const compressed = yield compress(inputBuffer);
  const buffer = yield uncompress(compressed);
  t.deepEqual(buffer, inputBuffer);
});

test('uncompress() returning a Buffer', function * (t) {
  const compressed = yield compress(inputBuffer);
  const buffer = yield uncompress(compressed, { asBuffer: true });
  t.deepEqual(buffer, inputBuffer);
});

test('uncompress() returning a String', function * (t) {
  const compressed = yield compress(inputBuffer);
  const string = yield uncompress(compressed, { asBuffer: false });
  t.deepEqual(string, inputString);
});

test('uncompress() does not change opts', function * (t) {
  const compressed = yield compress(inputBuffer);
  const opts = {};
  yield uncompress(compressed, opts);
  t.deepEqual(opts, {});
});

test('uncompress() on bad input', function * (t) {
  yield t.throws(uncompress(Buffer.from('beep boop OMG OMG OMG'), 'Invalid input'));
});

test('uncompress() on not a Buffer', function * (t) {
  yield t.throws(uncompress('beep boop OMG OMG OMG', 'input must be a Buffer'));
});

test('uncompressSync() defaults to Buffer', function * (t) {
  const compressed = yield compress(inputBuffer);
  const buffer = uncompressSync(compressed);
  t.deepEqual(buffer, inputBuffer);
});

test('uncompressSync() returning a Buffer', function * (t) {
  const compressed = yield compress(inputBuffer);
  const buffer = uncompressSync(compressed, { asBuffer: true });
  t.deepEqual(buffer, inputBuffer);
});

test('uncompressSync() returning a String', function * (t) {
  const compressed = yield compress(inputBuffer);
  const string = uncompressSync(compressed, { asBuffer: false });
  t.deepEqual(string, inputString);
});

test('uncompress() does not change opts', function * (t) {
  const compressed = yield compress(inputBuffer);
  const opts = {};
  uncompressSync(compressed, opts);
  t.deepEqual(opts, {});
});

test('uncompressSync() on bad input', function * (t) {
  t.throws(function () {
    uncompressSync(Buffer.from('beep boop OMG OMG OMG'));
  }, 'Invalid input');
});
