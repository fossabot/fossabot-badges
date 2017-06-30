// Parse README markdown files and inject a license scan badge
// Does not support non-markdown readmes

var ReadmeInjector = {
  transform: function (readme, locator) {
    // if (!readme) throw new Error('No README specified; create one first.')
    if (readme.indexOf('FOSSA Status') != -1 || readme.indexOf('fossa.io') != -1) {
      throw new Error('FOSSA badge already exists in README.')
    }
    readme = ReadmeInjector.insertShield(readme, locator)
    readme = ReadmeInjector.insertLargeBadge(readme, locator)
    return readme.trim()
  },
  insertShield: function (txt, locator) {
    var matchers = [
      /*
        Find a linked badge or badge list AFTER ANY HEADER and append the shield
        Supports all sorts of mixed markdown badge formats, including linked, unlinked and variable defs
      */
      {
        search: /#+.+\s+((\[?!(\[[^\]]+\]){1,2}\]?[\(\[][^\)\]]+[\)\]]{1,2}(\([^\)]+\))?\s?)+)/i,
        type: 'markdown'
      },
      // html - Unlike markdown badges, this requires more than one image link side by side to match.
      {
        search: /(<a[^>]+>(\s+)?<img[^>]+\\?>(\s+)?<\/a>\s+?){2,}/i,
        type: 'html'
      },
      /*
        Search again for badges, but without the header requirement
      */
      {
        search: /((\[?!(\[[^\]]+\]){1,2}\]?[\(\[][^\)\]]+[\)\]]{1,2}(\([^\)]+\))?\s?)+)/i,
        type: 'markdown'
      },
      // title -
      /*
        As a last resort if no badges are found, find the first h1/h2
        title in the readme and insert the badge underneath
       */
      {
        search: /^#{1,2}[^#\n]+\n/im,
        type: 'markdown',
        spacing: 2
      }
    ]

    var match
    for (var i = 0; i < matchers.length; i++) {
      match = txt.match(matchers[i].search)
      if (match) {
        return txt.slice(0, match.index + match[0].length) +
          ReadmeInjector.getBadgeCode(locator, 'small', matchers[i].type || 'markdown') + '\n'.repeat(matchers[i].spacing || 1) +
          txt.slice(match.index + match[0].length)
      }
    }

    return ReadmeInjector.getBadgeCode(locator, 'small', 'markdown') + '\n\n' + txt // finally, just dump it at the front
  },
  insertLargeBadge: function (txt, locator) {
    var searchLicenseSection = /(\n[ #]+(.+)?licen(c|s).+[\s\S]+?)(\n#|$)/i // note hash might match in section link
    var badgeCode = ReadmeInjector.getBadgeCode(locator, 'large', 'markdown')
    var match = txt.match(searchLicenseSection)
    if (match) {
      // if theres a section of the readme that talks about the license, append inside
      return txt.slice(0, match.index + match[1].length) + '\n\n' +
        ReadmeInjector.getBadgeCode(locator, 'large', 'markdown') + '\n' +
        txt.slice(match.index + match[1].length)
    } else {
      // otherwise, create the section and append the large badge
      txt += '\n\n## License\n' + badgeCode
    }
    return txt
  },
  getBadgeCode: function (locator, type, format) {
    if (!type) type = 'markdown'
    if (!format) type = 'small'

    var svgLink = 'https://app.fossa.io/api/projects/' + encodeURIComponent(locator) + '.svg?type=' + type
    var browserLink = 'https://app.fossa.io/projects/' + encodeURIComponent(locator) + '?ref=badge_' + type

    switch (format) {
      case 'markdown':
        return '[![FOSSA Status](' + svgLink + ')](' + browserLink + ')'
      case 'html':
        return '<a href="' + browserLink + '" alt="FOSSA Status"><img src="' + svgLink + '"/></a>'
      default:
        return 'http://app.fossa.io/api/projects/' + encodeURIComponent(locator) + '.svg'
    }
  }
}

module.exports = ReadmeInjector
