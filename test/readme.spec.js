var fs = require('fs')
var glob = require('glob')
var expect = require('expect')

var ReadmeInjector = require('../src/readme.js')

describe('Readme', function () {
  it('should pass fixture test cases', function (done) {
    glob('test/fixtures/*.before.md', function (err, files) {
      if (err) done(err)

      var beforeTestCase
      var transformedTestCase
      var afterTestCase

      for (var i = 0; i < files.length; i++) {
        var beforeTestCase = fs.readFileSync(files[i]).toString().trim()
        var afterTestCase = fs.readFileSync(files[i].slice(0, -10) + '.after.md').toString().trim()

        if (!beforeTestCase) continue
        console.log('Testing: ' + files[i])
        console.log(ReadmeInjector.transform(beforeTestCase, 'git+demo$demo'))
        expect(ReadmeInjector.transform(beforeTestCase, 'git+demo$demo')).toBe(afterTestCase)
        console.log(files[i] + ' passing')
      }

      return done()
    })
  })
})
