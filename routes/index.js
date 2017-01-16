var express = require('express');
var router = express.Router();

var request = require('request');

var xpath = require('xpath');
var dom = require('xmldom').DOMParser;

var RSS = require('rss');

router.get('/', function (req, res, next) {

  var url = 'http://www.andrzejrysuje.pl/wordpress/feed/';

  request(url, function (error, response, xml) {
    if (!error) {
      var doc = new dom().parseFromString(xml);
      var select = xpath.useNamespaces({ 'content': 'http://purl.org/rss/1.0/modules/content/' });
      var nodes = select('//content:encoded', doc);
      console.log('nodes.length: ' + nodes.length);

      var feed = new RSS({
        title: 'Andrzej Rysuje',
        site_url: 'http://www.andrzejrysuje.pl',
        image_url: 'http://www.andrzejrysuje.pl/assets/img/logo.png',
        ttl: '5'
      });

      var imgEx = /src="([^"]*)"/;
      var altEx = /alt="([^"]*)"/;

      for (var i = 0, len = nodes.length; i < len; i++) {
        var data = nodes[i].firstChild.data;

        var altMatch = altEx.exec(data);
        var imgMatch = imgEx.exec(data);
        if (imgMatch !== null && altMatch !== null) {
          console.log('img: ' + imgMatch[1]);
          console.log('alt: ' + altMatch[1]);

          feed.item({
            title: altMatch,
            url: imgMatch
          });
        }

      }

      res.set('Content-Type', 'text/xml');
      res.send(feed.xml());
    } else {
      res.status(404);
      res.send('Problem with ' + url);
    }
  });
});

module.exports = router;
