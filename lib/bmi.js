const scraper = require('./scraper');
const capitalize = require('string-capitalize-name');

var bmiLinkFetcher = function (window, node) {
  return 'http://repertoire.bmi.com/' + node.attr('href');
};

var bmiNameCapitalizer = function(window, node) {
  return capitalize(node.text().replace(/\s+/g, ' ').trim());
}

var workIdFetcher = function (window, node) {
  return node.text().replace(/\s+/g, ' ').trim().replace('BMI Work # ', '');
};

function getArtistStructure () {
  return {
    selector: 'table:last tr:not(:first)',
    op: 'aggregate',
    aggregate: {
      name: {
        selector: 'td:nth(1) a',
        op: 'func',
        func: bmiNameCapitalizer
      },
      link: {
        selector: 'td:nth(1) a',
        op: 'func',
        func: bmiLinkFetcher
      }
    }
  };
}

const getSingleArtistStructure = function() {
    return {
      name: {
        selector: '.column-header',
        op: 'func',
        func: bmiNameCapitalizer
      },
      link: 'url',
      titles: {
        selector: 'table:first tr:not(:first)',
        op: 'aggregate',
        aggregate: {
          title: {
            selector: 'a',
            op: 'func',
            func: bmiNameCapitalizer
          },
          workId: {
            selector: '.right',
            op: 'func',
            func: workIdFetcher
          },
          link: {
            selector: 'a',
            op: 'func',
            func: bmiLinkFetcher
          }
        }
      }
    }
  };


module.exports.artist = function (query, cb) {

  const url = `http://repertoire.bmi.com/artistSearch.asp?blnWriter=True&blnPublisher=True&blnArtist=True&blnAltTitles=True&queryType=ArtistName&page=1&keyname=${encodeURIComponent(query)}&keyid=0&fromrow=1&torow=25`;

  scraper.process(url, { artist: getArtistStructure(), singleArtist: getSingleArtistStructure() }, cb);

};

module.exports.artistSingle = function (url, cb) {

  const structureMap = {
    artists: {
      selector: 'table:last tr:not(:first)',
      op: 'aggregate',
      aggregate: {
        name: {
          selector: 'td:nth(1) a',
          op: 'func',
          func: bmiNameCapitalizer
        },
        link: {
          selector: 'td:nth(1) a',
          op: 'func',
          func: bmiLinkFetcher
        }
      }
    },
    singleArtist: getSingleArtistStructure()
  };

  scraper.process(url, structureMap, cb);

};

module.exports.title = function (query, cb) {

  const url = `http://repertoire.bmi.com/TitleSearch.asp?querytype=WorkName&page=1&fromrow=1&torow=25&keyname=${encodeURIComponent(query)}&blnWriter=True&blnPublisher=False&blnArtist=True&blnAltTitles=True'`;

  const structureMap = {
    titles: {
      selector: 'table:has(.TitleLink)',
      op: 'aggregate',
      aggregate: {
        title: {
          selector: '.TitleLink',
          op: 'func',
          func: bmiNameCapitalizer
        },
        workId: {
          selector: '.work_number:first',
          op: 'func',
          func: workIdFetcher
        },
        link: {
          selector: '.TitleLink',
          op: 'func',
          func: bmiLinkFetcher
        }
      }
    },
    // Because of the layout of the page, it's hard to nest all data together
    titleData: {
      selector: '.table-responsive',
      op: 'aggregate',
      aggregate: {
        writers: {
          selector: 'table:nth(0) tr:not(:first)',
          op: 'aggregate',
          aggregate: {
            name: {
              selector: '.entity',
              op: 'func',
              func: bmiNameCapitalizer
            },
            link: {
              selector: '.entity a',
              op: 'func',
              func: bmiLinkFetcher
            },
            affiliation: {
              selector: '.affiliation',
              op: 'text'
            },
            cae_ipi: {
              selector: '.cae_ipi',
              op: 'text'
            }
          }
        },
        artists: {
          selector: 'table:nth(1) tr:not(:first)',
          op: 'aggregate',
          aggregate: {
            name: {
              selector: 'a',
              op: 'func',
              func: bmiNameCapitalizer
            },
            link: {
              selector: 'a',
              op: 'func',
              func: bmiLinkFetcher
            }
          }
        }
      }
    }
  };
  
  scraper.process(url, structureMap, cb);

};