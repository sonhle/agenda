'use strict';

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

var debug = require('debug')('agenda:start');

var _require = require('../utils'),
    processJobs = _require.processJobs;
/**
 * Starts processing jobs using processJobs() methods, storing an interval ID
 * This method will only resolve if a db has been set up beforehand.
 * @name Agenda#start
 * @function
 * @returns {Promise}
 */


module.exports =
/*#__PURE__*/
_asyncToGenerator(
/*#__PURE__*/
regeneratorRuntime.mark(function _callee() {
  return regeneratorRuntime.wrap(function _callee$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          if (!this._processInterval) {
            _context.next = 3;
            break;
          }

          debug('Agenda.start was already called, ignoring');
          return _context.abrupt("return", this._ready);

        case 3:
          _context.next = 5;
          return this._ready;

        case 5:
          debug('Agenda.start called, creating interval to call processJobs every [%dms]', this._processEvery);
          this._processInterval = setInterval(processJobs.bind(this), this._processEvery);
          process.nextTick(processJobs.bind(this));

        case 8:
        case "end":
          return _context.stop();
      }
    }
  }, _callee, this);
}));