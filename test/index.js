const bmi = require('../lib/bmi');

require('should');

describe('bmi', function () {

  describe('artist', function () {

    it('should return a list of artists matching name parameter passed in', function (done) {

      bmi.artist('a', function (err, results) {
        if (err) return done(err);

        (results.artist instanceof Array).should.eql(true);
        (results.singleArtist instanceof Object).should.eql(true);
        (results.singleArtist.titles instanceof Array).should.eql(true);

        results.artist.forEach((artist) => {

          const firstLetter = artist.name[0].toLowerCase();

          firstLetter.should.eql('a');

        });

        results.singleArtist.titles.forEach((title) => {

          const firstLetter = title.title[0].toLowerCase();

          firstLetter.should.eql('a');

        });

        done();
      });

    });
    
  });

  describe('artistSingle', function () {

    it('should return an artists matching name parameter passed in', function (done) {

      const artistLink = 'http://repertoire.bmi.com/writer.asp?blnWriter=True&blnPublisher=True&blnArtist=True&page=1&fromrow=1&torow=25&querytype=WriterID&cae=0&affiliation=NA&keyid=886520&keyname=AKIRA';

      bmi.artistSingle(artistLink, function (err, results) {
        if (err) return done(err);

        (results.artists instanceof Array).should.eql(true);
        (results.singleArtist instanceof Object).should.eql(true);
        (results.singleArtist.titles instanceof Array).should.eql(true);
        
        done();
      });

    });
    
  });

  describe('title', function () {

    it('should return a list of titles matching name parameter passed in', function (done) {
      
      bmi.title('a', function (err, results) {
        if (err) return done(err);

        (results.titles instanceof Array).should.eql(true);
        (results.titleData instanceof Array).should.eql(true);

        results.titles.forEach((title) => {

          const firstLetter = title.title[0].toLowerCase();

          firstLetter.should.eql('a');

        });

        done();
      });

    });
    
  });

});