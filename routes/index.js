const express = require('express');
const router = express.Router();

const request = require('request');

const xpath = require('xpath');
const dom = require('xmldom').DOMParser;

const RSS = require('rss');

router.get('/', function (req, res, next) {

  const url = 'http://www.andrzejrysuje.pl/wordpress/feed/';

  request(url, function (error, response, xml) {
    if (!error) {
      const doc = new dom().parseFromString(xml);
      const select = xpath.useNamespaces({ 'content': 'http://purl.org/rss/1.0/modules/content/' });
      const nodes = select('//content:encoded', doc);

      const feed = new RSS({
        title: 'Andrzej Rysuje',
        site_url: 'http://www.andrzejrysuje.pl',
        image_url: 'http://www.andrzejrysuje.pl/assets/img/logo.png',
        ttl: '5'
      });

      const imgEx = /src="([^"]*)"/;
      const altEx = /alt="([^"]*)"/;

      for (var i = 0, len = nodes.length; i < len; i++) {
        var data = nodes[i].firstChild.data;

        var altMatch = altEx.exec(data);
        var imgMatch = imgEx.exec(data);
        if (imgMatch !== null && altMatch !== null) {
          feed.item({
            title: altMatch[1],
            url: imgMatch[1]
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
