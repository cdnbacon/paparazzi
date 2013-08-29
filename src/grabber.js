'use strict';

var _       = require('underscore');
var _s      = require('underscore.string');
var wd      = require('wd');
var fs      = require('fs');
var URIjs   = require('URIjs');
var async   = require('async');
var sprintf = require('sprintf').sprintf;
var path    = require('path');
var mkdirp  = require('mkdirp');

/**
 * Ensures a directory always exists, and calls `callback` once done
 *
 * @param dir       the path to ensure
 * @param callback  fn(err)
 */
function mkdir(dir, callback) {
  var exists = fs.exists || path.exists;

  exists(dir, function(yes) {
    if (yes) return callback();

    mkdirp(dir, parseInt('0777', 8), callback);
  });
}

/**
 * Launches each browser in the matrix, visits the web page, grabs the screenshot and saves it
 *
 * @param url       The url to visit
 * @param selenium  The selenium server url
 * @param dir       The directory where to save screenshots
 * @param callback  The callback for completion
 */
function grab(url, selenium, dir, callback) {
  var browser = wd.remote(selenium);
  var uri = new URIjs(url);

  browser.on('status', function(info){
    console.log('\x1b[36m%s\x1b[0m', info);
  });

  browser.on('command', function(meth, path, data){
    console.log(' > \x1b[33m%s\x1b[0m: %s', meth, path, data || '');
  });

  var matrix = [
    // IE
    {id: 'IE10',    os: 'Windows 8',  browser: 'iexplore', version: '10'},
    {id: 'IE9',     os: 'Windows 7',  browser: 'iexplore', version: '9'},
    {id: 'IE8',     os: 'Windows XP', browser: 'iexplore', version: '8'},
    {id: 'IE7',     os: 'Windows XP', browser: 'iexplore', version: '7'},
    {id: 'IE6',     os: 'Windows XP', browser: 'iexplore', version: '6'},
    // Chrome
    {id: 'Chrome',  os: 'Windows 7',  browser: 'googlechrome', version: ''},
    // Safari
    {id: 'Safari5', os: 'Mac 10.6',   browser: 'safari', version: '5'},
    {id: 'Safari6', os: 'Mac 10.8',   browser: 'safari', version: '6'}
  ];

  function grabScreenshot(env, done) {
    var desired = {
      id:          env.id,
      browserName: env.browser,
      version:     env.version,
      platform:    env.os,
      tags:        ['examples'],
      name:        'This is an example test'
    };

    browser.init(desired, function() {
      browser.get(uri.href(), function() {
        browser.takeScreenshot(function (err, base64bytes) {
          if (err) console.log(err);

          if (!err) {
            var ctx = _.defaults(env, {
              hostname: uri.hostname(),
              path: _s.slugify(uri.resource())
            });

            var name = sprintf('%(hostname)s_%(path)s_on%(id)s.png', ctx);

            fs.writeFile(path.join(dir, name), new Buffer(base64bytes, 'base64'));
          }

          browser.quit(done);
        });
      });
    });
  }

  mkdir(dir, function (err) {
    if (err) return callback(err);

    async.forEachSeries(matrix, grabScreenshot, callback);
  });
}

module.exports.grab = grab;