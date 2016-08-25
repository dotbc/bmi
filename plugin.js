const debug = require('debug')('bmi-plugin');
const getTopMedia = require('./lib/getTopMedia');
const request = require('superagent');
const _ = require('lodash');

const BASE_URI = 'https://scraper.seeddevs.com/bmi-';

var artistCache = {};

class BmiPlugin {

  search (entityType, query, cb) {

    debug(`performing ${entityType} search w query ${query}`);

    if (entityType === 'artist') {
      return request.get(`${BASE_URI}artist?name=${encodeURIComponent(query)}`, (err, res) => {
        if (err) return cb(err);

        let results = res.body;

        // Cherry-pick out just the artists
        var artists;
        if (results.singleArtist.name !== "") {
          artists = [results.singleArtist];
        } else {
          artists = results.artists;
        }
        _.each(artists, function(item) {
          item.humanhref = item.href = item.link;
        });
        debug(`found ${artists.length} artists`);
        return cb(null, artists);
      });
    } else if (entityType === 'work') {
      return request.get(`${BASE_URI}title?name=${encodeURIComponent(query)}`, (err, res) => {

        let results = res.body;

        var titles = results.titles;
        _.each(titles, function(item, index) {
          item.name = item.title;
          item.humanhref = item.href = item.link;
          var writers = results.titleData[index].writers;
          item.artist = writers.length > 0 ? writers[0].name : '';
          item.workId = 'BMI #' + item.workId;
        });
        return cb(null, titles);
      });
    }

    return cb(new Error('entity type not supported by spotify search plugin'));
  }

  getDetails (entity, cb) {

    if (entity.titles) {
      return cb(null, getTopMedia(entity, {}));
    } else if (artistCache[entity.link]) {
      return cb(null, getTopMedia(artistCache[entity.link], {}));
    } else {
      var searchUrl = `${BASE_URI}artist-single?url=${encodeURIComponent(entity.link)}`;
      return request.get(searchUrl, function(err, res) {
        if (err) return cb(err);
        let results = res.body;
        var artist = results.singleArtist;
        artistCache[entity.link] = artist;
        return cb(null, getTopMedia(artist, {}));
      });
    }

  }

}

module.exports = BmiPlugin;