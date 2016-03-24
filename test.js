'use strict';

import test from 'ava';
import snappy from './snappy';
import Promise from 'bluebird';

const inputString = 'beep boop, hello world. OMG OMG OMG';
const inputBuffer = new Buffer(inputString);
const compress = Promise.promisify(snappy.compress);
const isValidCompressed = Promise.promisify(snappy.isValidCompressed);
const uncompress = Promise.promisify(snappy.uncompress);
const {compressSync, isValidCompressedSync, uncompressSync} = snappy;

test('compress() string', function * (t) {
  const buffer = yield compress(inputString);
  t.ok(Buffer.isBuffer(buffer), 'should return a Buffer');
});

test('compress() buffer', function * (t) {
  const buffer = yield compress(inputBuffer);
  t.ok(Buffer.isBuffer(buffer), 'should return a Buffer');
});

test('compress() bad input', function * (t) {
  t.throws(compress(123), 'input must be a String or a Buffer');
});

test('compressSync() string', function * (t) {
  const buffer = compressSync(inputString);
  t.ok(Buffer.isBuffer(buffer), 'should return a Buffer');
});

test('compressSync() buffer', function * (t) {
  const buffer = compressSync(inputBuffer);
  t.ok(Buffer.isBuffer(buffer), 'should return a Buffer');
});

test('isValidCompressed() on valid data', function * (t) {
  const compressed = yield compress(inputBuffer);
  const isCompressed = yield isValidCompressed(compressed);
  t.ok(isCompressed);
});

test('isValidCompressed() on invalid data', function * (t) {
  const isCompressed = yield isValidCompressed(new Buffer('beep boop'));
  t.notOk(isCompressed);
});

test('isValidCompressedSync() on valid data', function * (t) {
  const compressed = yield compress(inputBuffer);
  const isCompressed = isValidCompressedSync(compressed);
  t.ok(isCompressed);
});

test('isValidCompressedSync() on invalid data', function * (t) {
  const isCompressed = isValidCompressedSync(new Buffer('beep boop'));
  t.notOk(isCompressed);
});

test('uncompress() defaults to Buffer', function * (t) {
  const compressed = yield compress(inputBuffer);
  const buffer = yield uncompress(compressed);
  t.same(buffer, inputBuffer);
});

test('uncompress() returning a Buffer', function * (t) {
  const compressed = yield compress(inputBuffer);
  const buffer = yield uncompress(compressed, { asBuffer: true });
  t.same(buffer, inputBuffer);
});

test('uncompress() returning a String', function * (t) {
  const compressed = yield compress(inputBuffer);
  const string = yield uncompress(compressed, { asBuffer: false });
  t.same(string, inputString);
});

test('uncompress() on bad input', function * (t) {
  t.throws(uncompress(new Buffer('beep boop OMG OMG OMG'), 'Invalid input'));
});

test('uncompress() on not a Buffer', function * (t) {
  t.throws(uncompress('beep boop OMG OMG OMG', 'input must be a Buffer'));
});

test('uncompressSync() defaults to Buffer', function * (t) {
  const compressed = yield compress(inputBuffer);
  const buffer = uncompressSync(compressed);
  t.same(buffer, inputBuffer);
});

test('uncompressSync() returning a Buffer', function * (t) {
  const compressed = yield compress(inputBuffer);
  const buffer = uncompressSync(compressed, { asBuffer: true });
  t.same(buffer, inputBuffer);
});

test('uncompressSync() returning a String', function * (t) {
  const compressed = yield compress(inputBuffer);
  const string = uncompressSync(compressed, { asBuffer: false });
  t.same(string, inputString);
});

test('uncompressSync() on bad input', function * (t) {
  t.throws(function () {
    uncompressSync(new Buffer('beep boop OMG OMG OMG'));
  }, 'Invalid input');
});
