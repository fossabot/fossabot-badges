var GitHubApi = require('github')
var ReadmeInjector = require('./readme.js')
var fs = require('fs')

var github = new GitHubApi({
  protocol: 'https',
  headers: {
    'user-agent': 'fossabot-badges'
  },
  Promise: require('bluebird'),
  timeout: 5000
})

var auth_default

try {
  auth_default = JSON.parse(fs.readFileSync('.fossabot').toString())
} catch (e) {
  console.log('Invalid default auth configured: ' + e.message)
}

var GithubClient = {
  parseGithubParts: function (locator) {
    var match = locator.match(/github.com\/([^\/]+)\/([A-Za-z0-9_.-]+)/i)
    if (!match) throw new Error('Invalid github locator')
    return {
      owner: match[1],
      repo: match[2]
    }
  },
  getClient: function (auth) {
  	var client = github
  	if (auth) {
  		client.authenticate(auth)
  	} else if (auth_default) {
  		github.authenticate(auth_default)
  	}
  	return client
  },
  makePR: function (locator, auth) {
    var client = GithubClient.getClient(auth)
    var base_repo_parts = GithubClient.parseGithubParts(locator)
    return Promise.resolve().then(function () {
      if (auth) {
        github.authenticate(auth)
      }
      // fork it into our master fossabot account
      return client.repos.fork(base_repo_parts).then(function (repo) {
        return {
          owner: repo.data.owner.login,
          repo: repo.data.name,
          ref: repo.data.default_branch
        }
      })
    }).then(function (repo_parts) {
      return client.repos.getReadme(repo_parts).then(function (readme) {
        if (!readme) throw new Error('No readme found')
        var newReadmeContents = ReadmeInjector.transform(new Buffer(readme.data.content, 'base64').toString('ascii'), locator)
        return client.repos.updateFile({
          owner: repo_parts.owner,
          repo: repo_parts.repo,
          path: readme.data.path,
          message: 'Add license scan report and status',
          content: new Buffer(newReadmeContents).toString('base64'),
          sha: readme.data.sha
        })
      }).then(function () {
        return client.pullRequests.create({
          owner: base_repo_parts.owner,
          repo: base_repo_parts.repo,
          head: (auth ? auth.username : auth_default.username) + ':' + repo_parts.ref,
          base: repo_parts.ref,
          title: 'Add license scan report and status',
          body: 'Your FOSSA integration was successful!\n\n\
Attached in this PR is a badge and license report to track scan status in your README.\n\n\
Below are docs for integrating FOSSA license checks into your CI:\n\n\
- [CircleCI](http://fossa.io/docs/integrating-tools/circleci/)\n-[TravisCI](http://fossa.io/docs/integrating-tools/travisci/)\n-[Jenkins](https://github.com/fossas/fossa-jenkins-plugin)\n-[Other](https://github.com/fossas/license-cli)'
        }).then(function (pull_request) {
          return pull_request.data.number
        })
      })
    })
  },
  updatePR: function (locator, number, auth) {
    var client = GithubClient.getClient(auth)
    var base_repo_parts = GithubClient.parseGithubParts(locator)
    return client.issues.createComment({
      owner: base_repo_parts.owner,
      repo: base_repo_parts.repo,
      number: number,
      body: 'Your license scan is passing -- congrats!\n\nYour badge status is now updated and ready to merge:\n\n' + ReadmeInjector.getBadgeCode(locator, 'shield', 'markdown')
    })
  }
}

module.exports = GithubClient
