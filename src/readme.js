// Parse README markdown files and inject a license scan badge
// Does not support non-markdown readmes

var ReadmeInjector = {
  transform: function (readme, locator) {
    // if (!readme) throw new Error('No README specified; create one first.')
    // if (readme.indexOf('FOSSA Status') != -1 || readme.indexOf('fossa.io') != -1) {
    //   throw new Error('FOSSA badge already exists in README.')
    // }
    readme = ReadmeInjector.insertShield(readme, locator)
    // readme = ReadmeInjector.insertLargeBadge(readme, locator);
    return readme
  },
  insertShield: function (txt, locator) {
    var matchers = [
  		/*
				Find a linked badge or badge list and append the shield
				Supports all sorts of mixed markdown badge formats, including linked, unlinked and variable defs
			*/
	    {
	    	search: /((\[?!(\[[^\]]+\]){1,2}\]?[\(\[][^\)\]]+[\)\]]{1,2}(\([^\)]+\))?\s?)+)/i,
	    	type: 'markdown'
	    }
    	// html - Unlike markdown badges, this requires more than one image link side by side to match.
    	// title -
    		/*
			As a last resort if no badges are found, find the first h1/h2
			title in the readme and insert the badge underneath
		 */
    ]

    var match
    for (var i = 0; i < matchers.length; i++) {
    	match = txt.match(matchers[i].search)
    	if (match) {
	      return txt.slice(0, match.index + match[0].length) +
	    			ReadmeInjector.getBadgeCode(locator, 'small', matchers[i].type || 'markdown') +
	    			txt.slice(match.index + match[0].length)
	    }
    }

    return txt // no updates if README is empty or no insert strategy is found
  },
  insertLargeBadge: function (txt, locator) {
    var searchLicenseSection = /[ #]+licen(c|s)e(.+|)(\n|\b)[^#]+/ig // note hash might match in section link
    var badgeCode = ReadmeInjector.getBadgeCode(locator, 'large', 'markdown')

    if (searchLicenseSection.match(txt)) {
			// if theres a section of the readme that talks about the license, append inside
    } else {
			// otherwise, create the section and append the large badge
      txt += '\n\n## License\n' + badgeCode
    }
    return txt
  },
  getBadgeCode: function (locator, type, format) {
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
