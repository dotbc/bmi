const bmi = require('./lib/bmi');
const debug = require('debug')('bmi-plugin');
const getTopMedia = require('./lib/getTopMedia');
const request = require('superagent');
const _ = require('lodash');

var artistCache = {};

class BmiPlugin {

  search (entityType, query, cb) {

    debug(`performing ${entityType} search w query ${query}`);

    if (entityType === 'artist') {

      return bmi.artist(query, (err, results) => {
        if (err) return cb(err);

        var artists;
        if (results.singleArtist.name !== "") {
          artists = [results.singleArtist];
        } else {
          artists = results.artist || results.artists;
        }
        _.each(artists, function(item) {
          item.humanhref = item.href = item.link;
        });

        debug(`found ${artists.length} artists`);

        return cb(null, artists);
      });
    } else if (entityType === 'work') {
      return bmi.title(query, (err, results) => {
        if (err) return cb(err);

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
      return bmi.artistSingle(entity.link, (err, results) => {
        if (err) return cb(err);

        var artist = results.singleArtist;
        artistCache[entity.link] = artist;
        return cb(null, getTopMedia(artist, {}));
      });
    }

  }

}

module.exports = BmiPlugin;