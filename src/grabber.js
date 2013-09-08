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
var moment  = require('moment');

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
 * @param options
 *        - urls      The urls to visit: [url1, url2, ...]
 *        - selenium  The selenium server url
 *        - dir       The directory where to save screenshots
 *        - filter    The browser matrix filter, specify a browser id, like `IE6`
 * @param callback  The callback for completion
 */
function grab(options, callback) {
  var urls     = options.urls;
  var selenium = options.selenium;
  var dir      = options.dir;
  var filter   = options.browser || '*';
  var browser  = wd.remote(selenium);

  console.log('Setting up screenshots for the following url(s):\n  %s', urls.join('\n  '));

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

  if (filter !== '*') {
    matrix = matrix.filter(function(b) {return b.id === filter;});
  }

  var retries = 10;
  var start   = new Date();

  /**
   * Wait until the browser is ready, with all content loaded
   *
   * @param next
   */
  function wait(next) {
    browser.eval("document.readyState", function (err, result) {
      if (err) return console.error(err);

      var done = /loaded|complete/.test(result);

      if (done) {
        return next();
      }
      else {
        retries--;

        if (retries > 0) {
          return setTimeout(function () { wait(next); }, 500);
        }

        // ran out of retries
        next(new Error('DOM not loaded, no retries left; waited ' + moment.duration(new Date() - start).humanize()));
      }
    });
  }

  /**
   * Capture the screenshot
   *
   * @param env {Object}  The matrix entry to setup the browser
   * @param uri {URIjs}   The uri to visit
   * @param next {fn}     The callback
   */
  function capture(env, uri, next) {
    browser.takeScreenshot(function (err, base64bytes) {
      if (err) return next(err);

      var ctx = _.defaults({
        path: _s.slugify(uri.resource())
      }, env);

      var name = sprintf('%(path)s_on%(id)s.png', ctx);

      fs.writeFile(path.join(dir, name), new Buffer(base64bytes, 'base64'));

      next();
    });
  }

  function grabScreenshot(options, done) {
    var desired = {
      id:          options.id,
      browserName: options.browser,
      version:     options.version,
      platform:    options.os,
      tags:        ['paparazzi'],
      name:        'Screenshot for ' + options.id
    };

    function visitAndCapture(uri, next) {
      browser.get(uri.href(), function() {
        retries = 10;
        start   = new Date();

        async.series(
          [
            wait,
            function(next) {
              capture(options, uri, next);
            }
          ],
          next
        );
      });
    }

    browser.init(desired, function() {
      async.forEachSeries(
        urls.map(function(url) {return new URIjs(url);}),
        visitAndCapture,
        function(err) {
          if (err) console.error(err);
          browser.quit(done);
        }
      )
    });
  }

  mkdir(dir, function (err) {
    if (err) return callback(err);

    async.forEachSeries(matrix, grabScreenshot, callback);
  });
}

module.exports.grab = grab;