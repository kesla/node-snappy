binding = require('./build/default/binding')

exports.compress = (input) ->
	unless typeof input is 'string' or Buffer.isBuffer input
		input = JSON.stringify(input)
	binding.compress(input)

exports.uncompress = (compressed) ->
	ret = binding.uncompress(compressed)
	try
		return JSON.parse ret
		console.log "foo"
	catch e
	return ret

exports.decompress = exports.uncompress
