'use strict';
/**
 * Given a job, turn it into an object we can store in Mongo
 * @name Job#toJSON
 * @function
 * @returns {Object} json object from Job
 */

module.exports = function () {
  var self = this;
  var attrs = self.attrs || {};
  var result = {};

  for (var prop in attrs) {
    if ({}.hasOwnProperty.call(attrs, prop)) {
      result[prop] = attrs[prop];
    }
  }

  var dates = ['lastRunAt', 'lastFinishedAt', 'nextRunAt', 'failedAt', 'lockedAt'];
  dates.forEach(function (d) {
    if (result[d]) {
      result[d] = new Date(result[d]);
    }
  });
  return result;
};