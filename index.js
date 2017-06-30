/*
 * fossabot badge --repo github.com/webpack/webpack
 * fossabot status --repo github.com/webpack/webpack --pr 32
 */

var GithubClient = require('./src/pullrequest.js')

var locator = 'git+github.com/fossas/badge-tester'
GithubClient.makePR(locator).then(function (number) {
  return GithubClient.updatePR(locator, number)
}, function (err) {
  console.log(err.stack)
})
