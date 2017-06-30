#!/usr/bin/env node

var fs = require('fs')
var glob = require('glob')
var expect = require('expect')

var ReadmeInjector = require('./src/readme.js')

glob('test/fixtures/*.before.md', function (err, files) {
  var contents
  for (var i = 0; i < files.length; i++) {
  	contents = fs.readFileSync(files[i]).toString().trim()
  	if (!contents) continue
    fs.writeFileSync(
    	files[i].slice(0, -10) + '.after.md',
    	ReadmeInjector.transform(contents, 'git+demo$demo')
  	)
  }
})
