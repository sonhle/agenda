'use strict';

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

var debug = require('debug')('agenda:every');
/**
 * Creates a scheduled job with given interval and name/names of the job to run
 * @name Agenda#every
 * @function
 * @param {String|Number} interval - run every X interval
 * @param {String|Array<String>} names - String or strings of jobs to schedule
 * @param {Object} [data] - data to run for job
 * @param {Object} [options] - options to run job for
 * @returns {Promise} Job/s created. Resolves when schedule fails or passes
 */


module.exports =
/*#__PURE__*/
function () {
  var _ref = _asyncToGenerator(
  /*#__PURE__*/
  regeneratorRuntime.mark(function _callee2(interval, names, data, options) {
    var _this = this;

    var createJob, createJobs, jobs, _jobs;

    return regeneratorRuntime.wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            /**
             * Internal method to setup job that gets run every interval
             * @param {Number} interval run every X interval
             * @param {String} name String job to schedule
             * @param {Object} data data to run for job
             * @param {Object} options options to run job for
             * @returns {Job} instance of job
             */
            createJob =
            /*#__PURE__*/
            function () {
              var _ref2 = _asyncToGenerator(
              /*#__PURE__*/
              regeneratorRuntime.mark(function _callee(interval, name, data, options) {
                var job;
                return regeneratorRuntime.wrap(function _callee$(_context) {
                  while (1) {
                    switch (_context.prev = _context.next) {
                      case 0:
                        job = _this.create(name, data);
                        job.attrs.type = 'single';
                        job.repeatEvery(interval, options);
                        job.computeNextRunAt();
                        _context.next = 6;
                        return job.save();

                      case 6:
                        return _context.abrupt("return", job);

                      case 7:
                      case "end":
                        return _context.stop();
                    }
                  }
                }, _callee);
              }));

              return function createJob(_x5, _x6, _x7, _x8) {
                return _ref2.apply(this, arguments);
              };
            }();
            /**
             * Internal helper method that uses createJob to create jobs for an array of names
             * @param {Number} interval run every X interval
             * @param {Array<String>} names Strings of jobs to schedule
             * @param {Object} data data to run for job
             * @param {Object} options options to run job for
             * @returns {Array<Job>} array of jobs created
             */


            createJobs = function createJobs(interval, names, data, options) {
              try {
                var jobs = names.map(function (name) {
                  return createJob(interval, name, data, options);
                });
                debug('every() -> all jobs created successfully');
                return Promise.all(jobs);
              } catch (err) {
                // @TODO: catch - ignore :O
                debug('every() -> error creating one or more of the jobs');
              }
            };

            if (!(typeof names === 'string' || names instanceof String)) {
              _context2.next = 8;
              break;
            }

            debug('Agenda.every(%s, %O, %O)', interval, names, options);
            _context2.next = 6;
            return createJob(interval, names, data, options);

          case 6:
            jobs = _context2.sent;
            return _context2.abrupt("return", jobs);

          case 8:
            if (!Array.isArray(names)) {
              _context2.next = 14;
              break;
            }

            debug('Agenda.every(%s, %s, %O)', interval, names, options);
            _context2.next = 12;
            return createJobs(interval, names, data, options);

          case 12:
            _jobs = _context2.sent;
            return _context2.abrupt("return", _jobs);

          case 14:
          case "end":
            return _context2.stop();
        }
      }
    }, _callee2);
  }));

  return function (_x, _x2, _x3, _x4) {
    return _ref.apply(this, arguments);
  };
}();