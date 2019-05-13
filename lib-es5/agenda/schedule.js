'use strict';

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

var debug = require('debug')('agenda:schedule');
/**
 * Schedule a job or jobs at a specific time
 * @name Agenda#schedule
 * @function
 * @param {String} when when the job gets run
 * @param {Array<String>} names array of job names to run
 * @param {Object} data data to send to job
 * @returns {Promise<Job|Job[]>} job or jobs created
 */


module.exports = function (when, names, data) {
  var self = this;
  /**
   * Internal method that creates a job with given date
   * @param {String} when when the job gets run
   * @param {String} name of job to run
   * @param {Object} data data to send to job
   * @returns {Job} instance of new job
   */

  var createJob =
  /*#__PURE__*/
  function () {
    var _ref = _asyncToGenerator(
    /*#__PURE__*/
    regeneratorRuntime.mark(function _callee(when, name, data) {
      var job;
      return regeneratorRuntime.wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              job = self.create(name, data);
              _context.next = 3;
              return job.schedule(when).save();

            case 3:
              return _context.abrupt("return", job);

            case 4:
            case "end":
              return _context.stop();
          }
        }
      }, _callee);
    }));

    return function createJob(_x, _x2, _x3) {
      return _ref.apply(this, arguments);
    };
  }();
  /**
   * Internal helper method that calls createJob on a names array
   * @param {String} when when the job gets run
   * @param {*} names of jobs to run
   * @param {Object} data data to send to job
   * @returns {Array<Job>} jobs that were created
   */


  var createJobs =
  /*#__PURE__*/
  function () {
    var _ref2 = _asyncToGenerator(
    /*#__PURE__*/
    regeneratorRuntime.mark(function _callee2(when, names, data) {
      var jobs;
      return regeneratorRuntime.wrap(function _callee2$(_context2) {
        while (1) {
          switch (_context2.prev = _context2.next) {
            case 0:
              _context2.prev = 0;
              _context2.next = 3;
              return Promise.all(names.map(function (name) {
                return createJob(when, name, data);
              }));

            case 3:
              jobs = _context2.sent;
              debug('Agenda.schedule()::createJobs() -> all jobs created successfully');
              return _context2.abrupt("return", jobs);

            case 8:
              _context2.prev = 8;
              _context2.t0 = _context2["catch"](0);
              debug('Agenda.schedule()::createJobs() -> error creating one or more of the jobs');
              throw _context2.t0;

            case 12:
            case "end":
              return _context2.stop();
          }
        }
      }, _callee2, null, [[0, 8]]);
    }));

    return function createJobs(_x4, _x5, _x6) {
      return _ref2.apply(this, arguments);
    };
  }();

  if (typeof names === 'string' || names instanceof String) {
    debug('Agenda.schedule(%s, %O, [%O], cb)', when, names);
    return createJob(when, names, data);
  }

  if (Array.isArray(names)) {
    debug('Agenda.schedule(%s, %O, [%O])', when, names);
    return createJobs(when, names, data);
  }
};