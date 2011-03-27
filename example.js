// simple, and somewhat stupid example

snappy = require('./build/default/snappy')

comp = binding.compress("foo foo foo  Fasfa daos asd foo foo foo asdasf bar bar aarr")
base64 = comp.toString('base64')
comp2 = new Buffer(base64, 'base64')
console.log(binding.uncompress(comp2))
console.log(
	binding.uncompress(
		binding.compress(
			"foobar foobar foobar foobar foobar foobar foobar foobar foobar"
		)
	)
)
