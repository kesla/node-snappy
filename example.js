// simple, and somewhat stupid example

snappy = require('./snappy')

console.log("Parse o json")
console.log(
	snappy.decompress(
		snappy.compress({"foo": "bar"}), snappy.parsers.json
	)
);

console.log("Parse to string")
comp = snappy.compress("foo foo foo  Fasfa daos asd foo foo foo asdasf bar bar aarr");
base64 = comp.toString('base64');
comp2 = new Buffer(base64, 'base64');
console.log(snappy.uncompress(comp2, snappy.parsers.string));

console.log("Raw buffer")
console.log(
	snappy.decompress(
		snappy.compress(
			"foobar foobar foobar foobar foobar foobar foobar foobar foobar"
		)
);
	)

