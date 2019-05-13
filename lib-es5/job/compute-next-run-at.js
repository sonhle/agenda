'use strict';

var humanInterval = require('human-interval');

var _require = require('cron'),
    CronTime = _require.CronTime;

var moment = require('moment-timezone');

var date = require('date.js');

var debug = require('debug')('agenda:job');
/**
 * Internal method used to compute next time a job should run and sets the proper values
 * @name Job#computeNextRunAt
 * @function
 * @returns {exports} instance of Job instance
 */


module.exports = function () {
  var _this = this;

  var interval = this.attrs.repeatInterval;
  var timezone = this.attrs.repeatTimezone;
  var repeatAt = this.attrs.repeatAt;
  this.attrs.nextRunAt = undefined;

  var dateForTimezone = function dateForTimezone(date) {
    date = moment(date);

    if (timezone !== null) {
      date.tz(timezone);
    }

    return date;
  };
  /**
   * Internal method that computes the interval
   * @returns {undefined}
   */


  var computeFromInterval = function computeFromInterval() {
    debug('[%s:%s] computing next run via interval [%s]', _this.attrs.name, _this.attrs._id, interval);
    var lastRun = _this.attrs.lastRunAt || new Date();
    lastRun = dateForTimezone(lastRun);

    try {
      var cronTime = new CronTime(interval);

      var nextDate = cronTime._getNextDateFrom(lastRun);

      if (nextDate.valueOf() === lastRun.valueOf()) {
        // Handle cronTime giving back the same date for the next run time
        nextDate = cronTime._getNextDateFrom(dateForTimezone(new Date(lastRun.valueOf() + 1000)));
      }

      _this.attrs.nextRunAt = nextDate;
      debug('[%s:%s] nextRunAt set to [%s]', _this.attrs.name, _this.attrs._id, _this.attrs.nextRunAt.toISOString());
    } catch (e) {
      // Nope, humanInterval then!
      try {
        if (!_this.attrs.lastRunAt && humanInterval(interval)) {
          _this.attrs.nextRunAt = lastRun.valueOf();
          debug('[%s:%s] nextRunAt set to [%s]', _this.attrs.name, _this.attrs._id, _this.attrs.nextRunAt.toISOString());
        } else {
          _this.attrs.nextRunAt = lastRun.valueOf() + humanInterval(interval);
          debug('[%s:%s] nextRunAt set to [%s]', _this.attrs.name, _this.attrs._id, _this.attrs.nextRunAt.toISOString());
        }
      } catch (e) {}
    } finally {
      if (isNaN(_this.attrs.nextRunAt)) {
        _this.attrs.nextRunAt = undefined;
        debug('[%s:%s] failed to calculate nextRunAt due to invalid repeat interval', _this.attrs.name, _this.attrs._id);

        _this.fail('failed to calculate nextRunAt due to invalid repeat interval');
      }
    }
  };
  /**
   * Internal method to compute next run time from the repeat string
   * @returns {undefined}
   */


  function computeFromRepeatAt() {
    var lastRun = this.attrs.lastRunAt || new Date();
    var nextDate = date(repeatAt).valueOf(); // If you do not specify offset date for below test it will fail for ms

    var offset = Date.now();

    if (offset === date(repeatAt, offset).valueOf()) {
      this.attrs.nextRunAt = undefined;
      debug('[%s:%s] failed to calculate repeatAt due to invalid format', this.attrs.name, this.attrs._id);
      this.fail('failed to calculate repeatAt time due to invalid format');
    } else if (nextDate.valueOf() === lastRun.valueOf()) {
      this.attrs.nextRunAt = date('tomorrow at ', repeatAt);
      debug('[%s:%s] nextRunAt set to [%s]', this.attrs.name, this.attrs._id, this.attrs.nextRunAt.toISOString());
    } else {
      this.attrs.nextRunAt = date(repeatAt);
      debug('[%s:%s] nextRunAt set to [%s]', this.attrs.name, this.attrs._id, this.attrs.nextRunAt.toISOString());
    }
  }

  if (interval) {
    computeFromInterval.call(this);
  } else if (repeatAt) {
    computeFromRepeatAt.call(this);
  }

  return this;
};