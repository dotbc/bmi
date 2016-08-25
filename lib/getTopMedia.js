const path = require('path');
const _ = require('lodash');

module.exports = function (entity, results) {
    var result = {};
  result.topTracks = [];
  result.topAlbums = [];
  result.image = path.join(process.cwd(), 'public/images/icon-bmi-circle.png');
  result.secondaryText = 'BMI Artist';

  if (entity.titles) {
    var tracks = _.map(entity.titles, function(track){
      return {
        name: track.title,
        image: 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7',
        href: track.link
      };
    });
    result.topTracks = tracks;
  }

  return result;
};
