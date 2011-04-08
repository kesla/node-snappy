binding = require('./build/default/binding')

exports.compress = (input, callback) ->
	unless typeof input is 'string' or Buffer.isBuffer input
		input = JSON.stringify(input)
	compressed = binding.compress(input)
	callback false, compressed

exports.isValidCompressed = (input, callback) ->
  valid = binding.isValidCompressed input
  callback false, valid

exports.parsers =
	json: (buffer) ->
		return JSON.parse buffer

	string: (buffer) ->
		return buffer.toString("utf8")
	
	raw: (buffer)->
		return buffer

exports.uncompress = (compressed, callback, parse = @parsers.raw) ->
  data = parse(binding.uncompress(compressed))
  callback(false, data)

exports.decompress = exports.uncompress
