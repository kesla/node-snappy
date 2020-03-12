'use strict'

import test from 'ava'
import snappy from './snappy'
import { promisify } from 'bluebird'

const inputString = 'beep boop, hello world. OMG OMG OMG'
const inputBuffer = Buffer.from(inputString)
const compress = promisify(snappy.compress)
const isValidCompressed = promisify(snappy.isValidCompressed)
const uncompress = promisify(snappy.uncompress)
const { compressSync, isValidCompressedSync, uncompressSync } = snappy

test('compress() string', async function (t) {
  const buffer = await compress(inputString)
  t.truthy(Buffer.isBuffer(buffer), 'should return a Buffer')
})

test('compress() buffer', async function (t) {
  const buffer = await compress(inputBuffer)
  t.truthy(Buffer.isBuffer(buffer), 'should return a Buffer')
})

test('compress() bad input', async function (t) {
  t.plan(1)

  try {
    await compress(123)
  } catch (err) {
    t.is(err.message, 'input must be a String or a Buffer')
  }
})

test('compressSync() string', async function (t) {
  const buffer = compressSync(inputString)
  t.truthy(Buffer.isBuffer(buffer), 'should return a Buffer')
})

test('compressSync() buffer', async function (t) {
  const buffer = compressSync(inputBuffer)
  t.truthy(Buffer.isBuffer(buffer), 'should return a Buffer')
})

test('isValidCompressed() on valid data', async function (t) {
  const compressed = await compress(inputBuffer)
  const isCompressed = await isValidCompressed(compressed)
  t.truthy(isCompressed)
})

test('isValidCompressed() on invalid data', async function (t) {
  const isCompressed = await isValidCompressed(Buffer.from('beep boop'))
  t.falsy(isCompressed)
})

test('isValidCompressedSync() on valid data', async function (t) {
  const compressed = await compress(inputBuffer)
  const isCompressed = isValidCompressedSync(compressed)
  t.truthy(isCompressed)
})

test('isValidCompressedSync() on invalid data', async function (t) {
  const isCompressed = isValidCompressedSync(Buffer.from('beep boop'))
  t.falsy(isCompressed)
})

test('uncompress() defaults to Buffer', async function (t) {
  const compressed = await compress(inputBuffer)
  const buffer = await uncompress(compressed)
  t.deepEqual(buffer, inputBuffer)
})

test('uncompress() returning a Buffer', async function (t) {
  const compressed = await compress(inputBuffer)
  const buffer = await uncompress(compressed, { asBuffer: true })
  t.deepEqual(buffer, inputBuffer)
})

test('uncompress() returning a String', async function (t) {
  const compressed = await compress(inputBuffer)
  const string = await uncompress(compressed, { asBuffer: false })
  t.deepEqual(string, inputString)
})

test('uncompress() does not change opts', async function (t) {
  const compressed = await compress(inputBuffer)
  const opts = {}
  await uncompress(compressed, opts)
  t.deepEqual(opts, {})
})

test('uncompress() on bad input', async function (t) {
  t.plan(1)

  try {
    await uncompress(Buffer.from('beep boop OMG OMG OMG'))
  } catch (err) {
    t.is(err.message, 'Invalid input')
  }
})

test('uncompress() on not a Buffer', async function (t) {
  t.plan(1)

  try {
    await uncompress('beep boop OMG OMG OMG')
  } catch (err) {
    t.is(err.message, 'input must be a Buffer')
  }
})

test('uncompressSync() defaults to Buffer', async function (t) {
  const compressed = await compress(inputBuffer)
  const buffer = uncompressSync(compressed)
  t.deepEqual(buffer, inputBuffer)
})

test('uncompressSync() returning a Buffer', async function (t) {
  const compressed = await compress(inputBuffer)
  const buffer = uncompressSync(compressed, { asBuffer: true })
  t.deepEqual(buffer, inputBuffer)
})

test('uncompressSync() returning a String', async function (t) {
  const compressed = await compress(inputBuffer)
  const string = uncompressSync(compressed, { asBuffer: false })
  t.deepEqual(string, inputString)
})

test('uncompressSync() does not change opts', async function (t) {
  const compressed = await compress(inputBuffer)
  const opts = {}
  uncompressSync(compressed, opts)
  t.deepEqual(opts, {})
})

test('uncompressSync() on bad input', async function (t) {
  t.throws(function () {
    uncompressSync(Buffer.from('beep boop OMG OMG OMG'))
  }, { message: 'Invalid input' })
})
