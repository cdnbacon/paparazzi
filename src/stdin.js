'use strict';

var Q     = require('q');
var split = require('split');

/**
 * Returns all urls (line by line) from stdio
 *
 * @param stream optional ReadableStream, defaults to stdio
 *
 * @returns {promised([url1, url2])}
 */
function getUrls(stream) {
  stream = stream || process.stdin;

  var deferred = Q.defer();

  var urls = [];

  stream
    .pipe(split())
    .on('data', function (line) {
      if (line) {
        urls.push(line);
      }
    })
    .on('end', function(){
      deferred.resolve(urls);
    })
    .on('error', function(err){
      deferred.reject(err);
    })
    .resume();

  return deferred.promise;
}

module.exports.getUrls = getUrls;