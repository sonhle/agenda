'use strict';

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

var debug = require('debug')('agenda:purge');
/**
 * Removes all jobs from queue
 * @name Agenda#purge
 * @function
 * @returns {Promise} resolved when job cancelling fails or passes
 */


module.exports =
/*#__PURE__*/
_asyncToGenerator(
/*#__PURE__*/
regeneratorRuntime.mark(function _callee() {
  var definedNames;
  return regeneratorRuntime.wrap(function _callee$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          // @NOTE: Only use after defining your jobs
          definedNames = Object.keys(this._definitions);
          debug('Agenda.purge(%o)', definedNames);
          return _context.abrupt("return", this.cancel({
            name: {
              $not: {
                $in: definedNames
              }
            }
          }));

        case 3:
        case "end":
          return _context.stop();
      }
    }
  }, _callee, this);
}));