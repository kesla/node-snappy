binding = require('./build/default/binding')

exports.compress = (input) ->
	unless typeof input is 'string' or Buffer.isBuffer input
		input = JSON.stringify(input)
	binding.compress(input)

exports.isValidCompressed = binding.isValidCompressed

exports.parsers =
	json: (buffer) ->
		return JSON.parse buffer

	string: (buffer) ->
		return buffer.toString("utf8")
	
	raw: (buffer)->
		return buffer

exports.uncompress = (compressed, parse = @parsers.raw) ->
	return parse(binding.uncompress(compressed))

exports.decompress = exports.uncompress
