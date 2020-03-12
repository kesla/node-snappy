// @ts-check
const binding = require('bindings')('binding')
const assert = require('assert')

/**
 * @param {{ (arg0: (err: any, result?: any) => void): void; }} callback
 */
const wrapInPromise = callback => {
  return new Promise((resolve, reject) => {
    callback((error, result) => {
      if (error) {
        reject(error)
      } else {
        resolve(result)
      }
    })
  })
}

/**
 * Compress asyncronous.
 * If input isn't a string or buffer, automatically convert to buffer by using
 * JSON.stringify.
 * @param {string|Buffer} input
 * @returns {Promise<Buffer>}
 */
exports.compress = input =>
  wrapInPromise(callback => {
    if (!(typeof input === 'string' || Buffer.isBuffer(input))) {
      return callback(new Error('input must be a String or a Buffer'), null)
    }

    binding.compress(input, callback)
  })

/**
 * @param {string|Buffer} input
 * @returns {Buffer}
 */
exports.compressSync = function(input) {
  assert(
    typeof input === 'string' || Buffer.isBuffer(input),
    'input must be a String or a Buffer'
  )

  return binding.compressSync(input)
}

/**
 * Asyncronous decide if a buffer is compressed in a correct way.
 *
 * @param {Buffer} input
 * @returns {Promise<boolean>}
 */
exports.isValidCompressed = input =>
  wrapInPromise(callback => {
    binding.isValidCompressed(input, callback)
  })

/**
 * @type {(buffer: Buffer) => boolean}
 */
exports.isValidCompressedSync = binding.isValidCompressedSync

/**
 * Asyncronous uncompress previously compressed data.
 *
 * @param {Buffer} compressed
 * @param {any} [opts]
 * @returns {Promise<string|Buffer>}
 */
exports.uncompress = (compressed, opts) =>
  wrapInPromise(callback => {
    if (!callback) {
      callback = opts
    }

    if (!Buffer.isBuffer(compressed)) {
      return callback(new Error('input must be a Buffer'))
    }

    binding.uncompress(compressed, uncompressOpts(opts), callback)
  })

/**
 * @param {Buffer} compressed
 * @param {any} [opts]
 * @return {string|Buffer}
 */ exports.uncompressSync = function(compressed, opts) {
  assert(Buffer.isBuffer(compressed), 'input must be a Buffer')

  return binding.uncompressSync(compressed, uncompressOpts(opts))
}

/**
 * @param {any} opts
 */
function uncompressOpts(opts) {
  return opts && typeof opts.asBuffer === 'boolean' ? opts : { asBuffer: true }
}
