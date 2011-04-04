{exec, spawn} = require('child_process')

task 'compile', 'Compile Coffeescript source javascript', ->
	coffee1 = spawn 'coffee', '-c -b snappy.coffee'.split(' ')
	coffee1.stdout.on 'data', (data) -> console.log data.toString()
	coffee1.stderr.on 'data', (data) -> console.log data.toString()
