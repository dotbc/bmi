const request = require('superagent');
const jsdom = require('jsdom');
const cookieJar = jsdom.createCookieJar(); 

function mapProperties(url, json, window, $) {
  for (var key in json) {
    
    if ( ! json.hasOwnProperty(key)) continue // skip this property

    if (json[key] === 'url') {
      json[key] = url
    } else if (typeof json[key] == "object" && json[key] !== null) {
      
      var selector = json[key].selector
      var op = json[key].op || (selector !== undefined ? 'text' : undefined)
      var node = selector ? $(selector) : $;

      switch (op) {
        case 'aggregate':
          var objects = []
          for (var i = 0; i < node.length; i++) {
            var structure = Object.assign({}, json[key].aggregate)
            var newRoot = $(node[i])
            mapProperties(url, structure, window, newRoot.find.bind(newRoot))
            objects.push(structure)
          }
          json[key] = objects
          break
        case 'attr':
          json[key] = node.attr(json[key].attr)
          break
        case 'func':
          json[key] = json[key].func(window, node);
          break;
        case 'text':
          json[key] = node.text().trim()
          break;
        default:
          mapProperties(url, json[key], window, $);
          break;
      }

    }
  }
}

var cookieString, cookieDate;

function ensureCookies (cb) {
  
  // Re-establish our cookie-based session every 10 min to ensure we don't time out
  if (cookieDate + 1000 * 60 * 10 < Date.now()) {
    cookieString = null;
  }

  if (!cookieString) {
    var request = require('request');
    request.post({
      url: 'http://repertoire.bmi.com/DisclaimerProcess.asp',
      form: {
        'Submit2': 'Accept'
      }
    }, function (error, response, body) {
      cookieString = response.headers['set-cookie'].join(';');
      cookieDate = Date.now();
      request.get({
        url: 'http://repertoire.bmi.com/getinput.asp?ReadDisclaimer=Y&typeofsearch=title&incWriters=True&incPublishers=True&incArtists=&SearchFor=eagle&incAltTitles=',
        headers: {
          'Cookie': cookieString
        }
      }, function (error, response, body) {
        cb(null, cookieString);
      });
    });
  } else {
    cb(null, cookieString);
  }
}

module.exports.process = function process (url, json, cb) {

  ensureCookies((err, cookieString) => {
    if (err) return cb(err);

    jsdom.env({
      url: url,
      headers: {
        'Cookie': cookieString
      },
      cookieJar: cookieJar,
      scripts: ["http://code.jquery.com/jquery.js"],
      done: function (err, window) {
        if (err) {
          return cb(err);
        }

        mapProperties(url, json, window, window.$);

        cb(null, json);
      }
    })

  });
  
};