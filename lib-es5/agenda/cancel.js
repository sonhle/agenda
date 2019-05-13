'use strict';

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

var debug = require('debug')('agenda:cancel');
/**
 * Cancels any jobs matching the passed MongoDB query, and removes them from the database.
 * @name Agenda#cancel
 * @function
 * @param {Object} query MongoDB query to use when cancelling
 * @caller client code, Agenda.purge(), Job.remove()
 * @returns {Promise<Number>} A promise that contains the number of removed documents when fulfilled.
 */


module.exports =
/*#__PURE__*/
function () {
  var _ref = _asyncToGenerator(
  /*#__PURE__*/
  regeneratorRuntime.mark(function _callee(query) {
    var _ref2, result;

    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            debug('attempting to cancel all Agenda jobs', query);
            _context.prev = 1;
            _context.next = 4;
            return this._collection.deleteMany(query);

          case 4:
            _ref2 = _context.sent;
            result = _ref2.result;
            debug('%s jobs cancelled', result.n);
            return _context.abrupt("return", result.n);

          case 10:
            _context.prev = 10;
            _context.t0 = _context["catch"](1);
            debug('error trying to delete jobs from MongoDB');
            throw _context.t0;

          case 14:
          case "end":
            return _context.stop();
        }
      }
    }, _callee, this, [[1, 10]]);
  }));

  return function (_x) {
    return _ref.apply(this, arguments);
  };
}();