// Readme parser

// 1. check for other badges via markdown
// 2. check for other titl
// 3.
// 3. check for title

// license bdge

// cehck for license declaration
// #+( )?(license|license).+(#\b)

 // if license declaration doens't exist, append at end

var ReadmeInjector = {
	transform: function (readme, locator) {
		if(!readme) throw new Error("No README specified; create one first.")
		if(readme.indexOf("FOSSA Status") != -1 || readme.indexOf("fossa.io") != -1) {
			throw new Error("FOSSA badge already exists in README.")
		}

	},
	insertShield: function (txt, locator) {
		var searchMarkdownBadgeList;
		if () {

		}

		var searchHtmlBadgeList;
		if () {
			// find list and append HTML badge
		}

		var searchTitle;
		if () {
			// add below title
		}
		return txt; // no updates if README is empty
	},
	insertLargeBadge: function (txt, locator) {
		var searchLicenseSection = /[ #]+licen(c|s)e(.+|)(\n|\b)[^#]+/ig
		var badgeCode = ReadmeInjector.getBadgeCode(locator, 'large', 'markdown')

		if(searchLicenseSection.match(txt)) {
			
		} else {
			txt += '\n\n## License\n' + badgeCode
		}
		return txt;
	},
	getBadgeCode: function(locator, type, format) {
		var svgLink = 'https://app.fossa.io/api/projects/' + encodeURIComponent(locator) + '.svg?type=' + type
    let browserLink = 'https://app.fossa.io/projects/' + encodeURIComponent(locator) + '?ref=badge_' + type

    switch (format) {
      case 'markdown':
        return '[![FOSSA Status](' + svgLink ')](' + browserLink')'
      case 'html':
        return '<a href="' + browserLink + '" alt="FOSSA Status"><img src="' + svgLink + '"/></a>'
      default:
        return 'http://app.fossa.io/api/projects/' + encodeURIComponent(locator) + '.svg'
    }
	}
}

module.exports = ReadmeInjector;