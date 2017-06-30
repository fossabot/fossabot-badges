/*
 * fossabot badge --repo github.com/webpack/webpack
 * fossabot status --repo github.com/webpack/webpack --pr 32
 */

var GithubClient = require('./src/pullrequest.js')

GithubClient.makePR('asd').then(console.log, function (err) {
  console.log(err.stack)
})
